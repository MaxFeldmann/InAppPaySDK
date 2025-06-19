const admin = require("firebase-admin");
const db = admin.database();

// Database reference helpers
const getProjectRef = (projectName) => db.ref(`projects/${projectName}`);
const getProductRef = (projectName, productId) =>
  db.ref(`projects/${projectName}/products/${productId}`);
const getProductsRef = (projectName) =>
  db.ref(`projects/${projectName}/products`);
const getPurchasesRef = (projectName) =>
  db.ref(`projects/${projectName}/purchases`);
const getSubscriptionsRef = (projectName) =>
  db.ref(`projects/${projectName}/subscriptions`);
const getUserRef = (projectName, userId) =>
  db.ref(`projects/${projectName}/users/${userId}`);

module.exports = {db,
  getProductRef,
  getProjectRef,
  getProductsRef,
  getPurchasesRef,
  getSubscriptionsRef,
  getUserRef};
