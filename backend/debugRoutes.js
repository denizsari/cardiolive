const express = require('express');

console.log('Starting route debugging...');

// Test routes one by one to find the problematic one
const routes = [
  'userRoutes',
  'productRoutes',
  'blogRoutes',
  'orderRoutes',
  'settingsRoutes',
  'paymentRoutes',
  'reviewRoutes',
  'wishlistRoutes'
];

console.log('Testing routes individually...');

async function testRoutes() {
  for (const routeName of routes) {
    try {
      console.log(`\nLoading ${routeName}...`);
      const route = require(`./src/routes/${routeName}`);
      
      // Create a fresh app for each route test
      const testApp = express();
      console.log(`Registering ${routeName}...`);
      testApp.use(`/api/test`, route);
      console.log(`✓ ${routeName} loaded and registered successfully`);
    } catch (error) {
      console.error(`✗ ${routeName} failed:`, error.message);
      console.error('Stack:', error.stack);
      return;
    }
  }

  console.log('\n=== All individual routes passed ===');
  console.log('Testing complete app setup...');

  // If we get here, try loading all at once like in the real server
  try {
    const finalApp = express();
    
    console.log('Importing all routes...');
    const userRoutes = require('./src/routes/userRoutes');
    const productRoutes = require('./src/routes/productRoutes');
    const blogRoutes = require('./src/routes/blogRoutes');
    const orderRoutes = require('./src/routes/orderRoutes');
    const settingsRoutes = require('./src/routes/settingsRoutes');
    const paymentRoutes = require('./src/routes/paymentRoutes');
    const reviewRoutes = require('./src/routes/reviewRoutes');
    const wishlistRoutes = require('./src/routes/wishlistRoutes');

    console.log('All routes imported successfully. Setting up routes...');
    
    finalApp.use('/api/users', userRoutes);
    console.log('✓ Users route registered');
    
    finalApp.use('/api/products', productRoutes);
    console.log('✓ Products route registered');
    
    finalApp.use('/api/blogs', blogRoutes);
    console.log('✓ Blogs route registered');
    
    finalApp.use('/api/orders', orderRoutes);
    console.log('✓ Orders route registered');
    
    finalApp.use('/api/settings', settingsRoutes);
    console.log('✓ Settings route registered');
    
    finalApp.use('/api/payments', paymentRoutes);
    console.log('✓ Payments route registered');
    
    finalApp.use('/api/reviews', reviewRoutes);
    console.log('✓ Reviews route registered');
    
    finalApp.use('/api/wishlist', wishlistRoutes);
    console.log('✓ Wishlist route registered');
    
    console.log('\n🎉 All routes registered successfully!');
    console.log('The issue might be in middleware or other server setup.');
    
  } catch (error) {
    console.error('\n❌ Error setting up complete app:', error.message);
    console.error('Stack:', error.stack);
  }
}

testRoutes().catch(console.error);
