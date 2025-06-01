// Remove status field from all blogs and update schema
const mongoose = require('mongoose');

// MongoDB connection string - update this if needed
const MONGO_URI = 'mongodb://localhost:27017/cardiolive';

// Simple blog schema (without status field)
const blogSchema = new mongoose.Schema({
  title: String,
  publishedAt: Date
}, { strict: false }); // Allow any fields

const Blog = mongoose.model('Blog', blogSchema);

async function updateDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cardiolive');
    console.log('✅ Connected to MongoDB');

    // Get current blog count
    const totalBlogs = await Blog.countDocuments();
    console.log(`📊 Total blogs in database: ${totalBlogs}`);

    // Remove status field from all blogs and set publishedAt if missing
    const result = await Blog.updateMany(
      {},
      {
        $unset: { status: "" },
        $set: {
          publishedAt: { $ifNull: ["$publishedAt", new Date()] }
        }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} blogs`);
    console.log('🗑️ Removed status field from all blogs');
    console.log('📅 Set publishedAt for all blogs');

    // Verify changes
    const blogs = await Blog.find({}).select('title status publishedAt').limit(5);
    console.log('\n📝 Sample blogs after update:');
    blogs.forEach((blog, index) => {
      console.log(`${index + 1}. "${blog.title}" - Status: ${blog.status || 'REMOVED'} - Published: ${blog.publishedAt ? blog.publishedAt.toISOString().split('T')[0] : 'NOT SET'}`);
    });

    await mongoose.connection.close();
    console.log('\n🔒 Database connection closed');
    console.log('✅ All blogs are now published automatically!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateDatabase();
