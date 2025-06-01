const { chromium } = require('playwright');

global.setupBrowser = async () => {
  const browser = await chromium.launch({
    headless: process.env.CI === 'true',
    slowMo: process.env.CI === 'true' ? 0 : 100
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  
  // Set longer timeout for CI environments
  page.setDefaultTimeout(process.env.CI === 'true' ? 30000 : 10000);
  
  return { browser, context, page };
};

global.cleanupBrowser = async (browser) => {
  if (browser) {
    await browser.close();
  }
};

// Global test data
global.testData = {
  validUser: {
    name: 'E2E Test User',
    email: 'e2e@example.com',
    password: 'password123'
  },
  
  validProduct: {
    name: 'E2E Test Product',
    description: 'A product for end-to-end testing',
    price: 99.99,
    category: 'test',
    brand: 'Test Brand',
    stock: 10,
    images: ['test-product.jpg']
  },
  
  validBlog: {
    title: 'E2E Test Blog Post',
    content: 'This is a comprehensive blog post for testing.',
    category: 'health',
    tags: ['test', 'e2e'],
    status: 'published'
  },
  
  shippingAddress: {
    street: '123 E2E Test St',
    city: 'Test City',
    state: 'Test State',
    zipCode: '12345',
    country: 'Test Country'
  }
};

// Test utilities
global.waitForApiCall = async (page, urlPattern) => {
  return page.waitForResponse(response => 
    response.url().includes(urlPattern) && response.status() === 200
  );
};

global.loginUser = async (page, email, password) => {
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('/dashboard');
};

global.expectApiResponse = (response, expectedFormat) => {
  expect(response.body).toHaveProperty('success');
  expect(response.body).toHaveProperty('timestamp');
  
  if (expectedFormat.success !== false) {
    expect(response.body.success).toBe(true);
    if (expectedFormat.data) {
      expect(response.body).toHaveProperty('data');
    }
  } else {
    expect(response.body.success).toBe(false);
    expect(response.body).toHaveProperty('message');
  }
};
