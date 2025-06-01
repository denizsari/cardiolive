require('dotenv').config();
const mongoose = require('mongoose');
const UserService = require('./src/services/UserService');

async function testUserService() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');

    console.log('Testing UserService.registerUser...');
    const userData = {
      name: 'Test User Direct',
      email: 'testdirect@example.com',
      password: 'Test123!',
      phoneNumber: '1234567890'
    };

    const result = await UserService.registerUser(userData);
    console.log('User registered successfully:', result);

    console.log('Testing UserService.authenticateUser...');
    const authResult = await UserService.authenticateUser('testdirect@example.com', 'Test123!');
    console.log('User authenticated successfully:', authResult);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testUserService();
