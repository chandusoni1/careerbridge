const ApiError = require('../utils/ApiError');

/**
 * Middleware factory for validating incoming request objects.
 * Accepts a validator function: (req) => { isValid: boolean, error?: string }
 */
const validateRequest = (validator) => {
  return (req, res, next) => {
    try {
      const result = validator(req);
      if (result && !result.isValid) {
        return next(ApiError.badRequest(result.error || 'Validation error'));
      }
      next();
    } catch (err) {
      next(ApiError.badRequest(err.message));
    }
  };
};

module.exports = validateRequest;
