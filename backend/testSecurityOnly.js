const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

console.log('Testing security middleware...');

try {
  const { applySecurity } = require('./src/middlewares/security');
  console.log('Security middleware imported successfully');
  
  applySecurity(app);
  console.log('✓ Security middleware applied successfully - no path-to-regexp error');
  
} catch (error) {
  console.error('✗ Security middleware failed:', error.message);
  console.error('Stack:', error.stack);
}

console.log('Security test complete.');
