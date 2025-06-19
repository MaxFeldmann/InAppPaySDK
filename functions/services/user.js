const admin = require("firebase-admin");
const {getUserRef} = require("../utils/database");

/**
 * Updates user's purchase history in Firebase Realtime Database with atomically
 * @async
 * @function updateUserPurchaseHistory
 * @param {string} projectName - Name of the project/application
 * @param {string} userId - Unique identifier for the user
 * @param {string} productId - Unique identifier for the purchased product
 * @param {string} productType - Type/category of the purchased product
 * @param {string} userCountry - User's country code (e.g., 'US', 'CA', 'GB')
 * @param {string} transactionId - Unique transaction identifier
 *
 * @example
 * // Update purchase history after successful payment
 * await updateUserPurchaseHistory(
 *   'myapp',
 *   'user123',
 *   'premium-plan',
 *   'subscription',
 *   'US',
 *   'pay_1234567890_abcdef123'
 * );
 *
 * @description
 * This function manages user purchase history with the following behavior:
 * - Creates new user document if user doesn't exist in database
 * - Appends new purchase to existing user's purchase history
 * - Increments total purchase counter
 * - Updates timestamps for tracking
 * - Handles errors gracefully without throwing (non-critical operation)
 * - Uses Firebase Admin SDK server timestamps for consistency
 *
 * Prerequisites:
 * - Firebase Admin SDK must be initialized
 * - Global variables 'db' (database reference) and 'admin' must be available
 * - Database structure follows: projects/{projectName}/users/{userId}
 *
 * @see {@link https://firebase.google.com/docs/database} Firebase Realtime Database documentation
 */
async function updateUserPurchaseHistory(projectName, userId, productId,
    productType, userCountry, transactionId) {
  try {
    // Input validation
    if (!projectName || !userId || !productId ||
        !productType || !transactionId || !userCountry) {
      throw new
      Error("Missing required parameters for purchase history update");
    }

    const userRef = getUserRef(projectName, userId);
    const timestamp = admin.database.ServerValue.TIMESTAMP;

    const purchaseEntry = {
      productId,
      productType,
      transactionId,
      userCountry,
      date: timestamp,
    };

    // Use transaction for atomic update
    await userRef.transaction((currentData) => {
      if (currentData === null) {
        // Create new user document
        return {
          userId,
          purchaseHistory: [purchaseEntry],
          totalPurchases: 1,
          createdAt: timestamp,
          updatedAt: timestamp,
        };
      } else {
        // Update existing user document
        const currentHistory = currentData.purchaseHistory || [];
        return {
          ...currentData,
          purchaseHistory: [...currentHistory, purchaseEntry],
          totalPurchases: (currentData.totalPurchases || 0) + 1,
          updatedAt: timestamp,
        };
      }
    });
  } catch (error) {
    console.error("Error updating user purchase history:", error);
    // Don't throw error as this is not critical for the purchase flow
  }
}

module.exports = updateUserPurchaseHistory;
