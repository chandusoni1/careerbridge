const logger = require('../utils/logger');

/**
 * Background / scheduled maintenance jobs
 */
const runCleanupJob = async () => {
  logger.info('Scheduled job: running periodic system health checks...');
  // Place periodic tasks here (e.g. archiving read notifications older than 30 days)
};

module.exports = {
  runCleanupJob,
};
