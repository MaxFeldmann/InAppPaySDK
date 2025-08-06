const sendErrorResponse = require("../utils/response");

// Security middleware
const securityMiddleware = (req, res, next) => {
  res.set("X-Content-Type-Options", "nosniff");
  res.set("X-Frame-Options", "DENY");
  res.set("X-XSS-Protection", "1; mode=block");

  // Validate request size (1MB limit)
  if (req.get("content-length") > 1048576) {
    return sendErrorResponse(res,
        "Request too large",
        "REQUEST_TOO_LARGE",
        413);
  }

  next();
};

module.exports = {securityMiddleware};
