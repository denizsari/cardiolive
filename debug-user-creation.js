#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testUserCreation() {
  try {
    console.log('🔐 Testing user creation...');
    
    const userData = {
      name: 'Test User',
      email: 'testuser@cardiolive.com',
      password: 'User123!',
      phone: '05551234567'
    };

    console.log('Sending data:', userData);

    const response = await axios.post(`${BASE_URL}/users/register`, userData);
    
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Full error:', error.response?.data);
    console.error('Status:', error.response?.status);
    console.error('Headers:', error.response?.headers);
  }
}

testUserCreation();
