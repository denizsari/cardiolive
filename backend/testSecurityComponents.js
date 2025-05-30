const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

console.log('Testing individual security middleware components...');

try {
  const helmet = require('helmet');
  const cors = require('cors');
  const cookieParser = require('cookie-parser');
  
  console.log('1. Testing helmet...');
  app.use(helmet());
  console.log('✓ Helmet applied');
  
  console.log('2. Testing cors...');
  app.use(cors());
  console.log('✓ CORS applied');
  
  console.log('3. Testing cookie parser...');
  app.use(cookieParser());
  console.log('✓ Cookie parser applied');
  
  console.log('4. Testing CSRF token route...');
  app.get('/api/csrf-token', (req, res) => {
    res.json({ token: 'test' });
  });
  console.log('✓ CSRF token route applied');
  
  console.log('5. Testing /api middleware...');
  app.use('/api', (req, res, next) => {
    console.log('API middleware called');
    next();
  });
  console.log('✓ API middleware applied');
  
  console.log('All security components applied successfully - no path-to-regexp error');
  
} catch (error) {
  console.error('✗ Error in security component:', error.message);
  console.error('Stack:', error.stack);
}

console.log('Security component test complete.');
