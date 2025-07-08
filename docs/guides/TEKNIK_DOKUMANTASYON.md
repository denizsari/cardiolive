# 🔧 Kardiyolive Teknik Dokümantasyonu

## 📋 **İÇİNDEKİLER**
1. [Sistem Mimarisi](#sistem-mimarisi)
2. [API Endpointleri](#api-endpointleri)
3. [Veritabanı Şeması](#veritabanı-şeması)
4. [Güvenlik Konfigürasyonu](#güvenlik-konfigürasyonu)
5. [Performans Optimizasyonları](#performans-optimizasyonları)
6. [Monitoring ve Logging](#monitoring-ve-logging)

---

## 🏗️ **SİSTEM MİMARİSİ**

### **Frontend Katmanı (Next.js)**
```
├── app/                    # App Router yapısı
│   ├── (auth)/            # Authentication grupları
│   ├── admin/             # Admin panel sayfaları
│   ├── components/        # Reusable UI components
│   ├── lib/               # Utility functions
│   ├── types/             # TypeScript type definitions
│   └── hooks/             # Custom React hooks
├── public/                # Static assets
└── styles/                # Global styles
```

### **Backend Katmanı (Express.js)**
```
backend/
├── src/
│   ├── controllers/       # Route handlers
│   ├── models/           # MongoDB schemas
│   ├── middlewares/      # Custom middleware
│   ├── routes/           # API route definitions
│   ├── services/         # Business logic
│   ├── config/           # Configuration files
│   ├── utils/            # Helper functions
│   └── validations/      # Input validation schemas
├── tests/                # Test files
└── logs/                 # Log files
```

---

## 📡 **API ENDPOİNTLERİ**

### **Authentication Endpoints**
| Method | Endpoint | Açıklama | Auth Required |
|--------|----------|----------|---------------|
| POST | `/api/users/register` | Kullanıcı kaydı | ❌ |
| POST | `/api/users/login` | Kullanıcı girişi | ❌ |
| POST | `/api/users/logout` | Kullanıcı çıkışı | ✅ |
| POST | `/api/users/refresh-token` | Token yenileme | ✅ |
| GET | `/api/users/profile` | Profil bilgileri | ✅ |
| PUT | `/api/users/profile` | Profil güncelleme | ✅ |

### **Product Endpoints**
| Method | Endpoint | Açıklama | Auth Required |
|--------|----------|----------|---------------|
| GET | `/api/products` | Tüm ürünler | ❌ |
| GET | `/api/products/:id` | Ürün detayı | ❌ |
| GET | `/api/products/slug/:slug` | SEO URL ile ürün | ❌ |
| POST | `/api/products` | Ürün oluşturma | ✅ Admin |
| PUT | `/api/products/:id` | Ürün güncelleme | ✅ Admin |
| DELETE | `/api/products/:id` | Ürün silme | ✅ Admin |

### **Order Endpoints**
| Method | Endpoint | Açıklama | Auth Required |
|--------|----------|----------|---------------|
| GET | `/api/orders` | Kullanıcı siparişleri | ✅ |
| POST | `/api/orders` | Sipariş oluşturma | ✅ |
| GET | `/api/orders/:id` | Sipariş detayı | ✅ |
| PATCH | `/api/orders/:id/status` | Durum güncelleme | ✅ Admin |
| PATCH | `/api/orders/:id/cancel` | Sipariş iptali | ✅ |

### **Blog Endpoints**
| Method | Endpoint | Açıklama | Auth Required |
|--------|----------|----------|---------------|
| GET | `/api/blogs` | Blog yazıları | ❌ |
| GET | `/api/blogs/:id` | Blog detayı | ❌ |
| GET | `/api/blogs/slug/:slug` | SEO URL ile blog | ❌ |
| POST | `/api/blogs` | Blog oluşturma | ✅ Admin |
| PUT | `/api/blogs/:id` | Blog güncelleme | ✅ Admin |
| DELETE | `/api/blogs/:id` | Blog silme | ✅ Admin |

### **Review Endpoints**
| Method | Endpoint | Açıklama | Auth Required |
|--------|----------|----------|---------------|
| GET | `/api/reviews/product/:productId` | Ürün yorumları | ❌ |
| POST | `/api/reviews` | Yorum ekleme | ✅ |
| PUT | `/api/reviews/:id` | Yorum güncelleme | ✅ |
| DELETE | `/api/reviews/:id` | Yorum silme | ✅ |
| PATCH | `/api/reviews/:id/helpful` | Faydalı işaretleme | ✅ |

---

## 🗄️ **VERİTABANI ŞEMASI**

### **User Model**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String, // unique
  password: String, // bcrypt hashed
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'banned'],
    default: 'active'
  },
  profile: {
    phone: String,
    address: String,
    city: String,
    postalCode: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### **Product Model**
```javascript
{
  _id: ObjectId,
  name: String,
  slug: String, // unique, SEO friendly
  description: String,
  price: Number,
  discountPrice: Number,
  category: String,
  brand: String,
  images: [String],
  inStock: Boolean,
  stockQuantity: Number,
  featured: Boolean,
  specifications: {
    volume: String,
    origin: String,
    acidity: String,
    harvestDate: Date
  },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  createdAt: Date,
  updatedAt: Date
}
```

### **Order Model**
```javascript
{
  _id: ObjectId,
  orderNumber: String, // unique
  user: { type: ObjectId, ref: 'User' },
  items: [{
    product: { type: ObjectId, ref: 'Product' },
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'cash_on_delivery'],
    default: 'cash_on_delivery'
  },
  shippingAddress: {
    name: String,
    phone: String,
    address: String,
    city: String,
    postalCode: String
  },
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### **Blog Model**
```javascript
{
  _id: ObjectId,
  title: String,
  slug: String, // unique, SEO friendly
  content: String,
  excerpt: String,
  author: { type: ObjectId, ref: 'User' },
  category: String,
  tags: [String],
  featured: Boolean,
  published: Boolean,
  featuredImage: String,
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  publishedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### **Review Model**
```javascript
{
  _id: ObjectId,
  product: { type: ObjectId, ref: 'Product' },
  user: { type: ObjectId, ref: 'User' },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  title: String,
  comment: String,
  helpfulVotes: Number,
  verified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 **GÜVENLİK KONFİGÜRASYONU**

### **JWT Authentication**
```javascript
// Token konfigürasyonu
const JWT_CONFIG = {
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  algorithm: 'HS256',
  issuer: 'Kardiyolive-api',
  audience: 'Kardiyolive-app'
};
```

### **Rate Limiting**
```javascript
// Rate limiting ayarları
const RATE_LIMITS = {
  general: { windowMs: 15 * 60 * 1000, max: 1000 }, // 15 dakikada 1000 istek
  auth: { windowMs: 15 * 60 * 1000, max: 5 },       // 15 dakikada 5 giriş denemesi
  admin: { windowMs: 15 * 60 * 1000, max: 200 },    // Admin için özel limit
  upload: { windowMs: 60 * 60 * 1000, max: 10 }     // Saatte 10 dosya upload
};
```

### **Security Headers (Helmet.js)**
```javascript
const SECURITY_HEADERS = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
};
```

### **CORS Konfigürasyonu**
```javascript
const CORS_CONFIG = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://Kardiyolive.com'] 
    : ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

---

## ⚡ **PERFORMANS OPTİMİZASYONLARI**

### **Frontend Optimizasyonları**
- **Server-Side Rendering (SSR)** - SEO ve performans için
- **Static Site Generation (SSG)** - Blog sayfaları için
- **Image Optimization** - Next.js Image komponenti
- **Code Splitting** - Route bazlı lazy loading
- **Bundle Optimization** - Tree shaking ve minification

### **Backend Optimizasyonları**
- **Database Indexing** - MongoDB index stratejisi
- **Caching** - Redis ile API response caching
- **Compression** - Gzip response compression
- **Connection Pooling** - MongoDB connection optimization

### **Database Indexes**
```javascript
// Performans için kritik indexler
db.products.createIndex({ "slug": 1 }, { unique: true });
db.products.createIndex({ "category": 1, "featured": -1 });
db.products.createIndex({ "price": 1, "inStock": 1 });
db.orders.createIndex({ "user": 1, "createdAt": -1 });
db.orders.createIndex({ "orderNumber": 1 }, { unique: true });
db.reviews.createIndex({ "product": 1, "rating": -1 });
db.blogs.createIndex({ "slug": 1 }, { unique: true });
db.blogs.createIndex({ "published": 1, "publishedAt": -1 });
```

---

## 📊 **MONİTORİNG VE LOGGİNG**

### **Prometheus Metrics**
- **HTTP Request Duration** - API response sürelerini izleme
- **Request Count** - Endpoint kullanım istatistikleri
- **Error Rate** - Hata oranları
- **Database Connection Pool** - MongoDB bağlantı havuzu
- **Memory Usage** - Bellek kullanımı
- **CPU Usage** - İşlemci kullanımı

### **Grafana Dashboards**
- **API Performance Dashboard** - Genel API performansı
- **Business Metrics Dashboard** - E-ticaret metrikleri
- **System Health Dashboard** - Sistem sağlığı
- **Error Tracking Dashboard** - Hata analizi

### **Logging Strategy**
```javascript
// Log seviyeleri ve kullanımları
const LOG_LEVELS = {
  error: 'Kritik hatalar, sistem arızaları',
  warn: 'Uyarılar, performans sorunları',
  info: 'Genel bilgi, önemli olaylar',
  debug: 'Detaylı debugging bilgisi'
};

// Log kategorileri
const LOG_CATEGORIES = {
  api: 'API istekleri ve yanıtları',
  auth: 'Kimlik doğrulama olayları',
  business: 'İş mantığı olayları',
  security: 'Güvenlik olayları',
  performance: 'Performans metrikleri'
};
```

### **AlertManager Kuralları**
- **High Error Rate** - %5'in üzerinde hata oranı
- **Slow Response Time** - 2 saniyenin üzerinde yanıt süresi
- **High CPU Usage** - %80'in üzerinde CPU kullanımı
- **High Memory Usage** - %90'ın üzerinde bellek kullanımı
- **Database Connection Issues** - Veritabanı bağlantı sorunları

---

## 🔧 **GELİŞTİRİCİ REHBERİ**

### **Kod Standartları**
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Kod formatlama
- **Husky** - Git hooks ile pre-commit kontrolleri
- **Conventional Commits** - Commit mesaj standardı

### **Testing Strategy**
- **Unit Tests** - Jest ile component testleri
- **Integration Tests** - API endpoint testleri
- **E2E Tests** - Cypress ile kullanıcı senaryoları
- **Performance Tests** - Artillery ile yük testleri

### **CI/CD Pipeline**
```yaml
# GitHub Actions workflow özeti
stages:
  - lint_and_test     # ESLint + Jest testleri
  - build             # Docker image build
  - security_scan     # Güvenlik taraması
  - deploy_staging    # Staging ortamına deploy
  - integration_test  # Entegrasyon testleri
  - deploy_production # Production deploy
```

---

**Son Güncelleme:** 2 Haziran 2025  
**Doküman Versiyonu:** 1.0.0  
**Proje Durumu:** Production Ready ✅
