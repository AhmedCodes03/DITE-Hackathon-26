import { Sentry } from "../lib/sentry.js";

export function notFoundHandler(_req, res) {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
}

export function errorHandler(error, _req, res, _next) {
  Sentry.captureException(error);

  // Production logs only safe metadata; development logs full error details for debugging.
  if (process.env.NODE_ENV === "production") {
    console.error("Error:", {
      name: error?.name,
      message: error?.message,
      statusCode: error?.statusCode,
      code: error?.code
    });
  } else {
    console.error("Error:", error);
  }

  if (error.errors && Array.isArray(error.errors)) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Validation failed",
      errors: error.errors
    });
  }

  if (error.name === "MongoServerError" && error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return res.status(409).json({
      success: false,
      message: `Duplicate value for ${field}. This ${field} already exists.`
    });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal server error"
  });
}
