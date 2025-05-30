const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables first
dotenv.config();

console.log('Creating Express app...');
const app = express();

// Trust proxy if behind reverse proxy (for production)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

console.log('Loading security middleware...');
const { applySecurity } = require('./src/middlewares/security');

console.log('Applying security middleware...');
try {
  applySecurity(app);
  console.log('✓ Security middleware applied successfully');
} catch (error) {
  console.error('✗ Security middleware failed:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

console.log('Loading rate limiter...');
const { generalLimiter } = require('./src/middlewares/rateLimiter');

console.log('Setting up basic middleware...');
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

console.log('Applying rate limiter...');
try {
  app.use('/api/', generalLimiter);
  console.log('✓ Rate limiter applied successfully');
} catch (error) {
  console.error('✗ Rate limiter failed:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

console.log('Loading route imports...');
try {
  const userRoutes = require('./src/routes/userRoutes');
  const productRoutes = require('./src/routes/productRoutes');
  const blogRoutes = require('./src/routes/blogRoutes');
  const orderRoutes = require('./src/routes/orderRoutes');
  const settingsRoutes = require('./src/routes/settingsRoutes');
  const paymentRoutes = require('./src/routes/paymentRoutes');
  const reviewRoutes = require('./src/routes/reviewRoutes');
  const wishlistRoutes = require('./src/routes/wishlistRoutes');
  console.log('✓ All routes imported successfully');

  console.log('Registering routes with Express...');
  
  app.use('/api/users', userRoutes);
  console.log('✓ Users route registered');
  
  app.use('/api/products', productRoutes);
  console.log('✓ Products route registered');
  
  app.use('/api/blogs', blogRoutes);
  console.log('✓ Blogs route registered');
  
  app.use('/api/orders', orderRoutes);
  console.log('✓ Orders route registered');
  
  app.use('/api/settings', settingsRoutes);
  console.log('✓ Settings route registered');
  
  app.use('/api/payments', paymentRoutes);
  console.log('✓ Payments route registered');
  
  app.use('/api/reviews', reviewRoutes);
  console.log('✓ Reviews route registered');
  
  app.use('/api/wishlist', wishlistRoutes);
  console.log('✓ Wishlist route registered');
  
  console.log('🎉 All routes registered successfully!');
  console.log('Server setup complete - no path-to-regexp errors detected.');
  
} catch (error) {
  console.error('✗ Route setup failed:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}
