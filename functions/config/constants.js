// Constants
const PRODUCT_TYPES = ["subscription", "one-time", "repurchase"];
const PAYMENT_METHODS = ["card", "paypal"];

// Validation schemas
const validationSchemas = {
  addProduct: ["projectName", "name", "type", "price"],
  updateProduct: ["projectName", "productId", "updates"],
  deleteProduct: ["projectName", "productId"],
  validateItemForPurchase: ["projectName", "productId", "userId"],
  processPurchase: ["projectName", "userId", "productId", "paymentMethod"],
  checkUserPurchased: ["projectName", "productId", "userId"],
  checkUserSubscribed: ["projectName", "productId", "userId"],
  getUserSummary: ["projectName", "userId"],
  cancelPurchase: ["projectName", "transactionId", "userId"],
  getProjectAnalytics: ["projectName"],
  getProducts: ["projectName"],
  getPurchases: ["projectName"],
  getSubscriptions: ["projectName"],
  initializeProject: ["projectName"],
};

module.exports = {PRODUCT_TYPES,
  PAYMENT_METHODS,
  validationSchemas,
};
