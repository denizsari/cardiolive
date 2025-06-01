console.log('Starting test...');

const axios = require('axios');
console.log('Axios loaded');

const BASE_URL = 'http://localhost:5000/api';
console.log('Base URL:', BASE_URL);

async function simpleTest() {
  try {
    console.log('Making request to products endpoint...');
    const response = await axios.get(`${BASE_URL}/products`);
    console.log('Response received:', response.data);  } catch (error) {
    console.error('Error:', error.message);
    console.error('Error code:', error.code);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    }
  }
}

console.log('Calling simpleTest...');
simpleTest().then(() => {
  console.log('Test completed');
}).catch(error => {
  console.error('Test failed:', error);
});
