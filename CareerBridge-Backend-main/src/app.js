const express = require('express');
const cors = require('cors');
const corsOptions = require('./config/cors');
const rateLimiter = require('./middleware/rateLimiter');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Module Routes
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const postRoutes = require('./modules/posts/post.routes');
const jobRoutes = require('./modules/jobs/job.routes');
const directoryRoutes = require('./modules/directory/directory.routes');
const messageRoutes = require('./modules/messages/message.routes');
const notificationRoutes = require('./modules/notifications/notification.routes');
const searchRoutes = require('./modules/search/search.routes');
const aiRoutes = require('./modules/ai/ai.routes');

// Direct Controllers for backward-compatibility aliases
const directoryController = require('./modules/directory/directory.controller');
const userController = require('./modules/users/user.controller');

const app = express();

// Security & Parsing Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(rateLimiter({ max: 2000, windowMs: 15 * 60 * 1000 }));

// HTTP Request Logger
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Root & Health Check Endpoints
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'backend is working' });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/directory', directoryRoutes);
app.use('/api/connections', directoryRoutes); // LinkedIn-style alias
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/ai', aiRoutes);

// Favicon handler
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Compatibility aliases for existing deployed frontend clients and direct browser queries
app.post('/api/connect/request', directoryController.sendConnectRequest);
app.get('/api/admin/stats', userController.getAdminStats);
app.use('/jobs', jobRoutes); // Fallback for clients calling /jobs directly
app.use('/posts', postRoutes); // Fallback for clients calling /posts directly

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;
