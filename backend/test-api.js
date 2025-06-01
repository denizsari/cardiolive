// Quick API test
const axios = require('axios');

async function testAPI() {
  try {
    console.log('📡 Testing /api/blogs endpoint...');
    
    const response = await axios.get('http://localhost:5000/api/blogs');
    console.log('✅ API Status:', response.status);
    console.log('📊 Response structure:', {
      success: response.data.success,
      hasData: !!response.data.data,
      hasBlogs: !!response.data.data?.blogs,
      blogCount: response.data.data?.blogs?.length || 0
    });
    
    if (response.data.data?.blogs) {
      console.log('\n📝 All blogs from API:');
      response.data.data.blogs.forEach((blog, index) => {
        console.log(`${index + 1}. "${blog.title}" - Category: ${blog.category}`);
      });
    }
    
  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ Network Error:', error.message);
    }
  }
}

testAPI();
