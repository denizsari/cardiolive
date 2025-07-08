# 🚀 Kardiyolive Çalıştırma Kılavuzu

## Ana Klasörden Tek Komutla Çalıştırma

### 🔥 En Kolay Yöntem
```bash
npm run dev
```
Bu komut hem backend'i (port 5000) hem de frontend'i (port 3000) aynı anda çalıştırır.

### 🎯 Diğer Kullanışlı Komutlar

#### Geliştirme Modunda
```bash
npm run dev           # Her iki uygulamayı development modunda çalıştır
npm run start:dev     # Aynı işlevi yapar (alternatif)
npm run frontend      # Sadece frontend (Next.js)
npm run backend       # Sadece backend (Express.js)
```

#### Production Modunda
```bash
npm run build         # Her ikisini de build et
npm run start:both    # Production modunda her ikisini çalıştır
npm run start         # Sadece backend production modunda
```

#### Kurulum ve Yönetim
```bash
npm run install:all   # Tüm bağımlılıkları yükle (ana + frontend + backend)
npm run clean         # Cache ve build dosyalarını temizle
npm run test:all      # Tüm testleri çalıştır
```

#### Docker ile Çalıştırma
```bash
npm run docker:dev   # Development ortamı
npm run docker:prod  # Production ortamı
```

## 🌐 Erişim Adresleri

Uygulamalar çalıştıktan sonra:

- **Frontend (Next.js):** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Test:** http://localhost:5000/api/health

## 📋 İlk Kurulum

1. **Bağımlılıkları yükle:**
   ```bash
   npm run install:all
   ```

2. **Environment dosyalarını ayarla:**
   ```bash
   # Backend için .env dosyası oluştur
   cp backend/.env.example backend/.env
   
   # Frontend için .env.local dosyası oluştur  
   cp frontend/.env.example frontend/.env.local
   ```

3. **Uygulamayı çalıştır:**
   ```bash
   npm run dev
   ```

## 🔧 Sorun Giderme

### Port Çakışması
Eğer portlar kullanımdaysa:
```bash
# Portları kontrol et
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Process'leri öldür (Windows)
taskkill /F /PID <PID_NUMBER>
```

### Cache Temizleme
```bash
npm run clean           # Proje cache'ini temizle
npm cache clean --force # NPM cache'ini temizle
```

### Yeniden Kurulum
```bash
rm -rf node_modules frontend/node_modules backend/node_modules
npm run install:all
```

## 🎯 Geliştirme Workflow'u

1. **Kodlama:**
   ```bash
   npm run dev  # Development server'ı başlat
   ```

2. **Test:**
   ```bash
   npm run test:all  # Tüm testleri çalıştır
   ```

3. **Build:**
   ```bash
   npm run build  # Production build
   ```

4. **Deploy:**
   ```bash
   npm run deploy  # Production'a deploy et
   ```

## 📝 Not

- **Backend:** Express.js API server (Node.js)
- **Frontend:** Next.js React uygulaması (TypeScript)
- **Database:** MongoDB
- **Cache:** Redis
- **Concurrent:** İki uygulamayı paralel çalıştırmak için `concurrently` paketi kullanılıyor

**Kolay geliştirme dileriz! 🎉**
