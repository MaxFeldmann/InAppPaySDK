// Helper function to generate transaction ID
const generateTransactionId = () => {
  return "txn_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
};

// Helper function to mask card number (get last 4 digits)
const maskCardNumber = (cardNumber) => {
  if (!cardNumber || cardNumber.length < 4) return "****";
  return cardNumber.slice(-4);
};

/**
 * @return {Promise<void>} Promise that resolves when update
 * is complete Processes payment for different payment
 * methods with comprehensive validation
 * @async
 * @function processPayment
 * @param {string} paymentMethod - The payment method to use
 * ('card' or 'paypal')
 * @param {Object} [cardData] - Credit card information
 * (required if paymentMethod is 'card')
 * @param {string} cardData.cardNumber - 16-digit card number (digits only)
 * @param {string} cardData.expiry - Card expiry date in MM/YY format
 * @param {string} cardData.cvv - 3 or 4 digit CVV code
 * @param {string} cardData.name - Cardholder name
 * @param {Object} [paypalData] - PayPal payment information
 * (required if paymentMethod is 'paypal')
 * @param {string} paypalData.email - Valid PayPal email address
 * @param {Object} [productData] - Product information for the purchase
 * @param {string} [userCountry] - User's country code (e.g., 'US', 'CA', 'GB')
 * @return {Promise<Object>} Payment result object
 * @return {boolean} returns.success - Whether the payment was successful
 * @return {string} [returns.paymentId] - Unique payment ID
 * (only present on success)
 * @return {string} [returns.method] - Payment method used
 * (only present on success)
 * @return {string} [returns.error] - Error message (only present on failure)
 * @return {string} [returns.errorCode] - Specific error code for handling
 * (only present on failure)
 *
 * @example
 * // Process card payment
 * const cardResult = await processPayment('card', {
 *   cardNumber: '1234567890123456',
 *   expiry: '12/25',
 *   cvv: '123',
 *   name: 'John Doe'
 * });
 *
 * @example
 * // Process PayPal payment with country
 * const paypalResult = await processPayment('paypal', null, {
 *   email: 'user@example.com'
 * }, null, 'US');
 *
 * @description
 * This function simulates payment processing with the following features:
 * - Validates card data format (16 digits, MM/YY expiry, 3-4 digit CVV)
 * - Validates PayPal email format
 * - Simulates processing delays (1s for card, 1.5s for PayPal)
 * - Returns structured response with success status and relevant data
 */
async function processPayment(paymentMethod, cardData, paypalData,
    productData, userCountry) {
  try {
    if (paymentMethod === "card") {
      if (!cardData || !cardData.cardNumber || !cardData.expiry ||
        !cardData.cvv || !cardData.name) {
        return {
          success: false,
          error: "Invalid card data - missing required fields",
          errorCode: "INVALID_CARD_DATA",
        };
      }

      if (cardData.cardNumber.length !== 16 ||
            !/^\d+$/.test(cardData.cardNumber)) {
        return {
          success: false,
          error: "Invalid card number format",
          errorCode: "INVALID_CARD_NUMBER",
        };
      }

      // Validate expiry date format (MM/YY)
      if (!/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
        return {
          success: false,
          error: "Invalid expiry date format",
          errorCode: "INVALID_EXPIRY_FORMAT",
        };
      }

      // Validate CVV
      if (!/^\d{3,4}$/.test(cardData.cvv)) {
        return {
          success: false,
          error: "Invalid CVV format",
          errorCode: "INVALID_CVV",
        };
      }

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return {
        success: true,
        paymentId: "pay_" + Date.now() + "_" +
            Math.random().toString(36).substr(2, 9),
        method: "card",
      };
    } else if (paymentMethod === "paypal") {
      if (!paypalData || !paypalData.email) {
        return {
          success: false,
          error: "PayPal email required",
          errorCode: "MISSING_PAYPAL_EMAIL",
        };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(paypalData.email)) {
        return {
          success: false,
          error: "Invalid PayPal email format",
          errorCode: "INVALID_PAYPAL_EMAIL",
        };
      }

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      return {
        success: true,
        paymentId: "pp_" + Date.now() + "_" +
            Math.random().toString(36).substr(2, 9),
        method: "paypal",
      };
    } else {
      return {
        success: false,
        error: "Unsupported payment method",
        errorCode: "UNSUPPORTED_PAYMENT_METHOD",
      };
    }
  } catch (error) {
    console.error("Payment processing error:", error);
    return {
      success: false,
      error: "Payment processing failed",
      errorCode: "PAYMENT_PROCESSING_ERROR",
    };
  }
}

/**
 * Calculates subscription end date based on billing frequency
 * @function calculateEndDate
 * @param {string} frequency - Billing frequency ('monthly', 'yearly', 'weekly')
 * @return {number} End date as Unix timestamp in milliseconds
 *
 * @example
 * // Get end date for monthly subscription
 * const monthlyEnd = calculateEndDate('monthly');
 * const endDate = new Date(monthlyEnd);
 *
 * @example
 * // Get end date for yearly subscription
 * const yearlyEnd = calculateEndDate('yearly');
 *
 * @description
 * Calculates subscription end dates by adding the appropriate
 * time period to the current date:
 * - 'monthly': adds 30 days
 * - 'yearly': adds 365 days
 * - 'weekly': adds 7 days
 * - Default fallback: 30 days for any unrecognized frequency
 *
 * Note: Monthly calculation uses 30 days which may not account
 * for months with different day counts.
 */
function calculateEndDate(frequency) {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  switch (frequency) {
    case "monthly":
      return now + (30 * oneDay);
    case "yearly":
      return now + (365 * oneDay); // Note: Doesn't account for leap years
    case "weekly":
      return now + (7 * oneDay);
    default:
      return now + (30 * oneDay); // Default to monthly
  }
}

module.exports = {generateTransactionId,
  maskCardNumber,
  processPayment,
  calculateEndDate};
