// At the top of handlers/products.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});

const {securityMiddleware} = require("../middleware/security");
const {validateRequest, validateProductType, validateProductExists,
  validateProjectExists} = require("../utils/validation");
const {sendSuccessResponse, sendErrorResponse,
  sendResponse, handleError} = require("../utils/response");
const {getProductRef, getProductsRef} = require("../utils/database");

// Add/Update Product Function
exports.addProduct = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    securityMiddleware(req, res, async () => {
      try {
        if (!validateRequest(req, res, "addProduct")) return;
        const {projectName, name, type, price, description,
          frequency, recurring} = req.body;

        const projectExists = await validateProjectExists(projectName);
        if (!projectExists) {
          return sendErrorResponse(res,
              "Project not found",
              "PROJECT_NOT_FOUND",
              404);
        }

        const finalProductId = name;

        const productsRef = getProductsRef(projectName);
        const productRef = productsRef.child(finalProductId);
        const existingProduct = await productRef.once("value");

        if (existingProduct.exists()) {
          return sendErrorResponse(res,
              "Product with this ID already exists",
              "PRODUCT_EXISTS",
              400);
        }

        const parsedPrice = parseInt(price, 10);
        if (isNaN(parsedPrice) || parsedPrice <= 0) {
          return sendErrorResponse(res,
              "Price must be a positive number greater than 0",
              "INVALID_PRICE",
              400);
        }
        if (!validateProductType(type)) {
          return sendErrorResponse(res,
              "Invalid product type",
              "INVALID_TYPE",
              400);
        }

        const timestamp = admin.database.ServerValue.TIMESTAMP;
        const newProduct = {
          productId: finalProductId,
          name,
          type,
          price: parsedPrice,
          description: description || "",
          purchases: 0,
          status: "inactive",
          createdAt: timestamp,
          updatedAt: timestamp,
          ...(type === "subscription" && {
            frequency: frequency || "monthly",
            recurring: recurring || false,
          }),
        };

        await productRef.set(newProduct);

        sendSuccessResponse(res, "Product added successfully", {
          productId: finalProductId,
          firebaseKey: finalProductId,
          ...newProduct,
        }, 201);
      } catch (error) {
        sendErrorResponse(res, error, "INTERNAL_ERROR", 500);
      }
    });
  });
});

// Update Product Function
exports.updateProduct = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    securityMiddleware(req, res, async () => {
      try {
        if (!validateRequest(req, res, "updateProduct")) return;

        const {projectName, productId, updates} = req.body;

        const projectExists = await validateProjectExists(projectName);
        if (!projectExists) {
          return sendErrorResponse(res,
              "Project not found",
              "PROJECT_NOT_FOUND",
              404);
        }

        if (!updates || Object.keys(updates).length === 0) {
          return sendErrorResponse(res,
              "No updates provided",
              "NO_UPDATES",
              400);
        }

        const productValidation = await validateProductExists(projectName,
            productId);
        if (!productValidation.exists) {
          return sendErrorResponse(res,
              "Product not found",
              "PRODUCT_NOT_FOUND",
              404);
        }

        const productRef = getProductRef(projectName, productId);
        await productRef.transaction((currentData) => {
          if (currentData) {
            return {
              ...currentData,
              ...updates,
              updatedAt: admin.database.ServerValue.TIMESTAMP,
            };
          }
          return currentData;
        });

        sendSuccessResponse(res, "Product updated successfully");
      } catch (error) {
        sendErrorResponse(res, error, "INTERNAL_ERROR", 500);
      }
    });
  });
});

// Delete Product Function
exports.deleteProduct = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    securityMiddleware(req, res, async () => {
      try {
        if (!validateRequest(req, res, "deleteProduct")) return;

        const {projectName, productId} = req.body;

        const projectExists = await validateProjectExists(projectName);
        if (!projectExists) {
          return sendErrorResponse(res,
              "Project not found",
              "PROJECT_NOT_FOUND",
              404);
        }

        const productValidation = await validateProductExists(projectName,
            productId);
        if (!productValidation.exists) {
          return sendErrorResponse(res,
              "Product not found",
              "PRODUCT_NOT_FOUND",
              404);
        }

        const productRef = getProductRef(projectName, productId);
        await productRef.remove();

        sendSuccessResponse(res, "Product deleted successfully");
      } catch (error) {
        sendErrorResponse(res, error, "INTERNAL_ERROR", 500);
      }
    });
  });
});

// Get all products for a project
exports.getProducts = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    securityMiddleware(req, res, async () => {
      try {
        if (!validateRequest(req, res, "getProducts")) return;

        const {projectName} = req.body;

        const projectExists = await validateProjectExists(projectName);
        if (!projectExists) {
          return sendResponse(res, false, "Project not found", null, 404);
        }

        const productsRef = getProductsRef(projectName);
        const snapshot = await productsRef.once("value");

        const products = snapshot.exists() ?
        Object.entries(snapshot.val()).map(([id, item]) => ({id, ...item})) :
        [];

        sendResponse(res, true, "Products retrieved successfully", products);
      } catch (error) {
        handleError(res, error, "Error getting products");
      }
    });
  });
});
