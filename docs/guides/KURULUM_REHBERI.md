# 🚀 Kardiyolive Kurulum Rehberi

## 📋 **ÖN GEREKSINIMLER**

### **Sistem Gereksinimleri**
- **Node.js** 18.0+ (LTS önerilen)
- **MongoDB** 6.0+ 
- **Redis** 7.0+ (opsiyonel, caching için)
- **Git** versiyon kontrol sistemi
- **Docker** & **Docker Compose** (opsiyonel)

### **Gerekli Araçlar**
```bash
# Node.js versiyonunu kontrol et
node --version  # >= 18.0.0

# npm versiyonunu kontrol et  
npm --version   # >= 9.0.0

# MongoDB kurulumu (Windows)
# https://www.mongodb.com/try/download/community

# Redis kurulumu (opsiyonel)
# https://redis.io/download
```

---

## ⚡ **HIZLI KURULUM (Docker ile)**

### **1. Projeyi Klonlama**
```bash
git clone https://github.com/yourusername/Kardiyolive.git
cd Kardiyolive
```

### **2. Environment Dosyalarını Oluşturma**
```bash
# Ana dizinde .env dosyası oluştur
cp .env.example .env

# Backend için .env dosyası
cp backend/.env.example backend/.env
```

### **3. Docker ile Çalıştırma**
```bash
# Tüm servisleri başlat
docker-compose up -d

# Logları izle
docker-compose logs -f
```

### **4. Erişim**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **MongoDB:** localhost:27017
- **Redis:** localhost:6379

---

## 🔧 **MANUEL KURULUM**

### **1. Proje Klonlama ve Bağımlılıklar**
```bash
# Projeyi klonla
git clone https://github.com/yourusername/Kardiyolive.git
cd Kardiyolive

# Ana dizin bağımlılıklarını yükle
npm install

# Frontend bağımlılıklarını yükle
cd frontend
npm install

# Backend bağımlılıklarını yükle
cd ../backend
npm install

# Ana dizine geri dön
cd ..
```

### **2. MongoDB Kurulumu ve Konfigürasyonu**

#### **Windows**
```bash
# MongoDB Community Server indir ve yükle
# https://www.mongodb.com/try/download/community

# MongoDB servisini başlat
net start MongoDB

# MongoDB shell ile bağlan
mongosh
```

#### **macOS (Homebrew)**
```bash
# MongoDB'yi yükle
brew tap mongodb/brew
brew install mongodb-community

# MongoDB servisini başlat
brew services start mongodb/brew/mongodb-community

# Bağlantıyı test et
mongosh
```

#### **Linux (Ubuntu/Debian)**
```bash
# MongoDB repository ekle
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# MongoDB'yi yükle
sudo apt-get update
sudo apt-get install -y mongodb-org

# Servisi başlat
sudo systemctl start mongod
sudo systemctl enable mongod
```

### **3. Environment Konfigürasyonu**

#### **Ana Dizin .env**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/Kardiyolive
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here

# API
API_URL=http://localhost:5000/api
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Environment
NODE_ENV=development
PORT=3000
```

#### **Backend .env**
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/Kardiyolive
REDIS_URL=redis://localhost:6379

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Security
BCRYPT_SALT_ROUNDS=12
SESSION_SECRET=your-session-secret-here

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Email (opsiyonel)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password

# Monitoring
ENABLE_PROMETHEUS=true
PROMETHEUS_PORT=9090
```

### **4. Veritabanı Başlangıç Verileri**
```bash
# Backend dizinine git
cd backend

# Admin kullanıcısı oluştur
node createAdmin.js

# Örnek ürünleri ekle
node seedProducts.js

# Blog verilerini ekle
node seedBlogs.js

# Öne çıkan ürünleri güncelle
node updateFeaturedProducts.js
```

### **5. Servisleri Başlatma**

#### **Development Modu**
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend  
cd frontend
npm run dev

# Terminal 3: MongoDB (manuel başlattıysanız)
mongod

# Terminal 4: Redis (opsiyonel)
redis-server
```

#### **Production Modu**
```bash
# Frontend build
cd frontend
npm run build

# Backend production
cd ../backend
npm start
```

---

## 🔍 **KURULUM DOĞRULAMA**

### **1. Sağlık Kontrolü**
```bash
# Backend API sağlığını kontrol et
curl http://localhost:5000/health

# MongoDB bağlantısını test et
curl http://localhost:5000/api/health/db

# Redis bağlantısını test et (varsa)
curl http://localhost:5000/api/health/redis
```

### **2. Test Kullanıcısı ile Giriş**
```bash
# Varsayılan admin hesabı
Email: admin@Kardiyolive.com
Şifre: Admin123!

# Test kullanıcısı oluştur
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com", 
    "password": "Test123!"
  }'
```

### **3. API Endpoint Testleri**
```bash
# Ürünleri listele
curl http://localhost:5000/api/products

# Blog yazılarını listele
curl http://localhost:5000/api/blogs

# Kategorileri getir
curl http://localhost:5000/api/categories
```

---

## 🐛 **SORUN GİDERME**

### **Yaygın Sorunlar ve Çözümleri**

#### **MongoDB Bağlantı Hatası**
```bash
# Hata: MongoNetworkError: connect ECONNREFUSED
# Çözüm: MongoDB servisinin çalışıp çalışmadığını kontrol et

# Windows
net start MongoDB

# macOS
brew services restart mongodb/brew/mongodb-community

# Linux
sudo systemctl restart mongod
```

#### **Port Kullanımda Hatası**
```bash
# Port 3000 veya 5000 kullanımda
# Çözüm: Kullanılan portları kontrol et ve değiştir

# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# macOS/Linux  
lsof -i :3000
lsof -i :5000

# Alternatif portlar kullan
PORT=3001 npm run dev  # Frontend
PORT=5001 npm run dev  # Backend
```

#### **NPM Bağımlılık Sorunları**
```bash
# Node modules temizle ve yeniden yükle
rm -rf node_modules package-lock.json
npm install

# Frontend için
cd frontend
rm -rf node_modules package-lock.json  
npm install

# Backend için
cd backend
rm -rf node_modules package-lock.json
npm install
```

#### **Environment Değişkenleri Yüklenmedi**
```bash
# .env dosyalarının varlığını kontrol et
ls -la .env
ls -la backend/.env

# Dosya izinlerini kontrol et
chmod 644 .env
chmod 644 backend/.env
```

### **Geliştirici Araçları**

#### **Debug Modu**
```bash
# Backend debug modu
cd backend
DEBUG=Kardiyolive:* npm run dev

# Frontend debug modu  
cd frontend
NODE_OPTIONS='--inspect' npm run dev
```

#### **Database Yönetimi**
```bash
# MongoDB Compass GUI tool
# https://www.mongodb.com/products/compass

# MongoDB shell komutları
mongosh
use Kardiyolive
db.products.find().limit(5)
db.users.countDocuments()
```

#### **Log Takibi**
```bash
# Backend logları
tail -f backend/logs/combined.log

# Error logları
tail -f backend/logs/error.log

# Real-time log takibi
cd backend
npm run logs
```

---

## 📊 **PERFORMANS İZLEME**

### **Monitoring Kurulumu**
```bash
# Prometheus ve Grafana (Docker)
docker-compose -f docker-compose.monitoring.yml up -d

# Manuel kurulum
cd monitoring
./setup-monitoring.sh
```

### **Erişim Adresleri**
- **Prometheus:** http://localhost:9090
- **Grafana:** http://localhost:3001 (admin/admin)
- **AlertManager:** http://localhost:9093

---

## 🚀 **PRODUCTION DEPLOYMENT**

### **Environment Hazırlığı**
```bash
# Production environment variables
NODE_ENV=production
DATABASE_URL=mongodb://production-server:27017/Kardiyolive
REDIS_URL=redis://production-server:6379
JWT_SECRET=super-secure-production-secret
```

### **Build ve Deploy**
```bash
# Frontend production build
cd frontend
npm run build
npm run start

# Backend production
cd backend  
npm run build
npm start
```

### **Docker Production**
```bash
# Production docker-compose
docker-compose -f docker-compose.prod.yml up -d

# SSL sertifikası (Let's Encrypt)
docker-compose -f docker-compose.ssl.yml up -d
```

---

## 📞 **DESTEK VE İLETİŞİM**

Kurulum sırasında sorun yaşarsanız:

1. **GitHub Issues:** [Proje Issues Sayfası](https://github.com/yourusername/Kardiyolive/issues)
2. **Dokümantasyon:** Bu rehberi tekrar gözden geçirin
3. **Log Kontrolü:** Error loglarını kontrol edin
4. **Community:** Stack Overflow'da 'Kardiyolive' tag'i ile soru sorun

---

**Son Güncelleme:** 2 Haziran 2025  
**Rehber Versiyonu:** 1.0.0  
**Desteklenen OS:** Windows, macOS, Linux ✅
