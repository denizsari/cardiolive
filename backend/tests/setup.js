const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

beforeAll(async () => {
  // Start in-memory MongoDB instance
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  await mongoose.connect(uri);
});

afterAll(async () => {
  // Cleanup
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
});

beforeEach(async () => {
  // Clear all collections before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Global test utilities
global.createTestUser = async (userData = {}) => {
  const User = require('../src/models/User');
  const defaultData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'user'
  };
  
  const user = new User({ ...defaultData, ...userData });
  return await user.save();
};

global.createTestProduct = async (productData = {}) => {
  const Product = require('../src/models/Product');
  const defaultData = {
    name: 'Test Product',
    description: 'Test product description',
    price: 99.99,
    category: 'test',
    brand: 'Test Brand',
    stock: 10,
    images: ['test.jpg']
  };
  
  const product = new Product({ ...defaultData, ...productData });
  return await product.save();
};

global.generateAuthToken = (user) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );
};
