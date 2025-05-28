const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

console.log('Creating a test token...');
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

const testPayload = { id: 'test123' };
const token = jwt.sign(testPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

console.log('Generated token:', token);

// Try to verify immediately
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log('Immediate verification successful:', decoded);
} catch (error) {
  console.error('Immediate verification failed:', error.message);
}
