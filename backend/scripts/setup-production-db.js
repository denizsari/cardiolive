#!/usr/bin/env node

/**
 * Kardiyolive Production Database Setup Script
 * 
 * This script sets up MongoDB indexes and configurations for production
 * Run after deploying to production: node scripts/setup-production-db.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kardiyolive';

console.log('🚀 Kardiyolive Production Database Setup');
console.log('==========================================\n');

async function setupProductionDatabase() {
  try {
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB successfully\n');

    const db = mongoose.connection.db;

    console.log('🔧 Creating optimized indexes...\n');

    // Users Collection Indexes
    console.log('📋 Setting up Users indexes...');
    const usersCollection = db.collection('users');
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex({ role: 1 });
    await usersCollection.createIndex({ isActive: 1 });
    await usersCollection.createIndex({ createdAt: -1 });
    console.log('✅ Users indexes created');

    // Products Collection Indexes
    console.log('📦 Setting up Products indexes...');
    const productsCollection = db.collection('products');
    await productsCollection.createIndex({ slug: 1 }, { unique: true });
    await productsCollection.createIndex({ category: 1 });
    await productsCollection.createIndex({ isActive: 1 });
    await productsCollection.createIndex({ price: 1 });
    await productsCollection.createIndex({ stock: 1 });
    await productsCollection.createIndex({ createdAt: -1 });
    await productsCollection.createIndex({ 
      name: "text", 
      description: "text" 
    }, {
      weights: {
        name: 10,
        description: 5
      },
      name: "products_text_search"
    });
    await productsCollection.createIndex({ 
      category: 1, 
      isActive: 1, 
      price: 1 
    });
    console.log('✅ Products indexes created');

    // Orders Collection Indexes
    console.log('🛍️ Setting up Orders indexes...');
    const ordersCollection = db.collection('orders');
    await ordersCollection.createIndex({ orderId: 1 }, { unique: true });
    await ordersCollection.createIndex({ user: 1 });
    await ordersCollection.createIndex({ status: 1 });
    await ordersCollection.createIndex({ createdAt: -1 });
    await ordersCollection.createIndex({ paymentStatus: 1 });
    await ordersCollection.createIndex({ 
      user: 1, 
      createdAt: -1 
    });
    await ordersCollection.createIndex({ 
      status: 1, 
      createdAt: -1 
    });
    console.log('✅ Orders indexes created');

    // Blogs Collection Indexes
    console.log('📝 Setting up Blogs indexes...');
    const blogsCollection = db.collection('blogs');
    await blogsCollection.createIndex({ slug: 1 }, { unique: true });
    await blogsCollection.createIndex({ isActive: 1 });
    await blogsCollection.createIndex({ createdAt: -1 });
    await blogsCollection.createIndex({ author: 1 });
    await blogsCollection.createIndex({ 
      title: "text", 
      content: "text",
      excerpt: "text"
    }, {
      weights: {
        title: 10,
        excerpt: 5,
        content: 1
      },
      name: "blogs_text_search"
    });
    await blogsCollection.createIndex({ 
      isActive: 1, 
      createdAt: -1 
    });
    console.log('✅ Blogs indexes created');

    // Reviews Collection Indexes
    console.log('⭐ Setting up Reviews indexes...');
    const reviewsCollection = db.collection('reviews');
    await reviewsCollection.createIndex({ product: 1 });
    await reviewsCollection.createIndex({ user: 1 });
    await reviewsCollection.createIndex({ rating: 1 });
    await reviewsCollection.createIndex({ isApproved: 1 });
    await reviewsCollection.createIndex({ createdAt: -1 });
    await reviewsCollection.createIndex({ 
      product: 1, 
      isApproved: 1, 
      createdAt: -1 
    });
    await reviewsCollection.createIndex({ 
      user: 1, 
      product: 1 
    }, { unique: true });
    console.log('✅ Reviews indexes created');

    // Settings Collection Indexes
    console.log('⚙️ Setting up Settings indexes...');
    const settingsCollection = db.collection('settings');
    await settingsCollection.createIndex({ key: 1 }, { unique: true });
    await settingsCollection.createIndex({ category: 1 });
    console.log('✅ Settings indexes created');

    console.log('\n🔍 Verifying index creation...');
    
    // List all indexes for verification
    const collections = ['users', 'products', 'orders', 'blogs', 'reviews', 'settings'];
    
    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      const indexes = await collection.indexes();
      console.log(`📊 ${collectionName}: ${indexes.length} indexes`);
    }

    console.log('\n📈 Setting up database performance configurations...');
    
    // Set read preference for better performance
    await db.admin().command({
      setParameter: 1,
      cursorTimeoutMillis: 300000
    }).catch(() => {
      console.log('⚠️ Could not set cursor timeout (may require admin privileges)');
    });

    console.log('\n✅ Production database setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   • All collections indexed for optimal performance');
    console.log('   • Text search indexes created for products and blogs');
    console.log('   • Unique constraints applied where necessary');
    console.log('   • Compound indexes for common query patterns');
    console.log('\n🚀 Your Kardiyolive database is production-ready!');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   • Check MongoDB connection string');
    console.error('   • Ensure database user has proper permissions');
    console.error('   • Verify network access to MongoDB');
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
}

// Command line execution
if (require.main === module) {
  setupProductionDatabase();
}

module.exports = setupProductionDatabase; 