// MongoDB Initialization Script for Cardiolive E-commerce Platform
// This script sets up the database structure, indexes, and initial data

// Switch to the application database
db = db.getSiblingDB('cardiolive');

// Create application user with appropriate permissions
db.createUser({
  user: "cardiolive_app",
  pwd: "SecureAppPassword123!",
  roles: [
    {
      role: "readWrite",
      db: "cardiolive"
    }
  ]
});

print("✅ Database user created successfully");

// Create collections and indexes for optimal performance

// Users collection indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "isActive": 1 });
db.users.createIndex({ "createdAt": 1 });
print("✅ Users collection indexes created");

// Products collection indexes
db.products.createIndex({ "name": "text", "description": "text" });
db.products.createIndex({ "slug": 1 }, { unique: true });
db.products.createIndex({ "category": 1 });
db.products.createIndex({ "price": 1 });
db.products.createIndex({ "isActive": 1 });
db.products.createIndex({ "featured": 1 });
db.products.createIndex({ "createdAt": -1 });
db.products.createIndex({ "stock": 1 });
print("✅ Products collection indexes created");

// Orders collection indexes
db.orders.createIndex({ "user": 1 });
db.orders.createIndex({ "orderNumber": 1 }, { unique: true });
db.orders.createIndex({ "status": 1 });
db.orders.createIndex({ "createdAt": -1 });
db.orders.createIndex({ "paymentStatus": 1 });
print("✅ Orders collection indexes created");

// Reviews collection indexes
db.reviews.createIndex({ "product": 1 });
db.reviews.createIndex({ "user": 1 });
db.reviews.createIndex({ "rating": 1 });
db.reviews.createIndex({ "isApproved": 1 });
db.reviews.createIndex({ "createdAt": -1 });
db.reviews.createIndex({ "product": 1, "user": 1 }, { unique: true });
print("✅ Reviews collection indexes created");

// Blogs collection indexes
db.blogs.createIndex({ "title": "text", "content": "text" });
db.blogs.createIndex({ "slug": 1 }, { unique: true });
db.blogs.createIndex({ "category": 1 });
db.blogs.createIndex({ "featured": 1 });
db.blogs.createIndex({ "published": 1 });
db.blogs.createIndex({ "createdAt": -1 });
print("✅ Blogs collection indexes created");

// Wishlist collection indexes
db.wishlists.createIndex({ "user": 1 });
db.wishlists.createIndex({ "product": 1 });
db.wishlists.createIndex({ "user": 1, "product": 1 }, { unique: true });
print("✅ Wishlist collection indexes created");

// Settings collection indexes
db.settings.createIndex({ "key": 1 }, { unique: true });
print("✅ Settings collection indexes created");

// Insert initial settings data
const initialSettings = [
  {
    key: "site_name",
    value: "Cardiolive E-commerce",
    category: "general",
    description: "Site name displayed in headers and titles"
  },
  {
    key: "site_description",
    value: "Premium health and wellness products for a better life",
    category: "general",
    description: "Site description for SEO"
  },
  {
    key: "contact_email",
    value: "info@cardiolive.com",
    category: "contact",
    description: "Primary contact email address"
  },
  {
    key: "contact_phone",
    value: "+90 555 123 4567",
    category: "contact",
    description: "Primary contact phone number"
  },
  {
    key: "currency",
    value: "TRY",
    category: "commerce",
    description: "Default currency for the store"
  },
  {
    key: "tax_rate",
    value: "18",
    category: "commerce",
    description: "Default tax rate percentage"
  },
  {
    key: "free_shipping_threshold",
    value: "500",
    category: "commerce",
    description: "Minimum order amount for free shipping"
  },
  {
    key: "items_per_page",
    value: "12",
    category: "display",
    description: "Number of products to display per page"
  },
  {
    key: "maintenance_mode",
    value: "false",
    category: "system",
    description: "Enable/disable maintenance mode"
  },
  {
    key: "allow_registration",
    value: "true",
    category: "system",
    description: "Allow new user registrations"
  }
];

db.settings.insertMany(initialSettings);
print("✅ Initial settings data inserted");

// Insert sample product categories
const categories = [
  "Kalp Sağlığı",
  "Kan Basıncı",
  "Kolesterol",
  "Vitamin & Mineral",
  "Bitkisel Ürünler",
  "Spor Besini",
  "Özel Formüller"
];

// You can add sample products if needed for testing
print("✅ Database initialization completed successfully!");
print("📊 Collections created with optimized indexes");
print("⚙️ Initial settings configured");
print("🔐 Application user created with proper permissions");

// Display collection statistics
print("\n📈 Collection Statistics:");
print("Users:", db.users.countDocuments());
print("Products:", db.products.countDocuments());
print("Orders:", db.orders.countDocuments());
print("Reviews:", db.reviews.countDocuments());
print("Blogs:", db.blogs.countDocuments());
print("Wishlists:", db.wishlists.countDocuments());
print("Settings:", db.settings.countDocuments());
