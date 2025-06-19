const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});

const {securityMiddleware} = require("../middleware/security");
const {validateRequest,
  validateProjectExists,
  validateProductExists,
  validatePaymentMethod} = require("../utils/validation");
const {sendSuccessResponse,
  sendErrorResponse,
  sendResponse,
  handleError} = require("../utils/response");
const {getPurchasesRef,
  getSubscriptionsRef,
  getProductRef} = require("../utils/database");
const {generateTransactionId,
  processPayment,
  maskCardNumber,
  calculateEndDate} = require("../services/payment");
const updateUserPurchaseHistory = require("../services/user");

// Process Purchase with unified atomic transaction
exports.processPurchase = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    securityMiddleware(req, res, async () => {
      try {
        if (!validateRequest(req, res, "processPurchase")) return;

        const {projectName, userId, productId, paymentMethod,
          cardData, paypalData} = req.body;

        // Validate project exists
        const projectExists = await validateProjectExists(projectName);
        if (!projectExists) {
          return sendErrorResponse(res,
              "Project not found",
              "PROJECT_NOT_FOUND",
              404);
        }

        // Validate product exists
        const productValidation = await validateProductExists(projectName,
            productId);
        if (!productValidation.exists) {
          return sendErrorResponse(res,
              "Product not found",
              "PRODUCT_NOT_FOUND",
              404);
        }

        const actualProductData = productValidation.data;

        // Double-check product is active
        if (actualProductData.status !== "active") {
          return sendErrorResponse(res,
              "Product is not available for purchase",
              "PRODUCT_INACTIVE",
              400);
        }

        // Validate payment data
        if (paymentMethod === "card" && !cardData) {
          return sendErrorResponse(res,
              "Card data required for card payments",
              "MISSING_CARD_DATA",
              400);
        }

        if (paymentMethod === "paypal" && !paypalData) {
          return sendErrorResponse(res,
              "PayPal data required for PayPal payments",
              "MISSING_PAYPAL_DATA",
              400);
        }

        if (!validatePaymentMethod(paymentMethod)) {
          return sendErrorResponse(res,
              "Invalid payment method",
              "INVALID_PAYMENT_METHOD",
              400);
        }

        // Get user's country
        const userCountry = (req && req.country) ? req.country : "US";

        // Generate transaction ID upfront
        const transactionId = generateTransactionId();

        // Single atomic transaction for purchase validation and creation
        try {
          // Get references using utility functions
          const purchasesRef = getPurchasesRef(projectName);
          const subscriptionsRef = getSubscriptionsRef(projectName);

          // Use the parent ref for the atomic transaction
          const projectRef = getProductRef(projectName);

          const transactionResult = await projectRef.transaction(
              (projectData) => {
                if (!projectData) {
                  projectData = {};
                }

                // Initialize collections if they don't exist
                if (!projectData.purchases) projectData.purchases = {};
                if (!projectData.subscriptions) projectData.subscriptions = {};

                // Check for existing purchases based on product type
                if (actualProductData.type === "one-time") {
                  // Check if user already has this one-time item
                  const existingPurchase = Object.values(projectData.purchases)
                      .find((purchase) =>
                        purchase.userId === userId &&
                    purchase.productId === productId &&
                    purchase.status === "completed",
                      );

                  if (existingPurchase) {
                    // Signal abortion by returning null
                    return null;
                  }
                } else if (actualProductData.type === "subscription") {
                  // Check if user already has active subscription
                  const existingSubscription = Object.values(projectData
                      .subscriptions)
                      .find((sub) =>
                        sub.userId === userId &&
                    sub.productId === productId &&
                    sub.status === "active",
                      );

                  if (existingSubscription) {
                    // Signal abortion by returning null
                    return null;
                  }
                }

                const timestamp = admin.database.ServerValue.TIMESTAMP;
                const currentTime = new Date();

                // Prepare base purchase data
                const basePurchaseData = {
                  userId,
                  productId,
                  productType: actualProductData.type,
                  transactionId,
                  status: "completed",
                  paymentMethod,
                  amount: actualProductData.price,
                  currency: "USD",
                  country: userCountry,
                  purchaseDate: currentTime.toISOString(),
                  purchaseTimestamp: timestamp,
                  createdAt: timestamp,
                  updatedAt: timestamp,
                };

                // Add payment-specific data
                if (paymentMethod === "card") {
                  basePurchaseData.cardLastFour = maskCardNumber(cardData
                      .cardNumber);
                  basePurchaseData.cardType = cardData.cardType || "unknown";
                } else if (paymentMethod === "paypal") {
                  basePurchaseData.paypalEmail = paypalData.email;
                }

                // Create purchase record using the utility function's push key
                const purchaseKey = purchasesRef.push().key;
                projectData.purchases[purchaseKey] = basePurchaseData;

                // Create subscription record if it's a subscription
                if (actualProductData.type === "subscription") {
                  const subscriptionData = {
                    userId,
                    productId,
                    transactionId,
                    status: "active",
                    paymentMethod,
                    amount: actualProductData.price,
                    currency: "USD",
                    country: userCountry,
                    startDate: timestamp,
                    endDate: calculateEndDate(actualProductData.frequency),
                    frequency: actualProductData.frequency,
                    createdAt: timestamp,
                    updatedAt: timestamp,
                  };

                  const subscriptionKey = subscriptionsRef.push().key;
                  projectData.subscriptions[subscriptionKey] = subscriptionData;
                }

                return projectData;
              });

          // Check if transaction was aborted
          if (!transactionResult.committed ||
            transactionResult.snapshot.val() === null) {
            const errorMessage = actualProductData.type === "one-time" ?
              "Product already purchased" :
              "User already has active subscription";
            const errorCode = actualProductData.type === "one-time" ?
              "ALREADY_PURCHASED" :
              "ALREADY_SUBSCRIBED";

            return sendErrorResponse(res, errorMessage, errorCode, 400);
          }
        } catch (error) {
          return sendErrorResponse(res,
              "Purchase validation failed",
              "VALIDATION_ERROR",
              500);
        }

        // Process payment after successful validation
        const paymentResult = await processPayment(paymentMethod, cardData,
            paypalData, actualProductData, userCountry);

        if (!paymentResult.success) {
          // TODO: Implement rollback mechanism for failed payments
          return sendErrorResponse(res,
              paymentResult.error,
              paymentResult.errorCode,
              400);
        }

        // Update payment ID in the purchase record
        await getPurchasesRef(projectName)
            .orderByChild("transactionId")
            .equalTo(transactionId)
            .once("value")
            .then((snapshot) => {
              if (snapshot.exists()) {
                const purchaseKey = Object.keys(snapshot.val())[0];
                return getPurchasesRef(projectName).child(purchaseKey)
                    .update({paymentId: paymentResult.paymentId});
              }
            });

        // Update user's purchase history
        await updateUserPurchaseHistory(projectName,
            userId,
            productId,
            actualProductData.type,
            userCountry,
            transactionId);

        const currentTime = new Date();
        sendSuccessResponse(res, "Purchase completed successfully", {
          transactionId,
          productId,
          productType: actualProductData.type,
          amount: actualProductData.price,
          currency: "USD",
          paymentMethod,
          status: "completed",
          purchaseDate: currentTime.toISOString(),
          country: userCountry,
        });
      } catch (error) {
        handleError(res, error, "Error processing purchase");
      }
    });
  });
});

// Check User Purchased
exports.checkUserPurchased = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    securityMiddleware(req, res, async () => {
      try {
        if (!validateRequest(req, res, "checkUserPurchased")) {
          return;
        }

        const {projectName, productId, userId} = req.body;

        // Validate project exists
        const projectExists = await validateProjectExists(projectName);
        if (!projectExists) {
          return sendResponse(res, false, "Project not found", null, 404);
        }

        // Check if user has purchased this product
        const purchaseRef = getPurchasesRef(projectName);
        const purchaseQuery = await purchaseRef.orderByChild("userId").
            equalTo(userId).once("value");

        if (!purchaseQuery.exists()) {
          return sendResponse(res, true, "User purchase status retrieved", {
            purchased: false,
            purchaseData: null,
          });
        }

        const purchases = purchaseQuery.val();
        const userPurchase = Object.values(purchases).find((purchase) =>
          purchase.productId === productId && purchase.status === "completed",
        );

        if (!userPurchase) {
          return sendResponse(res, true, "User purchase status retrieved", {
            purchased: false,
            purchaseData: null,
          });
        }

        const purchaseData = {
          transactionId: userPurchase.transactionId,
          productId: userPurchase.productId,
          productType: userPurchase.productType,
          amount: userPurchase.amount,
          currency: userPurchase.currency,
          paymentMethod: userPurchase.paymentMethod,
          purchaseDate: userPurchase.purchaseDate,
          country: userPurchase.country,
          status: userPurchase.status,
          ...(userPurchase.cardLastFour &&
          {cardLastFour: userPurchase.cardLastFour}),
          ...(userPurchase.paypalEmail &&
          {paypalEmail: userPurchase.paypalEmail}),
        };

        sendResponse(res, true, "User purchase status retrieved", {
          purchased: true,
          purchaseData,
        });
      } catch (error) {
        handleError(res, error, "Error checking user purchase");
      }
    });
  });
});

// Get all purchases for a project
exports.getPurchases = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    securityMiddleware(req, res, async () => {
      try {
        if (!validateRequest(req, res, "getPurchases")) return;

        const {projectName, userId} = req.body;

        // Validate project exists
        const projectExists = await validateProjectExists(projectName);
        if (!projectExists) {
          return sendResponse(res, false, "Project not found", null, 404);
        }

        const purchasesRef = getPurchasesRef(projectName);
        let query = purchasesRef;

        // If userId is provided, filter by userId
        if (userId) {
          query = purchasesRef.orderByChild("userId").equalTo(userId);
        }

        const snapshot = await query.once("value");

        const purchases = snapshot.exists() ?
        Object.entries(snapshot.val()).map(([id, item]) => ({id, ...item})) :
        [];

        sendResponse(res, true, "Purchases retrieved successfully", purchases);
      } catch (error) {
        handleError(res, error, "Error getting purchases");
      }
    });
  });
});

// Validate Item for Purchase
exports.validateItemForPurchase = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    securityMiddleware(req, res, async () => {
      try {
        if (!validateRequest(req, res, "validateItemForPurchase")) return;

        const {projectName, productId, userId} = req.body;

        // Validate project exists
        const projectExists = await validateProjectExists(projectName);
        if (!projectExists) {
          return sendErrorResponse(res,
              "Project not found",
              "PROJECT_NOT_FOUND",
              404);
        }

        // Validate product exists and get product data
        const productValidation = await validateProductExists(projectName,
            productId);
        if (!productValidation.exists) {
          return sendErrorResponse(res,
              "Product not found",
              "PRODUCT_NOT_FOUND",
              404);
        }

        const productData = productValidation.data;

        // Check if product is active
        if (productData.status !== "active") {
          return sendErrorResponse(res,
              "Product is not available for purchase",
              "PRODUCT_INACTIVE",
              400);
        }

        // For one-time items, check if user already owns it
        if (productData.type === "one-time") {
          const purchaseRef = getPurchasesRef(projectName);
          const purchaseQuery = await purchaseRef.orderByChild("userId").
              equalTo(userId).once("value");

          if (purchaseQuery.exists()) {
            const purchases = purchaseQuery.val();
            const hasPurchased = Object.values(purchases).some((purchase) =>
              purchase.productId === productId &&
                purchase.status === "completed",
            );

            if (hasPurchased) {
              return sendErrorResponse(res,
                  "Product already purchased",
                  "ALREADY_PURCHASED",
                  400);
            }
          }
        }

        // For subscriptions, check if user has active subscription
        if (productData.type === "subscription") {
          const subscriptionRef = getSubscriptionsRef(projectName);
          const subscriptionQuery = await subscriptionRef.
              orderByChild("userId").equalTo(userId).once("value");

          if (subscriptionQuery.exists()) {
            const subscriptions = subscriptionQuery.val();
            const hasActiveSubscription = Object.values(subscriptions).
                some((sub) =>
                  sub.productId === productId && sub.status === "active",
                );

            if (hasActiveSubscription) {
              return sendErrorResponse(res,
                  "User already has active subscription",
                  "ALREADY_SUBSCRIBED",
                  400);
            }
          }
        }

        // Return product data for purchase
        sendSuccessResponse(res, "Product validation successful", {
          id: productId,
          type: productData.type,
          price: productData.price,
          name: productData.name,
          description: productData.description,
          frequency: productData.frequency || null,
          recurring: productData.recurring || false,
        });
      } catch (error) {
        sendErrorResponse(res, error, "INTERNAL_ERROR", 500);
      }
    });
  });
});
