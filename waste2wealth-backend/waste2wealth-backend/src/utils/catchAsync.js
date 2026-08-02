/**
 * Wraps an async controller/middleware function so any rejected promise
 * is forwarded to Express's error handler via next(err), instead of
 * requiring a try/catch block in every single controller.
 */
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
