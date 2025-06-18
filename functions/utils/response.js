// Standardized response helper
const sendResponse = (res, success, message, data = null, statusCode = 200) => {
  res.status(statusCode).json({
    success,
    message,
    ...(data && {data}),
    timestamp: new Date().toISOString(),
  });
};

// Centralized error handler
const handleError = (res, error, customMessage = null, statusCode = 500) => {
  console.error("Function error:", error);
  res.status(statusCode).json({
    success: false,
    error: customMessage || "Internal server error",
    errorCode: "INTERNAL_ERROR",
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === "development" && {details: error.message}),
  });
};

// Standardized response handlers
const sendSuccessResponse = (res, message, data = null, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    ...(data && {data}),
    timestamp: new Date().toISOString(),
  });
};

const sendErrorResponse = (res,
    error,
    errorCode,
    statusCode = 500,
    details = null) => {
  console.error(`Error [${errorCode}]:`, error);
  res.status(statusCode).json({
    success: false,
    error: typeof error === "string" ?
        error : error.message || "Internal server error",
    errorCode,
    statusCode,
    ...(details && process.env.NODE_ENV === "development" && {details}),
    timestamp: new Date().toISOString(),
  });
};

module.exports = {sendErrorResponse,
  sendResponse,
  sendSuccessResponse,
  handleError};
