#!/usr/bin/env node

/**
 * Test script for review purchase verification functionality
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testReviewVerification() {
  console.log('🧪 Testing Review Purchase Verification\n');

  try {
    // 1. First, let's check if we have any products
    console.log('1. Checking available products...');
    const productsResponse = await axios.get(`${API_BASE}/products`);
    
    if (!productsResponse.data.success || !productsResponse.data.data.products.length) {
      console.log('❌ No products found. Please seed some products first.');
      return;
    }

    const products = productsResponse.data.data.products;
    const testProduct = products[0];
    console.log(`✅ Found ${products.length} products. Testing with: ${testProduct.name}`);

    // 2. Test the review eligibility endpoint without authentication (should fail)
    console.log('\n2. Testing review eligibility without authentication...');
    try {
      await axios.get(`${API_BASE}/reviews/can-review/${testProduct._id}`);
      console.log('❌ Should have failed without authentication');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Correctly rejected unauthenticated request');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }    // 3. Use admin user for testing (should already exist)
    console.log('\n3. Logging in with admin user...');
    const testUser = {
      email: 'admin@cardiolive.com',
      password: 'admin123'
    };

    let token;
    try {
      const loginResponse = await axios.post(`${API_BASE}/users/login`, {
        email: testUser.email,
        password: testUser.password
      });
      token = loginResponse.data.token;
      console.log('✅ Successfully logged in with admin user');
    } catch (loginError) {
      console.log('❌ Admin login failed:', loginError.response?.data?.message);
      
      // Try to create admin user if it doesn't exist
      console.log('ℹ️ Attempting to create admin user...');
      try {
        await axios.post(`${API_BASE}/users/register`, {
          name: 'Admin User',
          email: 'admin@cardiolive.com',
          password: 'Admin123', // Fixed password with proper format
          role: 'admin'
        });
        console.log('✅ Admin user created');
        
        const loginResponse = await axios.post(`${API_BASE}/users/login`, {
          email: 'admin@cardiolive.com',
          password: 'Admin123'
        });
        token = loginResponse.data.token;
        console.log('✅ Successfully logged in with new admin user');
      } catch (registerError) {
        console.log('❌ Failed to create admin user:', registerError.response?.data?.message);
        return;
      }
    }

    // 4. Test review eligibility for a user who hasn't purchased the product
    console.log('\n4. Testing review eligibility for non-purchaser...');
    const eligibilityResponse = await axios.get(
      `${API_BASE}/reviews/can-review/${testProduct._id}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log('Review Eligibility Response:', JSON.stringify(eligibilityResponse.data, null, 2));

    if (eligibilityResponse.data.success) {
      const eligibility = eligibilityResponse.data.data;
      if (!eligibility.canReview && !eligibility.hasPurchased) {
        console.log('✅ Correctly denied review for non-purchaser');
      } else {
        console.log('❌ Should have denied review for non-purchaser');
      }
    }

    // 5. Test attempting to create a review without purchase (should fail)
    console.log('\n5. Testing review creation without purchase...');
    try {
      await axios.post(
        `${API_BASE}/reviews`,
        {
          productId: testProduct._id,
          rating: 5,
          title: 'Test Review',
          comment: 'This is a test review'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log('❌ Should have failed to create review without purchase');
    } catch (error) {
      if (error.response && error.response.data.message.includes('satın almanız gerekiyor')) {
        console.log('✅ Correctly blocked review creation without purchase');
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
      }
    }

    console.log('\n🎉 Review purchase verification tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testReviewVerification().catch(console.error);
