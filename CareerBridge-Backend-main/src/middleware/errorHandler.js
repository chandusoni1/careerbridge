const env = require('../config/env');
const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(
    `[${req.method}] ${req.originalUrl} - ${statusCode} - ${message}`
  );
  if (err.stack && env.NODE_ENV !== 'production') {
    logger.debug(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
