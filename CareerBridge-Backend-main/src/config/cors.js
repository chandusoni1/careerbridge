const env = require('./env');

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    const allowedOrigins = Array.isArray(env.CORS_ORIGIN)
      ? env.CORS_ORIGIN
      : [env.CORS_ORIGIN];

    const isAllowed = allowedOrigins.some((allowed) => {
      // Direct match or trailing slash normalization
      return (
        origin === allowed ||
        origin.replace(/\/$/, '') === allowed.replace(/\/$/, '')
      );
    });

    if (isAllowed || env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked request from origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

module.exports = corsOptions;
