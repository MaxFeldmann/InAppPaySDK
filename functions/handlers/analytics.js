const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});

const {securityMiddleware} = require("../middleware/security");
const {validateRequest, validateProjectExists} = require("../utils/validation");
const {sendResponse, handleError} = require("../utils/response");
const {getProjectRef, getPurchasesRef,
  getSubscriptionsRef, getProductsRef} = require("../utils/database");

// Get user purchase/subscription summary
exports.getUserSummary = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    securityMiddleware(req, res, async () => {
      try {
        if (!validateRequest(req, res, "getUserSummary")) return;

        const {projectName, userId} = req.body;

        // Validate project exists
        const projectExists = await validateProjectExists(projectName);
        if (!projectExists) {
          return sendResponse(res, false, "Project not found", null, 404);
        }

        // Get user's purchases and subscriptions concurrently
        const [purchaseQuery, subscriptionQuery] = await Promise.all([
          getPurchasesRef(projectName).orderByChild("userId").
              equalTo(userId).once("value"),
          getSubscriptionsRef(projectName).orderByChild("userId").
              equalTo(userId).once("value"),
        ]);

        const purchases = purchaseQuery.exists() ?
          Object.values(purchaseQuery.val()) : [];
        const subscriptions = subscriptionQuery.exists() ?
          Object.values(subscriptionQuery.val()) : [];

        const completedPurchases = purchases.
            filter((p) => p.status === "completed");
        const activeSubs = subscriptions.
            filter((sub) => sub.status === "active");

        const summaryData = {
          purchases: completedPurchases,
          subscriptions: activeSubs,
          totalPurchases: completedPurchases.length,
          activeSubscriptions: activeSubs.length,
        };

        sendResponse(res,
            true,
            "User summary retrieved successfully",
            summaryData);
      } catch (error) {
        handleError(res, error, "Error getting user summary");
      }
    });
  });
});

// Get project analytics
exports.getProjectAnalytics = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    securityMiddleware(req, res, async () => {
      try {
        if (!validateRequest(req, res, "getProjectAnalytics")) return;

        const {projectName, startDate, endDate} = req.body;

        // Validate project exists
        const projectExists = await validateProjectExists(projectName);
        if (!projectExists) {
          return sendResponse(res, false, "Project not found", null, 404);
        }

        // Get all data concurrently
        const [purchaseSnapshot, productSnapshot, subscriptionSnapshot] =
          await Promise.all([getPurchasesRef(projectName).once("value"),
            getProductsRef(projectName).once("value"),
            getSubscriptionsRef(projectName).once("value"),
          ]);

        const purchases = purchaseSnapshot.exists() ?
          Object.values(purchaseSnapshot.val()) : [];
        const products = productSnapshot.exists() ?
          Object.values(productSnapshot.val()) : [];
        const subscriptions = subscriptionSnapshot.exists() ?
          Object.values(subscriptionSnapshot.val()) : [];

        // Filter by date range if provided
        let filteredPurchases = purchases;
        if (startDate && endDate) {
          const start = new Date(startDate).getTime();
          const end = new Date(endDate).getTime();
          filteredPurchases = purchases.filter((purchase) => {
            const purchaseTime = new Date(purchase.purchaseDate).getTime();
            return purchaseTime >= start && purchaseTime <= end;
          });
        }

        // Calculate analytics
        const completedPurchases = filteredPurchases.filter((p) =>
          p.status === "completed");
        const totalRevenue = completedPurchases.reduce((sum, purchase) =>
          sum + (purchase.amount || 0), 0);
        const activeSubscriptions = subscriptions.filter((sub) =>
          sub.status === "active");

        // Revenue analytics
        const revenueByCountry = {};
        const revenueByPaymentMethod = {};
        const productRevenue = {};

        completedPurchases.forEach((purchase) => {
          const country = purchase.country || "Unknown";
          const method = purchase.paymentMethod || "Unknown";
          const productId = purchase.productId;
          const amount = purchase.amount || 0;

          revenueByCountry[country] = (revenueByCountry[country] || 0) + amount;
          revenueByPaymentMethod[method] =
          (revenueByPaymentMethod[method] || 0) + amount;
          productRevenue[productId] = (productRevenue[productId] || 0) + amount;
        });

        const analyticsData = {
          overview: {
            totalProducts: products.length,
            activeProducts: products.filter((p) => p.status ===
               "active").length,
            totalPurchases: completedPurchases.length,
            totalRevenue,
            activeSubscriptions: activeSubscriptions.length,
            averageOrderValue: completedPurchases.length > 0 ?
            Math.round((totalRevenue / completedPurchases.length) * 100) / 100 :
            0,
          },
          breakdown: {
            revenueByCountry,
            revenueByPaymentMethod,
            productRevenue,
          },
          dateRange: {
            startDate: startDate || null,
            endDate: endDate || null,
            filteredPurchases: completedPurchases.length,
          },
        };

        sendResponse(res,
            true,
            "Project analytics retrieved successfully",
            analyticsData);
      } catch (error) {
        handleError(res, error, "Error getting project analytics");
      }
    });
  });
});

// Initialize Project Function
exports.initializeProject = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    securityMiddleware(req, res, async () => {
      try {
        if (!validateRequest(req, res, "initializeProject")) return;

        const {projectName} = req.body;

        // Validate project name doesn't contain invalid characters
        const INVALID_CHARS = /[.#$[\]/]/;
        if (INVALID_CHARS.test(projectName)) {
          return sendResponse(res,
              false,
              "Project name cannot contain any of the" +
              "following characters: . # $ [ ] /",
              null,
              400);
        }

        const projectRef = getProjectRef(projectName);
        const timestamp = admin.database.ServerValue.TIMESTAMP;

        try {
        // Use transaction for atomic project initialization
          const transactionResult = await projectRef.
              transaction((currentData) => {
                if (currentData === null) {
                  // Create new project
                  return {
                    products: false,
                    purchases: false,
                    subscriptions: false,
                    users: false,
                    createdAt: timestamp,
                    updatedAt: timestamp,
                  };
                }
                // Project already exists, update timestamp
                return {
                  ...currentData,
                  updatedAt: timestamp,
                };
              });

          const responseData = {
            projectName,
            exists: !transactionResult.committed ||
            !!transactionResult.snapshot.val(),
            initialized: true,
          };

          sendResponse(res,
              true,
              "Project initialized successfully",
              responseData);
        } catch (error) {
          console.error("Database error during project initialization:", error);
          handleError(res,
              error,
              "Database error during project initialization");
        }
      } catch (error) {
        handleError(res, error, "Error initializing project");
      }
    });
  });
});
