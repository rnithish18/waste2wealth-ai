/**
 * Custom operational error class.
 * Any error thrown with this class is trusted (known, handled) and its
 * message is safe to send to the client. Unknown errors are masked in prod.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
