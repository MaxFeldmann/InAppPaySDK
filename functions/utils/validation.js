const {sendErrorResponse} = require("./response");
const {PRODUCT_TYPES,
  PAYMENT_METHODS,
  validationSchemas} = require("../config/constants");
const {getProjectRef, getProductRef} = require("../utils/database");

// Enhanced request validation
const validateRequest = (req, res, schemaName) => {
  if (req.method !== "POST") {
    sendErrorResponse(res, "Method not allowed", "METHOD_NOT_ALLOWED", 405);
    return false;
  }
  const requiredFields = validationSchemas[schemaName];
  if (!requiredFields) {
    sendErrorResponse(res, "Invalid validation schema", "INVALID_SCHEMA", 500);
    return false;
  }

  for (const field of requiredFields) {
    if (!req.body[field]) {
      sendErrorResponse(res,
          `Missing required field: ${field}`,
          "MISSING_FIELD",
          400);
      return false;
    }
  }
  return true;
};

// Validation helpers
const validateProductType = (type) => PRODUCT_TYPES.includes(type);
const validatePaymentMethod = (method) => PAYMENT_METHODS.includes(method);

// Helper function to validate project exists
const validateProjectExists = async (projectName) => {
  try {
    const projectRef = getProjectRef(projectName);
    const snapshot = await projectRef.once("value");
    return snapshot.exists();
  } catch (error) {
    console.error("Error checking project existence:", error);
    return false;
  }
};

// Helper function to validate product exists and get product data
const validateProductExists = async (projectName, productId) => {
  try {
    const productRef = getProductRef(projectName, productId);
    const snapshot = await productRef.once("value");
    if (snapshot.exists()) {
      return {exists: true, data: snapshot.val()};
    }
    return {exists: false, data: null};
  } catch (error) {
    console.error("Error checking product existence:", error);
    return {exists: false, data: null};
  }
};

module.exports = {validatePaymentMethod,
  validateProjectExists,
  validateProductExists,
  validateProductType,
  validateRequest};
