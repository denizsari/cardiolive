# 🚀 Kardiyolive Hibrit Deployment Rehberi

## 📋 Hibrit Sistem Mimarisi

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   cPanel        │    │   Railway.app    │    │  MongoDB Atlas  │
│   (Frontend)    │───▶│   (Backend)      │───▶│   (Database)    │
│   Static Files  │    │   Node.js API    │    │   Free Cluster  │
│   WhatsApp JS   │    │   JWT + Email    │    │   Cloud DB      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

---

## 🎯 Deployment Planı (90 dakika)

### ✅ **Adım 1**: MongoDB Atlas Setup (15 dakika)
### ✅ **Adım 2**: Railway Backend Deployment (30 dakika)  
### ✅ **Adım 3**: Frontend Static Build (20 dakika)
### ✅ **Adım 4**: cPanel Upload & Configuration (20 dakika)
### ✅ **Adım 5**: Domain Configuration & Testing (5 dakika)

---

## 🗄️ **ADIM 1: MongoDB Atlas Setup (15 dakika)**

### 1.1 MongoDB Atlas Hesabı Oluşturma

```bash
# 1. https://cloud.mongodb.com adresine gidin
# 2. "Try Free" butonuna tıklayın
# 3. Google/GitHub ile signup yapabilirsiniz
```

### 1.2 Free Cluster Oluşturma

```bash
# Atlas Dashboard'da:
1. "Create" → "Database"
2. "M0 Sandbox" seçin (FREE)
3. Region: "AWS / Frankfurt (eu-central-1)" (Türkiye'ye yakın)
4. Cluster Name: "kardiyolive-cluster"
5. "Create Cluster" tıklayın
```

### 1.3 Database User Oluşturma

```bash
# Security → Database Access:
1. "Add New Database User" tıklayın
2. Username: kardiyolive-admin
3. Password: [güçlü şifre üretin] - KAYDEDIN!
4. Role: "Atlas admin"
5. "Add User" tıklayın
```

### 1.4 Network Access Ayarlama

```bash
# Security → Network Access:
1. "Add IP Address" tıklayın
2. "Allow access from anywhere" seçin (0.0.0.0/0)
3. "Confirm" tıklayın
```

### 1.5 Connection String Alma

```bash
# Database → Connect:
1. "Connect your application" tıklayın
2. Driver: "Node.js"
3. Version: "4.1 or later"
4. Connection string'i KOPYALAYIN:

mongodb+srv://kardiyolive-admin:<password>@kardiyolive-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority

# <password> kısmını gerçek şifrenizle değiştirin!
```

**📝 NOT: Bu connection string'i kaydedin, Railway'de kullanacağız!**

---

## 🚀 **ADIM 2: Railway Backend Deployment (30 dakika)**

### 2.1 Railway Hesabı Oluşturma

```bash
# 1. https://railway.app adresine gidin
# 2. "GitHub ile Login" yapın
# 3. Repository'nize erişim izni verin
```

### 2.2 GitHub Repository Hazırlama

```bash
# GitHub'da backend için ayrı branch oluşturalım:
git checkout -b railway-backend
git push origin railway-backend
```

### 2.3 Railway Project Oluşturma

```bash
# Railway Dashboard:
1. "New Project" tıklayın
2. "Deploy from GitHub repo" seçin
3. "cardiolive" repository'nizi seçin
4. "railway-backend" branch'ini seçin
5. Root directory: "backend" yazın
6. "Deploy" tıklayın
```

### 2.4 Environment Variables Ayarlama

```bash
# Railway Project → Variables sekmesi:
# Aşağıdaki değişkenleri ekleyin:
```

#### **Environment Variables:**

```env
# Database
MONGO_URI=mongodb+srv://kardiyolive-admin:YOUR_PASSWORD@kardiyolive-cluster.xxxxx.mongodb.net/kardiyolive?retryWrites=true&w=majority

# JWT
JWT_SECRET=k4rd1y0l1v3_pr0duct1on_s3cr3t_2024_v3ry_s3cur3_k3y
JWT_REFRESH_SECRET=k4rd1y0l1v3_r3fr3sh_s3cr3t_2024_v3ry_s3cur3_k3y
JWT_EXPIRE=30d

# Application
NODE_ENV=production
PORT=3000

# CORS (Domain'inizi yazın)
FRONTEND_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER=+905XXXXXXXXX

# File Upload (Cloudinary - opsiyonel)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2.5 Backend Deploy Kontrolü

```bash
# Railway Deployments sekmesinde:
1. Build başarılı mı? ✅
2. Deploy başarılı mı? ✅
3. Service URL'i kopyalayın (örn: https://your-app.railway.app)
```

### 2.6 Database Setup Script Çalıştırma

```bash
# Railway console açın (Settings → Terminal):
cd backend
node scripts/setup-production-db.js
```

**📝 Railway URL'inizi kaydedin: https://your-app.railway.app**

---

## 🎨 **ADIM 3: Frontend Static Build (20 dakika)**

### 3.1 Local Environment Hazırlama

```bash
# Terminal'de projenizin ana klasöründe:
cd frontend

# Environment dosyası oluşturun:
cp .env.production.example .env.local
```

### 3.2 Environment Variables Güncelleme

```bash
# frontend/.env.local dosyasını düzenleyin:
```

```env
# API URL (Railway URL'inizi yazın)
NEXT_PUBLIC_API_URL=https://your-app.railway.app

# Site URL (Domain'inizi yazın)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER=+905XXXXXXXXX

# Analytics (opsiyonel)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Business Info
NEXT_PUBLIC_COMPANY_NAME=Kardiyolive Ltd.
NEXT_PUBLIC_COMPANY_PHONE=+90 XXX XXX XX XX
NEXT_PUBLIC_SUPPORT_EMAIL=support@yourdomain.com
```

### 3.3 Next.js Static Export Configuration

```bash
# frontend/next.config.ts dosyasını güncelleyin:
```

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : '',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  }
}

module.exports = nextConfig
```

### 3.4 Package.json Export Script Ekleme

```bash
# frontend/package.json'a export script ekleyin:
```

```json
{
  "scripts": {
    "export": "next build && next export"
  }
}
```

### 3.5 Static Build Oluşturma

```bash
# Frontend klasöründe:
npm install
npm run build
npm run export

# Bu komut "out" klasörü oluşturacak
ls -la out/
```

### 3.6 Build Kontrolü

```bash
# out/ klasöründe şunlar olmalı:
✅ index.html
✅ _next/ klasörü
✅ images/ klasörü
✅ products/ klasörü
✅ about/ klasörü
✅ contact/ klasörü
✅ manifest.json
```

---

## 📁 **ADIM 4: cPanel Upload & Configuration (20 dakika)**

### 4.1 cPanel File Manager'a Giriş

```bash
# 1. cPanel'e login olun
# 2. "File Manager" açın
# 3. "public_html" klasörüne gidin
# 4. Mevcut dosyaları backup alın (varsa)
```

### 4.2 Eski Dosyaları Temizleme

```bash
# public_html içindeki dosyaları silin:
# (WordPress, eski site dosyaları vs.)
# Sadece .htaccess dosyasını koruyun (varsa)
```

### 4.3 Static Dosyaları Upload Etme

```bash
# 1. Local'deki "frontend/out" klasörünün TÜM içeriğini seçin
# 2. ZIP dosyası oluşturun: kardiyolive-frontend.zip
# 3. cPanel File Manager'da Upload butonuna tıklayın
# 4. ZIP dosyasını upload edin
# 5. ZIP'i extract edin
# 6. Dosyaları public_html'e taşıyın
```

### 4.4 File Structure Kontrolü

```bash
# public_html/ şu şekilde olmalı:
public_html/
├── index.html
├── _next/
├── images/
├── products/
├── about/
├── contact/
├── cart/
├── checkout/
├── manifest.json
├── favicon.ico
└── .htaccess (yeni oluşturacağız)
```

### 4.5 .htaccess Dosyası Oluşturma

```bash
# public_html/.htaccess oluşturun:
```

```apache
RewriteEngine On

# HTTPS Redirect
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# API Proxy (Railway'e yönlendirme)
RewriteCond %{REQUEST_URI} ^/api/(.*)$
RewriteRule ^api/(.*)$ https://your-app.railway.app/api/$1 [P,L]

# SPA Routing Support
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]

# Security Headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"

# CORS Headers (API için)
Header always set Access-Control-Allow-Origin "https://yourdomain.com"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript application/json
</IfModule>

# Cache Control
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
</IfModule>
```

**⚠️ ÖNEMLİ: .htaccess'te "your-app.railway.app" kısmını gerçek Railway URL'nizle değiştirin!**

### 4.6 Email Accounts Oluşturma

```bash
# cPanel → Email Accounts:
1. info@yourdomain.com oluşturun
2. support@yourdomain.com oluşturun
3. orders@yourdomain.com oluşturun
```

---

## 🌐 **ADIM 5: Domain Configuration & Testing (5 dakika)**

### 5.1 SSL Certificate Kontrolü

```bash
# cPanel → SSL/TLS:
1. SSL sertifikası aktif mi? ✅
2. "Force HTTPS Redirect" aktif mi? ✅
3. Değilse, Let's Encrypt ile ücretsiz SSL alın
```

### 5.2 Subdomain Oluşturma (Opsiyonel)

```bash
# cPanel → Subdomains:
1. "api" subdomain oluşturun
2. Document Root: public_html/api
3. Redirect: https://your-app.railway.app
```

### 5.3 DNS Kontrolü

```bash
# Terminal'de kontrol edin:
nslookup yourdomain.com
ping yourdomain.com

# Sonuç cPanel server IP'sini göstermeli
```

### 5.4 Site Test Etme

```bash
# Browser'da test edin:
1. https://yourdomain.com ✅
2. WhatsApp widget görünüyor mu? ✅
3. Ürünler sayfası açılıyor mu? ✅
4. İletişim formu çalışıyor mu? ✅
5. Mobile view düzgün mü? ✅
```

---

## 🔧 **Hibrit Sistem API Connection**

### Frontend'in Backend'e Bağlanması

```javascript
// Frontend otomatik olarak şu URL'leri kullanacak:
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL; // Railway URL

// Örnek API calls:
fetch(`${API_BASE_URL}/api/products`)
fetch(`${API_BASE_URL}/api/auth/login`)
fetch(`${API_BASE_URL}/api/orders`)
```

### CORS Configuration Kontrolü

```bash
# Railway Backend'de CORS ayarları:
# backend/server.js içinde CORS_ORIGIN kontrol edin
```

---

## 🚨 **Troubleshooting**

### Problem 1: WhatsApp Widget Görünmüyor

```bash
# Çözüm:
1. Browser Console açın (F12)
2. JavaScript errors var mı?
3. NEXT_PUBLIC_WHATSAPP_NUMBER doğru mu?
4. Widget CSS yüklendi mi?
```

### Problem 2: API Calls Çalışmıyor

```bash
# Çözüm:
1. Railway backend çalışıyor mu?
2. CORS Origin doğru mu?
3. .htaccess proxy rules doğru mu?
4. Network tab'da 400/500 error var mı?
```

### Problem 3: Images Yüklenmiyor

```bash
# Çözüm:
1. images/ klasörü upload edildi mi?
2. File permissions 644 mi?
3. .htaccess cache rules doğru mu?
```

### Problem 4: SSL Certificate Error

```bash
# Çözüm:
1. cPanel SSL/TLS aktif mi?
2. Mixed content warnings var mı?
3. Force HTTPS redirect aktif mi?
```

---

## ✅ **Deployment Checklist**

### Backend (Railway)
- [ ] MongoDB Atlas connection string doğru
- [ ] Environment variables set edildi
- [ ] Deploy başarılı
- [ ] Health check endpoint çalışıyor
- [ ] Database indexes oluşturuldu

### Frontend (cPanel)
- [ ] Static files upload edildi
- [ ] .htaccess yapılandırıldı
- [ ] SSL sertifikası aktif
- [ ] WhatsApp widget çalışıyor
- [ ] Mobile responsive

### Integration
- [ ] API calls çalışıyor
- [ ] CORS doğru yapılandırıldı
- [ ] Email gönderimi test edildi
- [ ] WhatsApp numarası doğru

---

## 🎉 **Başarılı Deployment!**

### Site URL'leriniz:
- **Ana Site**: https://yourdomain.com
- **API Backend**: https://your-app.railway.app
- **Admin Panel**: https://yourdomain.com/admin
- **Database**: MongoDB Atlas Dashboard

### Maintenance:
- **Railway**: Otomatik Git sync
- **cPanel**: Sadece frontend güncellemeleri
- **Database**: Otomatik backup (Atlas)

### Performance:
- **Frontend**: cPanel CDN hızı
- **Backend**: Railway auto-scaling
- **Database**: Atlas cloud performance

---

**🚀 Kardiyolive artık hibrit sistemle live! WhatsApp entegrasyonu da çalışıyor!**

Herhangi bir adımda sorun yaşarsanız, o adımın detayını sorun, adım adım çözelim! 💪 