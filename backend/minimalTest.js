const express = require('express');
const app = express();

// Skip all middleware and just test the basic route registration
console.log('Testing basic route registration without any middleware...');

try {
  // Import routes
  const userRoutes = require('./src/routes/userRoutes');
  const productRoutes = require('./src/routes/productRoutes');
  const blogRoutes = require('./src/routes/blogRoutes');
  const orderRoutes = require('./src/routes/orderRoutes');
  const settingsRoutes = require('./src/routes/settingsRoutes');
  const paymentRoutes = require('./src/routes/paymentRoutes');
  const reviewRoutes = require('./src/routes/reviewRoutes');
  const wishlistRoutes = require('./src/routes/wishlistRoutes');
  
  console.log('All routes imported successfully');
  
  // Register routes
  console.log('Registering routes...');
  app.use('/api/users', userRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/blogs', blogRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/wishlist', wishlistRoutes);
  
  console.log('✓ All routes registered successfully - no path-to-regexp error');
  
} catch (error) {
  console.error('✗ Error occurred:', error.message);
  console.error('Stack:', error.stack);
}

console.log('Test complete.');
