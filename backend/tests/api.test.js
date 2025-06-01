const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');
const Blog = require('../src/models/Blog');
const Review = require('../src/models/Review');

describe('Cardiolive API Integration Tests', () => {
  let authToken;
  let adminToken;
  let testUser;
  let testAdmin;
  let testProduct;
  let testOrder;
  let testBlog;

  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/cardiolive_test';
    await mongoose.connect(mongoUri);
    
    // Clean test database
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Blog.deleteMany({});
    await Review.deleteMany({});
  });

  afterAll(async () => {
    // Clean up and close connections
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('Authentication Endpoints', () => {
    describe('POST /api/users/register', () => {
      it('should register a new user successfully', async () => {
        const userData = {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        };

        const response = await request(app)
          .post('/api/users/register')
          .send(userData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.token).toBeDefined();
        expect(response.body.user.email).toBe(userData.email);
        expect(response.body.user.password).toBeUndefined();
        
        authToken = response.body.token;
        testUser = response.body.user;
      });

      it('should fail with duplicate email', async () => {
        const userData = {
          name: 'Test User 2',
          email: 'test@example.com',
          password: 'password123'
        };

        const response = await request(app)
          .post('/api/users/register')
          .send(userData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('already exists');
      });

      it('should fail with invalid email format', async () => {
        const userData = {
          name: 'Test User',
          email: 'invalid-email',
          password: 'password123'
        };

        const response = await request(app)
          .post('/api/users/register')
          .send(userData)
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });

    describe('POST /api/users/login', () => {
      it('should login with valid credentials', async () => {
        const loginData = {
          email: 'test@example.com',
          password: 'password123'
        };

        const response = await request(app)
          .post('/api/users/login')
          .send(loginData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.token).toBeDefined();
        expect(response.body.user.email).toBe(loginData.email);
      });

      it('should fail with invalid credentials', async () => {
        const loginData = {
          email: 'test@example.com',
          password: 'wrongpassword'
        };

        const response = await request(app)
          .post('/api/users/login')
          .send(loginData)
          .expect(401);

        expect(response.body.success).toBe(false);
      });
    });

    describe('GET /api/users/me', () => {
      it('should get current user profile', async () => {
        const response = await request(app)
          .get('/api/users/me')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.user.email).toBe('test@example.com');
      });

      it('should fail without authentication', async () => {
        const response = await request(app)
          .get('/api/users/me')
          .expect(401);

        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Product Endpoints', () => {
    beforeAll(async () => {
      // Create admin user for product management
      const adminData = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      };

      const admin = new User(adminData);
      testAdmin = await admin.save();
      
      // Generate admin token
      const loginResponse = await request(app)
        .post('/api/users/login')
        .send({ email: adminData.email, password: adminData.password });
      
      adminToken = loginResponse.body.token;
    });

    describe('POST /api/products', () => {
      it('should create a new product (admin only)', async () => {
        const productData = {
          name: 'Test Product',
          description: 'Test product description',
          price: 99.99,
          category: 'test-category',
          brand: 'Test Brand',
          stock: 10,
          images: ['test-image.jpg']
        };

        const response = await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(productData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.product.name).toBe(productData.name);
        expect(response.body.product.slug).toBeDefined();
        
        testProduct = response.body.product;
      });

      it('should fail without admin role', async () => {
        const productData = {
          name: 'Test Product 2',
          description: 'Test product description',
          price: 99.99
        };

        const response = await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${authToken}`)
          .send(productData)
          .expect(403);

        expect(response.body.success).toBe(false);
      });
    });

    describe('GET /api/products', () => {
      it('should get all products with pagination', async () => {
        const response = await request(app)
          .get('/api/products?page=1&limit=10')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.products).toBeInstanceOf(Array);
        expect(response.body.data.pagination).toBeDefined();
      });

      it('should filter products by category', async () => {
        const response = await request(app)
          .get('/api/products?category=test-category')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.products.length).toBeGreaterThan(0);
      });
    });

    describe('GET /api/products/:id', () => {
      it('should get product by ID', async () => {
        const response = await request(app)
          .get(`/api/products/${testProduct._id}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.product._id).toBe(testProduct._id);
      });

      it('should return 404 for non-existent product', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const response = await request(app)
          .get(`/api/products/${fakeId}`)
          .expect(404);

        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Order Endpoints', () => {
    describe('POST /api/orders', () => {
      it('should create a new order', async () => {
        const orderData = {
          items: [{
            product: testProduct._id,
            quantity: 2,
            price: testProduct.price
          }],
          shippingAddress: {
            street: '123 Test St',
            city: 'Test City',
            state: 'Test State',
            zipCode: '12345',
            country: 'Test Country'
          },
          paymentMethod: 'credit_card'
        };

        const response = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${authToken}`)
          .send(orderData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.order.user).toBe(testUser._id);
        expect(response.body.order.orderNumber).toBeDefined();
        
        testOrder = response.body.order;
      });

      it('should fail without authentication', async () => {
        const orderData = {
          items: [{
            product: testProduct._id,
            quantity: 1,
            price: testProduct.price
          }]
        };

        const response = await request(app)
          .post('/api/orders')
          .send(orderData)
          .expect(401);

        expect(response.body.success).toBe(false);
      });
    });

    describe('GET /api/orders/track/:orderNumber', () => {
      it('should track order by order number', async () => {
        const response = await request(app)
          .get(`/api/orders/track/${testOrder.orderNumber}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.order.orderNumber).toBe(testOrder.orderNumber);
      });
    });
  });

  describe('Blog Endpoints', () => {
    describe('POST /api/blogs', () => {
      it('should create a new blog post (admin only)', async () => {
        const blogData = {
          title: 'Test Blog Post',
          content: 'This is a test blog post content',
          category: 'health',
          tags: ['test', 'health'],
          featured: false
        };

        const response = await request(app)
          .post('/api/blogs')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(blogData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.blog.title).toBe(blogData.title);
        expect(response.body.blog.slug).toBeDefined();
        
        testBlog = response.body.blog;
      });
    });

    describe('GET /api/blogs', () => {
      it('should get all published blogs', async () => {
        const response = await request(app)
          .get('/api/blogs')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.blogs).toBeInstanceOf(Array);
      });
    });
  });

  describe('Review Endpoints', () => {
    describe('POST /api/reviews', () => {
      it('should create a product review', async () => {
        const reviewData = {
          product: testProduct._id,
          rating: 5,
          comment: 'Excellent product!'
        };

        const response = await request(app)
          .post('/api/reviews')
          .set('Authorization', `Bearer ${authToken}`)
          .send(reviewData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.review.rating).toBe(reviewData.rating);
        expect(response.body.review.user).toBe(testUser._id);
      });
    });

    describe('GET /api/reviews/product/:productId', () => {
      it('should get reviews for a product', async () => {
        const response = await request(app)
          .get(`/api/reviews/product/${testProduct._id}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.reviews).toBeInstanceOf(Array);
      });
    });
  });

  describe('Wishlist Endpoints', () => {
    describe('POST /api/wishlist', () => {
      it('should add product to wishlist', async () => {
        const wishlistData = {
          product: testProduct._id
        };

        const response = await request(app)
          .post('/api/wishlist')
          .set('Authorization', `Bearer ${authToken}`)
          .send(wishlistData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.wishlistItem.product).toBe(testProduct._id);
      });
    });

    describe('GET /api/wishlist', () => {
      it('should get user wishlist', async () => {
        const response = await request(app)
          .get('/api/wishlist')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.wishlist).toBeInstanceOf(Array);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/non-existent')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send('invalid json')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
