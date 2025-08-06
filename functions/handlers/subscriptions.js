const functions = require("firebase-functions");
const cors = require("cors")({origin: true});

const {securityMiddleware} = require("../middleware/security");
const {validateRequest, validateProjectExists} = require("../utils/validation");
const {sendResponse, handleError} = require("../utils/response");
const {getSubscriptionsRef, db} = require("../utils/database");

// Check User Subscribed
exports.checkUserSubscribed = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    securityMiddleware(req, res, async () => {
      try {
        if (!validateRequest(req, res, "checkUserSubscribed")) {
          return;
        }

        const {projectName, productId, userId} = req.body;

        const projectExists = await validateProjectExists(projectName);
        if (!projectExists) {
          return sendResponse(res, false, "Project not found", null, 404);
        }

        const subscriptionRef = getSubscriptionsRef(projectName);
        const subscriptionQuery = await subscriptionRef.orderByChild("userId").
            equalTo(userId).once("value");

        if (!subscriptionQuery.exists()) {
          return sendResponse(res, true, "User subscription status retrieved", {
            subscribed: false,
            subscriptionData: null,
          });
        }

        const subscriptions = subscriptionQuery.val();
        const userSubscription = Object.values(subscriptions).find((sub) =>
          sub.productId === productId && sub.status === "active",
        );

        if (!userSubscription) {
          return sendResponse(res, true, "User subscription status retrieved", {
            subscribed: false,
            subscriptionData: null,
          });
        }

        const now = Date.now();
        const endDate = userSubscription.endDate;

        if (endDate < now) {
          const subscriptionKey = Object.keys(subscriptions).find((key) =>
            subscriptions[key].productId === productId &&
                  subscriptions[key].status === "active",
          );

          if (subscriptionKey) {
            const subscriptionUpdateRef =
            db.ref(`projects/${projectName}/subscriptions/${subscriptionKey}`);
            await subscriptionUpdateRef.transaction((currentData) => {
              if (currentData && currentData.status === "active") {
                return {
                  ...currentData,
                  status: "expired",
                  updatedAt: db.ServerValue.TIMESTAMP,
                };
              }
              return currentData;
            });
          }

          return sendResponse(res, true, "User subscription status retrieved", {
            subscribed: false,
            subscriptionData: {
              status: "expired",
              expiredDate: endDate,
            },
          });
        }

        const subscriptionData = {
          transactionId: userSubscription.transactionId,
          productId: userSubscription.productId,
          amount: userSubscription.amount,
          currency: userSubscription.currency,
          paymentMethod: userSubscription.paymentMethod,
          startDate: userSubscription.startDate,
          endDate: userSubscription.endDate,
          status: userSubscription.status,
          daysRemaining: Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)),
        };

        sendResponse(res, true, "User subscription status retrieved", {
          subscribed: true,
          subscriptionData,
        });
      } catch (error) {
        handleError(res, error, "Error checking user subscription");
      }
    });
  });
});

// Get all subscriptions for a project
exports.getSubscriptions = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    securityMiddleware(req, res, async () => {
      try {
        if (!validateRequest(req, res, "getSubscriptions")) return;

        const {projectName, userId} = req.body;

        const projectExists = await validateProjectExists(projectName);
        if (!projectExists) {
          return sendResponse(res, false, "Project not found", null, 404);
        }

        const subscriptionsRef = getSubscriptionsRef(projectName);
        let query = subscriptionsRef;

        // If userId is provided, filter by userId
        if (userId) {
          query = subscriptionsRef.orderByChild("userId").equalTo(userId);
        }

        const snapshot = await query.once("value");

        const subscriptions = snapshot.exists() ?
        Object.entries(snapshot.val()).map(([id, item]) => ({id, ...item})) :
        [];

        sendResponse(res,
            true,
            "Subscriptions retrieved successfully",
            subscriptions);
      } catch (error) {
        handleError(res, error, "Error getting subscriptions");
      }
    });
  });
});
