# 🫒 Cardiolive E-ticaret Platformu

Modern, temiz ve optimize edilmiş Next.js ve Express.js ile geliştirilmiş tam özellikli zeytinyağı e-ticaret sistemi.

![Cardiolive](https://img.shields.io/badge/Cardiolive-E--commerce-green)
![Next.js](https://img.shields.io/badge/Next.js-15.3.2-black)
![React](https://img.shields.io/badge/React-19.0.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)

## 📁 Proje Yapısı

Bu proje temizlik işlemi geçirmiş, production-ready bir e-ticaret platformudur.

```
cardiolive/
├── 📁 frontend/          # Next.js frontend uygulaması
├── 📁 backend/           # Express.js API sunucusu
├── 📁 docs/              # Organize edilmiş dokümantasyon
│   ├── 📁 guides/        # Kurulum ve güvenlik rehberleri
│   └── 📁 reports/       # Proje raporları ve analizler
├── 📁 deployment/        # Deployment scripts
├── 📁 monitoring/        # Prometheus, Grafana, Loki
├── 📁 security/          # WAF, IDS, Security headers
├── 📁 tests/             # E2E ve integration testler
└── 📁 performance-tests/ # Yük ve stress testleri
```

## ✨ Özellikler

### 🛒 E-ticaret Özellikleri
- **Ürün Yönetimi**: Kategorili ürün sistemi (zeytinyağı çeşitleri)
- **Sepet Sistemi**: LocalStorage ile kalıcı sepet
- **Sipariş Yönetimi**: Sipariş takibi ve durum güncellemeleri
- **Kullanıcı Sistemi**: Kayıt, giriş, profil yönetimi
- **Ödeme Sistemi**: Kapıda ödeme ve kredi kartı desteği

### 👨‍💼 Admin Paneli
- **Dashboard**: Satış istatistikleri ve genel bakış
- **Ürün Yönetimi**: CRUD operasyonları
- **Sipariş Yönetimi**: Durum güncellemeleri
- **Blog Yönetimi**: İçerik oluşturma ve düzenleme
- **Kullanıcı Yönetimi**: Rol ve durum kontrolü
- **Sistem Ayarları**: Site konfigürasyonu

### 📝 Blog Sistemi
- **İçerik Yönetimi**: Zengin editör ile blog yazıları
- **SEO Optimizasyonu**: Meta tags ve arama motoru uyumluluğu
- **Kategori Sistemi**: Organized content structure

### 🔐 Güvenlik ve Performans
- **JWT Authentication**: Güvenli kimlik doğrulama
- **Role-based Access**: Kullanıcı rolleri (admin/user)
- **Rate Limiting**: API güvenliği
- **Helmet.js**: HTTP güvenlik headers
- **Compression**: Response compression
- **Error Handling**: Centralized error management

## 🚀 Teknoloji Stack

### Frontend
- **Next.js 15.3.2** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Utility-first CSS
- **Lucide React** - Modern icon library
- **Swiper.js** - Touch slider

### Backend
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security middleware
- **Morgan** - Logging
- **CORS** - Cross-origin resource sharing

## 📦 Kurulum

### Gereksinimler
- Node.js 18+ 
- MongoDB 5+
- npm veya yarn

### 1. Projeyi Klonlayın
```bash
git clone https://github.com/your-username/cardiolive.git
cd cardiolive
```

### 2. Backend Kurulumu
```bash
cd backend
npm install

# Environment variables
cp .env.example .env
# .env dosyasını düzenleyin

# Admin kullanıcı oluşturun
node createAdmin.js

# Blog verilerini seed edin
node seedBlogs.js

# Sunucuyu başlatın
npm start
```

### 3. Frontend Kurulumu
```bash
cd frontend
npm install

# Environment variables
cp .env.example .env.local
# API URL'ini düzenleyin

# Development server
npm run dev
```

## 🔧 Konfigürasyon

### Backend Environment Variables (.env)
```env
MONGO_URI=mongodb://localhost:27017/cardiolive
JWT_SECRET=your_super_secure_jwt_secret
JWT_EXPIRE=30d
PORT=5000
NODE_ENV=development
```

### Frontend Environment Variables (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 📚 API Dokümantasyonu

### Authentication Endpoints
```
POST /api/users/register     - Kullanıcı kaydı
POST /api/users/login        - Kullanıcı girişi
POST /api/users/forgot-password - Şifre sıfırlama
```

### Product Endpoints
```
GET    /api/products         - Tüm ürünler
GET    /api/products/:id     - Ürün detayı
POST   /api/products/admin   - Ürün oluştur (Admin)
PUT    /api/products/admin/:id - Ürün güncelle (Admin)
DELETE /api/products/admin/:id - Ürün sil (Admin)
```

### Order Endpoints
```
POST   /api/orders           - Sipariş oluştur
GET    /api/orders/my        - Kullanıcı siparişleri
GET    /api/orders/track/:orderId - Sipariş takibi
GET    /api/orders/admin     - Tüm siparişler (Admin)
PUT    /api/orders/admin/:id/status - Sipariş durumu güncelle (Admin)
```

### Blog Endpoints
```
GET    /api/blogs            - Tüm blog yazıları
GET    /api/blogs/:id        - Blog detayı
POST   /api/blogs/admin      - Blog oluştur (Admin)
PUT    /api/blogs/admin/:id  - Blog güncelle (Admin)
DELETE /api/blogs/admin/:id  - Blog sil (Admin)
```

## 🏗️ Proje Yapısı

```
cardiolive/
├── backend/
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   └── middlewares/    # Custom middlewares
│   ├── server.js           # Express server
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── (routes)/       # Page routes
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   ├── public/            # Static assets
│   └── package.json
└── README.md
```

## 🧪 Test Kullanıcıları

### Admin Kullanıcı
- **Email**: admin@cardiolive.com
- **Password**: admin123
- **Role**: admin

### Test Kullanıcı
- **Email**: test2@example.com
- **Password**: password123
- **Role**: user

## 🔍 Önemli Özellikler

### Cart Context
LocalStorage ile kalıcı sepet sistemi:
```typescript
const { items, addItem, removeItem, updateQuantity, clearCart } = useCart();
```

### Protected Routes
Admin paneli için route koruması:
```typescript
// Admin layout automatic redirect for non-admin users
```

### Type Safety
Comprehensive TypeScript definitions:
```typescript
interface Product {
  _id: string;
  name: string;
  price: number;
  category: ProductCategory;
  // ...
}
```

## 🚀 Production Deployment

### Vercel (Frontend)
```bash
npm install -g vercel
cd frontend
vercel --prod
```

### Railway/Heroku (Backend)
```bash
# Set environment variables
# Deploy to your preferred platform
```

### MongoDB Atlas
- Production MongoDB cluster
- Network access configuration
- Database user credentials

## 📊 Performance Optimizations

- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic with Next.js App Router
- **Compression**: Gzip compression on backend
- **Caching**: API response caching strategies
- **Database Indexing**: MongoDB performance indexes

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcryptjs with salt
- **Rate Limiting**: API request limiting
- **CORS Protection**: Cross-origin request handling
- **Input Validation**: Request data validation
- **Error Handling**: Secure error responses

## 🐛 Sorun Giderme

### MongoDB Connection Error
```bash
# MongoDB service kontrolü
mongod --version
# Connection string kontrolü
```

### Port Conflicts
```bash
# Port kullanımı kontrolü
netstat -ano | findstr :3000
netstat -ano | findstr :5000
```

### TypeScript Errors
```bash
# Type check
npm run type-check
# Build test
npm run build
```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 📞 İletişim

- **Proje Sahibi**: [Your Name]
- **Email**: your.email@example.com
- **Website**: [https://cardiolive.com](https://cardiolive.com)

## 🙏 Teşekkürler

- Next.js team for the amazing framework
- MongoDB for the flexible database
- All contributors and supporters

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!
