const http = require('http');
const app = require('./app');
const env = require('./config/env');
const connectDatabase = require('./config/database');
const { initSocket } = require('./services/socket.service');
const logger = require('./utils/logger');

const startServer = async () => {
  // Connect Database
  await connectDatabase();

  // Create HTTP Server
  const server = http.createServer(app);

  // Bind Socket.IO
  initSocket(server);

  // Listen
  server.listen(env.PORT, () => {
    logger.info(`🚀 CareerBridge Backend Running on Port ${env.PORT} [${env.NODE_ENV}]`);
    logger.info(`🔗 Live endpoint: http://localhost:${env.PORT}`);
  });

  // Graceful Shutdown
  const shutdown = (signal) => {
    logger.warn(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Promise Rejection:', reason);
  });
};

startServer();
