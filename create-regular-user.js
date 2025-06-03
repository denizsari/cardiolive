#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function createRegularUser() {
  try {
    console.log('��� Creating regular test user...');
    
    const userData = {
      name: 'Test User',
      email: 'user@cardiolive.com',
      password: 'User123!',
      phone: '05551234567'
    };

    const response = await axios.post(`${BASE_URL}/users/register`, userData);
    
    if (response.data.success) {
      console.log('✅ User created successfully!');
      console.log('��� Email:', userData.email);
      console.log('��� Password:', userData.password);
      console.log('��� User ID:', response.data.user._id);
      console.log('\n��� You can now login with these credentials at: http://localhost:3000/login');
    } else {
      console.log('❌ User creation failed:', response.data.message);
    }
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('kullanımda')) {
      console.log('✅ User already exists - Email: user@cardiolive.com, Password: User123!');
      console.log('��� You can login with these credentials at: http://localhost:3000/login');
    } else {
      console.log('❌ Error creating user:', error.response?.data?.message || error.message);
    }
  }
}

createRegularUser();
