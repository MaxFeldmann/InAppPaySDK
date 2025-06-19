const admin = require("firebase-admin");
// Initialize Firebase Admin
admin.initializeApp();

// Export all handlers
const productHandlers = require("./handlers/products");
const purchaseHandlers = require("./handlers/purchases");
const subscriptionHandlers = require("./handlers/subscriptions");
const analyticsHandlers = require("./handlers/analytics");

// Export all functions
module.exports = {
  // Product functions
  addProduct: productHandlers.addProduct,
  updateProduct: productHandlers.updateProduct,
  deleteProduct: productHandlers.deleteProduct,
  getProducts: productHandlers.getProducts,

  // Purchase functions
  processPurchase: purchaseHandlers.processPurchase,
  checkUserPurchased: purchaseHandlers.checkUserPurchased,
  getPurchases: purchaseHandlers.getPurchases,
  validateItemForPurchase: purchaseHandlers.validateItemForPurchase,

  // Subscription functions
  checkUserSubscribed: subscriptionHandlers.checkUserSubscribed,
  getSubscriptions: subscriptionHandlers.getSubscriptions,

  // Analytics functions
  getUserSummary: analyticsHandlers.getUserSummary,
  getProjectAnalytics: analyticsHandlers.getProjectAnalytics,
  initializeProject: analyticsHandlers.initializeProject,
};
