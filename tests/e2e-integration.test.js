const request = require('supertest');
const { chromium } = require('playwright');
const mongoose = require('mongoose');
const app = require('../backend/server');

describe('End-to-End Integration Tests', () => {
  let browser;
  let page;
  let authToken;
  let testUser;

  beforeAll(async () => {
    // Setup database
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/cardiolive_e2e_test';
    await mongoose.connect(mongoUri);
    
    // Clear test data
    await mongoose.connection.db.dropDatabase();
    
    // Setup browser
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    
    // Set base URL
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    await page.goto(baseUrl);
  });

  afterAll(async () => {
    await browser?.close();
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('Complete User Journey', () => {
    it('should complete full e-commerce workflow', async () => {
      // 1. User Registration
      console.log('Testing user registration...');
      
      const userData = {
        name: 'E2E Test User',
        email: 'e2e@example.com',
        password: 'password123'
      };

      // Backend API test
      const registerResponse = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      expect(registerResponse.body.success).toBe(true);
      expect(registerResponse.body.token).toBeDefined();
      authToken = registerResponse.body.token;
      testUser = registerResponse.body.user;

      // Frontend UI test
      await page.goto('/register');
      await page.fill('[data-testid="name-input"]', userData.name);
      await page.fill('[data-testid="email-input"]', userData.email);
      await page.fill('[data-testid="password-input"]', userData.password);
      await page.click('[data-testid="register-button"]');
      
      // Verify registration success
      await page.waitForURL('/dashboard', { timeout: 5000 });
      
      // 2. Product Browsing
      console.log('Testing product browsing...');
      
      // Create test product via API
      const productData = {
        name: 'E2E Test Product',
        description: 'A product for end-to-end testing',
        price: 99.99,
        category: 'test',
        brand: 'Test Brand',
        stock: 10,
        images: ['test-product.jpg']
      };

      const productResponse = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(201);

      const testProduct = productResponse.body.product;

      // Browse products in frontend
      await page.goto('/products');
      await page.waitForSelector('[data-testid="product-grid"]');
      
      // Verify product appears
      const productElement = await page.locator(`[data-testid="product-${testProduct._id}"]`);
      await expect(productElement).toBeVisible();
      
      // 3. Product Details and Reviews
      console.log('Testing product details and reviews...');
      
      await productElement.click();
      await page.waitForURL(`/products/${testProduct.slug}`);
      
      // Add product review
      await page.fill('[data-testid="review-comment"]', 'Great product for testing!');
      await page.click('[data-testid="rating-5"]');
      await page.click('[data-testid="submit-review"]');
      
      // Verify review appears
      await page.waitForSelector('[data-testid="review-list"]');
      const reviewElement = await page.locator('text="Great product for testing!"');
      await expect(reviewElement).toBeVisible();
      
      // 4. Wishlist Functionality
      console.log('Testing wishlist functionality...');
      
      await page.click('[data-testid="add-to-wishlist"]');
      
      // Verify wishlist addition via API
      const wishlistResponse = await request(app)
        .get('/api/wishlist')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(wishlistResponse.body.data.wishlist).toHaveLength(1);
      expect(wishlistResponse.body.data.wishlist[0].product._id).toBe(testProduct._id);
      
      // Check wishlist in frontend
      await page.goto('/wishlist');
      const wishlistItem = await page.locator(`[data-testid="wishlist-item-${testProduct._id}"]`);
      await expect(wishlistItem).toBeVisible();
      
      // 5. Shopping Cart and Checkout
      console.log('Testing shopping cart and checkout...');
      
      await page.goto(`/products/${testProduct.slug}`);
      await page.click('[data-testid="add-to-cart"]');
      
      // Go to cart
      await page.goto('/cart');
      const cartItem = await page.locator(`[data-testid="cart-item-${testProduct._id}"]`);
      await expect(cartItem).toBeVisible();
      
      // Proceed to checkout
      await page.click('[data-testid="proceed-to-checkout"]');
      await page.waitForURL('/checkout');
      
      // Fill shipping information
      await page.fill('[data-testid="shipping-street"]', '123 E2E Test St');
      await page.fill('[data-testid="shipping-city"]', 'Test City');
      await page.fill('[data-testid="shipping-state"]', 'Test State');
      await page.fill('[data-testid="shipping-zip"]', '12345');
      await page.fill('[data-testid="shipping-country"]', 'Test Country');
      
      // Select payment method
      await page.click('[data-testid="payment-credit-card"]');
      await page.fill('[data-testid="card-number"]', '4111111111111111');
      await page.fill('[data-testid="card-expiry"]', '12/25');
      await page.fill('[data-testid="card-cvc"]', '123');
      
      // Place order
      await page.click('[data-testid="place-order"]');
      
      // Verify order creation
      await page.waitForURL('/order-success');
      const orderNumberElement = await page.locator('[data-testid="order-number"]');
      const orderNumber = await orderNumberElement.textContent();
      
      // Verify order via API
      const orderResponse = await request(app)
        .get(`/api/orders/track/${orderNumber}`)
        .expect(200);
        expect(orderResponse.body.order.orderNumber).toBe(orderNumber);
      expect(orderResponse.body.order.status).toBe('pending');
      
      // 6. Blog Content
      console.log('Testing blog functionality...');
      
      // Create blog post via API
      const blogData = {
        title: 'E2E Test Blog Post',
        content: 'This is a comprehensive blog post for testing.',
        category: 'health',
        tags: ['test', 'e2e'],
        status: 'published'
      };

      const blogResponse = await request(app)
        .post('/api/blogs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(blogData)
        .expect(201);

      const testBlog = blogResponse.body.blog;

      // Browse blogs in frontend
      await page.goto('/blog');
      await page.waitForSelector('[data-testid="blog-list"]');
      
      const blogElement = await page.locator(`[data-testid="blog-${testBlog._id}"]`);
      await expect(blogElement).toBeVisible();
      
      // Read blog post
      await blogElement.click();
      await page.waitForURL(`/blog/${testBlog.slug}`);
      
      const blogTitle = await page.locator('[data-testid="blog-title"]');
      await expect(blogTitle).toContainText(blogData.title);
      
      // 8. User Profile Management
      console.log('Testing user profile management...');
      
      await page.goto('/account/profile');
      
      // Update profile
      await page.fill('[data-testid="profile-name"]', 'Updated E2E User');
      await page.click('[data-testid="save-profile"]');
      
      // Verify profile update via API
      const profileResponse = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(profileResponse.body.user.name).toBe('Updated E2E User');
      
      // 9. Password Change
      console.log('Testing password change...');
      
      await page.goto('/account/change-password');
      await page.fill('[data-testid="current-password"]', 'password123');
      await page.fill('[data-testid="new-password"]', 'newpassword123');
      await page.fill('[data-testid="confirm-password"]', 'newpassword123');
      await page.click('[data-testid="change-password-button"]');
      
      // Verify password change success message
      const successMessage = await page.locator('[data-testid="success-message"]');
      await expect(successMessage).toBeVisible();
      
      // 10. Logout
      console.log('Testing logout...');
      
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="logout-button"]');
      
      // Verify redirect to login page
      await page.waitForURL('/login');
      
      console.log('✅ End-to-end test completed successfully!');
    }, 60000); // 60 second timeout for full workflow
  });

  describe('API Response Consistency', () => {
    it('should maintain consistent response format across all endpoints', async () => {
      const endpoints = [
        { method: 'GET', url: '/api/products', auth: false },
        { method: 'GET', url: '/api/blogs', auth: false },
        { method: 'GET', url: '/api/users/me', auth: true },
        { method: 'GET', url: '/api/orders', auth: true },
        { method: 'GET', url: '/api/wishlist', auth: true },
        { method: 'GET', url: '/api/reviews/product/nonexistent', auth: false, expectError: true }
      ];

      for (const endpoint of endpoints) {
        const req = request(app)[endpoint.method.toLowerCase()](endpoint.url);
        
        if (endpoint.auth) {
          req.set('Authorization', `Bearer ${authToken}`);
        }

        const response = await req;
        
        // All responses should have these fields
        expect(response.body).toHaveProperty('success');
        expect(response.body).toHaveProperty('timestamp');
        
        if (response.body.success) {
          // Success responses should have message and data (if applicable)
          expect(response.body).toHaveProperty('message');
        } else {
          // Error responses should have message
          expect(response.body).toHaveProperty('message');
        }
      }
    });
  });

  describe('Authentication Flow Integration', () => {
    it('should handle complete authentication workflow', async () => {
      // 1. Register new user
      const newUser = {
        name: 'Auth Test User',
        email: 'authtest@example.com',
        password: 'authtest123'
      };

      const registerResponse = await request(app)
        .post('/api/users/register')
        .send(newUser)
        .expect(201);

      const { token, user } = registerResponse.body;
      
      // 2. Access protected route with token
      const profileResponse = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(profileResponse.body.user.email).toBe(newUser.email);
      
      // 3. Access protected route without token
      await request(app)
        .get('/api/users/me')
        .expect(401);
      
      // 4. Access admin route with user token
      await request(app)
        .get('/api/users/admin/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(403); // Should be forbidden for non-admin
      
      // 5. Test token expiry (would require waiting or manipulating token)
      // This is a placeholder for token expiry testing
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle various error scenarios consistently', async () => {
      // 1. Validation errors
      const invalidUser = {
        name: '',
        email: 'invalid-email',
        password: '123' // Too short
      };

      const validationResponse = await request(app)
        .post('/api/users/register')
        .send(invalidUser)
        .expect(400);

      expect(validationResponse.body.success).toBe(false);
      expect(validationResponse.body.message).toContain('validation');
      
      // 2. Not found errors
      const notFoundResponse = await request(app)
        .get('/api/products/nonexistent-id')
        .expect(404);

      expect(notFoundResponse.body.success).toBe(false);
      
      // 3. Duplicate resource errors
      const duplicateResponse = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Test User',
          email: 'e2e@example.com', // Already exists
          password: 'password123'
        })
        .expect(400);

      expect(duplicateResponse.body.success).toBe(false);
      expect(duplicateResponse.body.message).toContain('already exists');
    });
  });
});
