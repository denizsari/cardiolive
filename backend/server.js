const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const path = require('path');

// Load environment variables first
dotenv.config();

// Logger import
const logger = require('./src/utils/logger');

// Route imports
const userRoutes = require('./src/routes/userRoutes');
const productRoutes = require('./src/routes/productRoutes');
const blogRoutes = require('./src/routes/blogRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const settingsRoutes = require('./src/routes/settingsRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');

// Middleware imports
const errorHandler = require('./src/middlewares/errorHandler');
const { applySecurity } = require('./src/middlewares/security');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy if behind reverse proxy (for production)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Apply security middleware (CORS, Helmet, CSRF, etc.)
applySecurity(app);

// Compression middleware
app.use(compression());

// Cookie parser (needed for CSRF)
app.use(cookieParser());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from frontend public directory
app.use('/api/files', express.static(path.join(__dirname, '../frontend/public')));

// Public rate limiting (TEMPORARILY DISABLED FOR TESTING)
// app.use('/api/', generalLimiter);

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Debug middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    logger.debug(`${req.method} ${req.url}`);
    next();
  });
}

// MongoDB connection with fallback for production testing
logger.info('Connecting to MongoDB...');
let dbConnected = false;

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  logger.info('MongoDB connected successfully');
  dbConnected = true;
})
.catch(err => {
  logger.error('MongoDB connection error:', err);
  logger.info('⚠️  Database connection failed - Please check your MongoDB Atlas IP whitelist');
  logger.info('📖 Guide: https://www.mongodb.com/docs/atlas/security-whitelist/');
  dbConnected = false;
  // Don't exit - allow server to run for API testing
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'Connected' : 'Disconnected - Check IP Whitelist',
    version: '1.0.0',
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);

// Basic welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the Cardiolive API',
    version: '1.0.0',    endpoints: {
      health: '/health',
      api: '/api',
      csrf: '/api/csrf-token'
    }
  });
});

// Handle 404 for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');
  // Use server.close() for graceful shutdown instead of process.exit()
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');
  // Use server.close() for graceful shutdown instead of process.exit()
  server.close(() => {
    process.exit(0);
  });
});

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server is running on http://localhost:${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
  logger.info(`🔐 CSRF token: http://localhost:${PORT}/api/csrf-token`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, _promise) => {
  logger.error('Unhandled Promise Rejection:', err.message);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;