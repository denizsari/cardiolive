// Quick test to check blogs count
const axios = require('axios');

async function checkBlogs() {
  try {
    const response = await axios.get('http://localhost:5000/api/blogs');
    console.log('✅ API Status:', response.status);
    console.log('📊 Response structure:', {
      success: response.data.success,
      hasData: !!response.data.data,
      hasBlogs: !!response.data.data?.blogs,
      blogCount: response.data.data?.blogs?.length || 0
    });
    
    if (response.data.data?.blogs) {
      console.log('\n📝 Blog titles:');
      response.data.data.blogs.forEach((blog, index) => {
        console.log(`${index + 1}. ${blog.title}`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkBlogs();
