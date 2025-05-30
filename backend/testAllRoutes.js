require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Most basic setup
app.use(express.json());

// Test each route file one by one
console.log('1. Testing userRoutes...');
try {
  const userRoutes = require('./src/routes/userRoutes');
  app.use('/api/users', userRoutes);
  console.log('✓ userRoutes OK');
} catch(e) {
  console.error('✗ userRoutes failed:', e.message);
  process.exit(1);
}

console.log('2. Testing productRoutes...');
try {
  const productRoutes = require('./src/routes/productRoutes');
  app.use('/api/products', productRoutes);
  console.log('✓ productRoutes OK');
} catch(e) {
  console.error('✗ productRoutes failed:', e.message);
  process.exit(1);
}

console.log('3. Testing blogRoutes...');
try {
  const blogRoutes = require('./src/routes/blogRoutes');
  app.use('/api/blogs', blogRoutes);
  console.log('✓ blogRoutes OK');
} catch(e) {
  console.error('✗ blogRoutes failed:', e.message);
  process.exit(1);
}

console.log('4. Testing orderRoutes...');
try {
  const orderRoutes = require('./src/routes/orderRoutes');
  app.use('/api/orders', orderRoutes);
  console.log('✓ orderRoutes OK');
} catch(e) {
  console.error('✗ orderRoutes failed:', e.message);
  process.exit(1);
}

console.log('5. Testing reviewRoutes...');
try {
  const reviewRoutes = require('./src/routes/reviewRoutes');
  app.use('/api/reviews', reviewRoutes);
  console.log('✓ reviewRoutes OK');
} catch(e) {
  console.error('✗ reviewRoutes failed:', e.message);
  process.exit(1);
}

console.log('6. Testing wishlistRoutes...');
try {
  const wishlistRoutes = require('./src/routes/wishlistRoutes');
  app.use('/api/wishlist', wishlistRoutes);
  console.log('✓ wishlistRoutes OK');
} catch(e) {
  console.error('✗ wishlistRoutes failed:', e.message);
  process.exit(1);
}

console.log('7. Testing settingsRoutes...');
try {
  const settingsRoutes = require('./src/routes/settingsRoutes');
  app.use('/api/settings', settingsRoutes);
  console.log('✓ settingsRoutes OK');
} catch(e) {
  console.error('✗ settingsRoutes failed:', e.message);
  process.exit(1);
}

console.log('8. Testing paymentRoutes...');
try {
  const paymentRoutes = require('./src/routes/paymentRoutes');
  app.use('/api/payments', paymentRoutes);
  console.log('✓ paymentRoutes OK');
} catch(e) {
  console.error('✗ paymentRoutes failed:', e.message);
  process.exit(1);
}

console.log('All routes loaded successfully!');

const PORT = 3003;
app.listen(PORT, () => {
  console.log(`Minimal server running on port ${PORT}`);
});
