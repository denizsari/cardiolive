// Direct database check
require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const Blog = require('./backend/src/models/blogModel');

async function checkDatabase() {
  try {
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cardiolive');
    console.log('✅ Connected to MongoDB');

    // Get all blogs without any filters
    const allBlogs = await Blog.find({});
    console.log(`📊 Total blogs in database: ${allBlogs.length}`);

    // Get published blogs only
    const publishedBlogs = await Blog.find({ status: 'published' });
    console.log(`📈 Published blogs: ${publishedBlogs.length}`);

    // Get all blogs with status breakdown
    const statusStats = await Blog.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    console.log('\n📋 Status breakdown:');
    statusStats.forEach(stat => {
      console.log(`  ${stat._id || 'undefined'}: ${stat.count}`);
    });

    // List all blog titles and status
    console.log('\n📝 All blogs:');
    allBlogs.forEach((blog, index) => {
      console.log(`${index + 1}. "${blog.title}" - Status: ${blog.status} - Created: ${blog.createdAt.toISOString().split('T')[0]}`);
    });

    await mongoose.connection.close();
    console.log('\n🔒 Database connection closed');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDatabase();
