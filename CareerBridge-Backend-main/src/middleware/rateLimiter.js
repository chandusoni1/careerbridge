const env = require('../config/env');
const ApiError = require('../utils/ApiError');

/**
 * In-memory sliding window rate limiter
 * @param {Object} options
 * @param {number} options.windowMs Window size in milliseconds (default 15 mins)
 * @param {number} options.max Maximum requests per window (default 1000)
 * @param {string} options.message Error message on limit exceeded
 */
const rateLimiter = ({
  windowMs = 15 * 60 * 1000,
  max = 2000,
  message = 'Too many requests from this IP, please try again later.',
} = {}) => {
  const requests = new Map();

  // Periodic cleanup every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of requests.entries()) {
      if (now - entry.startTime > windowMs) {
        requests.delete(ip);
      }
    }
  }, 5 * 60 * 1000).unref();

  return (req, res, next) => {
    // In development or test environments, completely bypass rate limiting
    if (process.env.NODE_ENV !== 'production' && env.NODE_ENV !== 'production') {
      return next();
    }

    const ip =
      req.ip ||
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      'unknown';

    // Loopback / localhost bypass
    if (
      ip === '::1' ||
      ip === '127.0.0.1' ||
      ip === '::ffff:127.0.0.1' ||
      ip.includes('127.0.0.1') ||
      ip === 'localhost'
    ) {
      return next();
    }

    const now = Date.now();
    const record = requests.get(ip);

    if (!record) {
      requests.set(ip, { count: 1, startTime: now });
      return next();
    }

    if (now - record.startTime > windowMs) {
      requests.set(ip, { count: 1, startTime: now });
      return next();
    }

    record.count += 1;
    if (record.count > max) {
      return next(new ApiError(429, message));
    }

    next();
  };
};

module.exports = rateLimiter;
