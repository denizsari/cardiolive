const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

console.log('Step 1: Loading environment...');
dotenv.config();

console.log('Step 2: Creating express app...');
const app = express();

console.log('Step 3: Setting trust proxy...');
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

console.log('Step 4: Loading security middleware...');
const { applySecurity } = require('./src/middlewares/security');

console.log('Step 5: Applying security...');
applySecurity(app);

console.log('Step 6: Loading compression...');
const compression = require('compression');
app.use(compression());

console.log('Step 7: Loading cookie parser...');
const cookieParser = require('cookie-parser');
app.use(cookieParser());

console.log('Step 8: Setting up body parsing...');
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

console.log('Step 9: Loading rate limiter...');
const { generalLimiter } = require('./src/middlewares/rateLimiter');

console.log('Step 10: Applying rate limiter...');
app.use('/api/', generalLimiter);

console.log('Step 11: Loading morgan...');
const morgan = require('morgan');
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

console.log('Step 12: Adding debug middleware...');
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

console.log('✓ All middleware applied successfully');
console.log('Now testing route imports...');

// Import routes
const userRoutes = require('./src/routes/userRoutes');
console.log('✓ userRoutes imported');

const productRoutes = require('./src/routes/productRoutes');
console.log('✓ productRoutes imported');

const blogRoutes = require('./src/routes/blogRoutes');
console.log('✓ blogRoutes imported');

const orderRoutes = require('./src/routes/orderRoutes');
console.log('✓ orderRoutes imported');

const settingsRoutes = require('./src/routes/settingsRoutes');
console.log('✓ settingsRoutes imported');

const paymentRoutes = require('./src/routes/paymentRoutes');
console.log('✓ paymentRoutes imported');

const reviewRoutes = require('./src/routes/reviewRoutes');
console.log('✓ reviewRoutes imported');

const wishlistRoutes = require('./src/routes/wishlistRoutes');
console.log('✓ wishlistRoutes imported');

console.log('All routes imported successfully. Now registering...');

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

console.log('🎉 Complete server setup successful - no path-to-regexp error!');
