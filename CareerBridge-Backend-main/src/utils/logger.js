const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const formatTimestamp = () => new Date().toISOString();

const logToFile = (level, message) => {
  try {
    const logFile = path.join(logDir, 'app.log');
    const logLine = `[${formatTimestamp()}] [${level.toUpperCase()}]: ${message}\n`;
    fs.appendFileSync(logFile, logLine, 'utf8');
  } catch (err) {
    console.error('Failed writing to log file:', err.message);
  }
};

const logger = {
  info: (msg, ...args) => {
    console.log(`\x1b[36m[${formatTimestamp()}] [INFO]:\x1b[0m`, msg, ...args);
    logToFile('info', typeof msg === 'object' ? JSON.stringify(msg) : String(msg));
  },
  warn: (msg, ...args) => {
    console.warn(`\x1b[33m[${formatTimestamp()}] [WARN]:\x1b[0m`, msg, ...args);
    logToFile('warn', typeof msg === 'object' ? JSON.stringify(msg) : String(msg));
  },
  error: (msg, ...args) => {
    console.error(`\x1b[31m[${formatTimestamp()}] [ERROR]:\x1b[0m`, msg, ...args);
    logToFile('error', typeof msg === 'object' ? JSON.stringify(msg) : String(msg));
  },
  debug: (msg, ...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`\x1b[35m[${formatTimestamp()}] [DEBUG]:\x1b[0m`, msg, ...args);
      logToFile('debug', typeof msg === 'object' ? JSON.stringify(msg) : String(msg));
    }
  },
};

module.exports = logger;
