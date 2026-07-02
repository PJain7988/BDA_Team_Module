// backend/middleware/errorHandler.js
/**
 * Central error handling middleware
 * Provides structured, consistent error responses across the entire API
 */

/**
 * Custom Application Error class
 */
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle Mongoose CastError (invalid ObjectId)
 */
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}. Please provide a valid ID.`;
  return new AppError(message, 400, 'INVALID_ID');
};

/**
 * Handle Mongoose Duplicate Key Error
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || 'field';
  const value = err.keyValue ? err.keyValue[field] : '';
  const message = `Duplicate value for '${field}': "${value}". Please use a different value.`;
  return new AppError(message, 409, 'DUPLICATE_KEY');
};

/**
 * Handle Mongoose Validation Error
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Validation failed: ${errors.join('. ')}`;
  return new AppError(message, 422, 'VALIDATION_ERROR');
};

/**
 * Handle JWT Expired Error
 */
const handleJWTExpiredError = () =>
  new AppError('Your session has expired. Please log in again.', 401, 'TOKEN_EXPIRED');

/**
 * Handle Invalid JWT Error
 */
const handleJWTError = () =>
  new AppError('Invalid authentication token. Please log in again.', 401, 'INVALID_TOKEN');

/**
 * Send development error (full details)
 */
const sendDevError = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    code: err.code || 'INTERNAL_ERROR',
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

/**
 * Send production error (safe, user-facing)
 */
const sendProdError = (err, res) => {
  if (err.isOperational) {
    // Known, safe error
    res.status(err.statusCode).json({
      status: err.status,
      code: err.code || 'ERROR',
      message: err.message,
    });
  } else {
    // Unknown error - don't leak details
    console.error('💥 UNKNOWN ERROR:', err);
    res.status(500).json({
      status: 'error',
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred. Please try again later.',
    });
  }
};

/**
 * Main error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    sendDevError(err, res);
  } else {
    let error = { ...err, message: err.message, name: err.name };

    if (error.name === 'CastError') error = handleCastError(error);
    if (error.code === 11000) error = handleDuplicateKeyError(error);
    if (error.name === 'ValidationError') error = handleValidationError(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendProdError(error, res);
  }
};

/**
 * Not Found handler — convert unknown routes to AppError
 */
const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND'));
};

/**
 * Async wrapper to remove try/catch boilerplate from controllers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, notFound, asyncHandler, AppError };
