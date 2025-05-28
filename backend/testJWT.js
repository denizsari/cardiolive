const jwt = require('jsonwebtoken');
require('dotenv').config();

console.log('Starting JWT test...');
console.log('Environment check:', {
  JWT_SECRET_exists: !!process.env.JWT_SECRET,
  JWT_SECRET_length: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0
});

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MzcyZGM4OWNjYmNiZjE3MjdkYTVlYSIsImlhdCI6MTc0ODQ0Njc5MiwiZXhwIjoxNzUxMDM4NzkyfQ.0s6Leuv90jeBeDTpWujTdNSgDL2F_55wGZxdC83RpYJo';

try {
  console.log('Attempting to verify token...');
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log('Decoded token:', decoded);
} catch (error) {
  console.error('JWT verification error:', error.message);
}
