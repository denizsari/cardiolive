# 🚀 Kardiyolive Production Deployment Guide

Bu rehber, Kardiyolive e-ticaret platformunun production ortamına deploy edilmesi için gereken tüm adımları içerir.

## 📋 Deployment Checklist

### 🔧 Ön Hazırlık

- [ ] Production sunucusu hazır (minimum 4GB RAM, 2 CPU cores)
- [ ] Domain name ve DNS ayarları yapılandırıldı
- [ ] SSL sertifikası temin edildi
- [ ] MongoDB Atlas cluster oluşturuldu
- [ ] Email service (SMTP) ayarlandı
- [ ] Cloudinary hesabı oluşturuldu (image storage)
- [ ] Payment gateway (Iyzico) entegrasyonu tamamlandı
- [ ] **WhatsApp Business hesabı hazırlandı**

### 📦 Environment Setup

1. **Environment Variables Ayarlama:**
```bash
# Ana klasörde .env dosyasını oluşturun
cp .env.production.template .env

# Backend için
cp backend/.env.production.example backend/.env

# Frontend için
cp frontend/.env.production.example frontend/.env.local
```

2. **WhatsApp Integration Setup:**
```env
# WhatsApp Business Phone Number (ülke kodu ile)
NEXT_PUBLIC_WHATSAPP_NUMBER=+905XXXXXXXXX

# Örnek: +905551234567 (Türkiye)
# Örnek: +447123456789 (İngiltere)
```

3. **Güvenlik Anahtarları Üretme:**
```bash
# JWT secrets için
openssl rand -base64 32

# Her bir secret için farklı anahtar üratin
```

### 📱 WhatsApp Business Setup

1. **WhatsApp Business Account:**
   - WhatsApp Business uygulamasını indirin
   - İş hesabınızı oluşturun
   - İş profili bilgilerini doldurun
   - Çalışma saatlerini ayarlayın
   - Otomatik mesajları yapılandırın

2. **Mesaj Templates (Önerilen):**
```
Hoş Geldiniz Mesajı:
"Merhaba! Kardiyolive'e hoş geldiniz 🫒 
Size nasıl yardımcı olabiliriz?"

Çalışma Saatleri:
"Pazartesi-Cumartesi: 09:00-18:00
Pazar: 10:00-17:00"

Ürün Bilgi Mesajı:
"Ürünlerimiz hakkında detaylı bilgi için katalogumuzı inceleyebilirsiniz.
Sipariş için ürün adı ve adres bilginizi paylaşın."
```

### 🗄️ Database Setup

1. **MongoDB Atlas Configuration:**
   - Cluster oluşturun (M10+ önerilir)
   - Database user oluşturun
   - Network access ayarlayın
   - Connection string'i alın

2. **Database Indexleri:**
```bash
# Production database setup
node backend/scripts/setup-production-db.js
```

### 🐳 Docker Deployment

1. **Docker ve Docker Compose Kurulumu:**
```bash
# Ubuntu/Debian için
sudo apt update
sudo apt install docker.io docker-compose

# Docker daemon'ı başlatın
sudo systemctl start docker
sudo systemctl enable docker
```

2. **Production Deployment:**
```bash
# Otomatik deployment script kullanın
./scripts/production-deployment.sh

# Veya manuel deployment
docker-compose -f docker-compose.prod.yml up -d
```

### 🌐 Nginx ve SSL Setup

1. **Nginx Configuration:**
```bash
# SSL sertifikalarını /etc/ssl/ altına kopyalayın
sudo cp your-domain.crt /etc/ssl/certs/kardiyolive.crt
sudo cp your-domain.key /etc/ssl/private/kardiyolive.key

# Nginx config'i test edin
sudo nginx -t

# Nginx'i restart edin
sudo systemctl restart nginx
```

2. **Domain DNS Setup:**
```
A Record: yourdomain.com -> SERVER_IP
A Record: api.yourdomain.com -> SERVER_IP
CNAME: www.yourdomain.com -> yourdomain.com
```

## 🚀 Deployment Process

### Otomatik Deployment (Önerilen)

```bash
# Tüm kontrollerie deployment
./scripts/production-deployment.sh

# Sadece staging'e deployment
./scripts/production-deployment.sh -e staging

# Backup'sız ve test'siz deployment
./scripts/production-deployment.sh -s -t

# Force deployment
./scripts/production-deployment.sh -f
```

### Manuel Deployment

1. **Kodu Çek:**
```bash
git pull origin main
```

2. **Environment Variables Kontrol Et:**
```bash
# Gerekli environment variables'ları kontrol et
grep -v '^#' .env

# WhatsApp numarasını test et
echo $NEXT_PUBLIC_WHATSAPP_NUMBER
```

3. **Docker Build:**
```bash
docker-compose -f docker-compose.prod.yml build --no-cache
```

4. **Services'ları Durdur:**
```bash
docker-compose -f docker-compose.prod.yml down
```

5. **Production Services'ları Başlat:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

6. **Health Check:**
```bash
# Backend health check
curl http://localhost:5000/health

# Frontend check
curl http://localhost:3000

# WhatsApp widget check
curl -s http://localhost:3000 | grep -o "WhatsApp"
```

## 📱 WhatsApp Integration Features

### 🎯 Ana Sayfa Entegrasyonu
- Otomatik popup (3 saniye sonra)
- Floating WhatsApp button
- Hero section'da WhatsApp sipariş kartı
- Contact section'da çağrı

### 🛍️ Ürün Sayfası Entegrasyonu
- Ürün spesifik mesajlar
- Fiyat bilgisi ile ön doldurulmuş mesajlar
- Sipariş kapalı bildirimi
- WhatsApp button integration

### 🔧 Özelleştirme Seçenekleri
- Position (bottom-right/bottom-left)
- Custom messages
- Auto-popup control
- Product-specific integration

### 📝 Mesaj Templates
```javascript
// Genel sorgu
"Merhaba! Kardiyolive ürünleri hakkında bilgi almak istiyorum."

// Ürün spesifik
"Merhaba! 'Premium Zeytinyağı 500ml' ürünü hakkında bilgi almak istiyorum. (Fiyat: ₺89,90)"

// Sipariş
"Merhaba! Kardiyolive ürünlerinden sipariş vermek istiyorum. Yardımcı olabilir misiniz?"
```

## 🔍 Health Checks ve Monitoring

### Health Check Endpoints

```bash
# Backend API health
curl https://api.yourdomain.com/health

# Frontend health
curl https://yourdomain.com

# WhatsApp widget functionality
curl -s https://yourdomain.com | grep -i whatsapp

# Database connection
curl https://api.yourdomain.com/api/health/db
```

### WhatsApp Integration Test

```bash
# Test WhatsApp number format
echo $NEXT_PUBLIC_WHATSAPP_NUMBER | grep -E '^\+[1-9][0-9]{10,14}$'

# Test WhatsApp URL generation
curl -s "https://wa.me/905551234567?text=Test" -o /dev/null -w "%{http_code}"
```

### Log Monitoring

```bash
# Container logs
docker-compose -f docker-compose.prod.yml logs -f

# Specific service logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend

# WhatsApp related logs
docker-compose -f docker-compose.prod.yml logs frontend | grep -i whatsapp

# System logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Grafana Monitoring

```
Grafana Dashboard: http://yourdomain.com:3001
Default Username: admin
Default Password: admin (değiştirin!)
```

## 📱 WhatsApp Business Best Practices

### 1. Mesaj Yönetimi
- Hızlı yanıt (5 dakika içinde)
- Profesyonel dil kullanımı
- Emoji kullanımı (ölçülü)
- Müşteri bilgilerini kaydetme

### 2. Sipariş Süreci
```
1. Müşteri → Ürün sorgusu
2. Kardiyolive → Ürün bilgisi + fiyat
3. Müşteri → Sipariş onayı + adres
4. Kardiyolive → Toplam tutar + kargo bilgisi
5. Müşteri → Ödeme onayı
6. Kardiyolive → Sipariş konfirmasyonu + takip
```

### 3. Müşteri Desteği
- FAQ hazırlama
- Hızlı yanıt mesajları
- Sipariş takip sistemi
- Geri bildirim toplama

### 4. Güvenlik
- Müşteri bilgilerini koruma
- Ödeme bilgilerini WhatsApp'ta paylaşmama
- Güvenli ödeme yönleri önerme

## 🔒 Security Hardening

### 1. Firewall Configuration

```bash
# UFW firewall setup
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. SSL/TLS Configuration

```bash
# Nginx SSL config test
sudo nginx -t

# SSL certificate renewal (Let's Encrypt)
sudo certbot renew --dry-run
```

### 3. WhatsApp Security

```bash
# Environment variable security
grep -r "WHATSAPP" .env* | wc -l

# Validate WhatsApp number format
echo $NEXT_PUBLIC_WHATSAPP_NUMBER | grep -E '^\+[1-9][0-9]{10,14}$'
```

### 4. Docker Security

```bash
# Docker security scan
docker scan kardiyolive/backend:latest
docker scan kardiyolive/frontend:latest
```

## 📊 Performance Optimization

### 1. Database Optimization

```javascript
// MongoDB indexleri verify et
db.products.getIndexes()
db.users.getIndexes()
db.orders.getIndexes()
```

### 2. Caching Setup

```bash
# Redis cache status
docker-compose -f docker-compose.prod.yml exec redis redis-cli ping
```

### 3. WhatsApp Performance

```bash
# WhatsApp widget load time test
curl -w "@curl-format.txt" -o /dev/null -s "https://yourdomain.com"

# Create curl-format.txt:
echo "time_total: %{time_total}\n" > curl-format.txt
```

### 4. Image Optimization

```bash
# Cloudinary setup verify
curl "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/list"
```

## 🔧 Troubleshooting

### Common Issues

1. **WhatsApp Widget Not Showing:**
```bash
# Check environment variable
echo $NEXT_PUBLIC_WHATSAPP_NUMBER

# Check build logs
docker-compose -f docker-compose.prod.yml logs frontend | grep -i whatsapp

# Verify component import
grep -r "WhatsAppWidget" frontend/app/
```

2. **WhatsApp URL Not Working:**
```bash
# Test URL format
curl -I "https://wa.me/905551234567"

# Check phone number format
echo "+905551234567" | grep -E '^\+[1-9][0-9]{10,14}$'
```

3. **Container Won't Start:**
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs backend

# Check ports
netstat -tulpn | grep :5000
```

4. **Database Connection Issues:**
```bash
# Test MongoDB connection
mongosh "your-mongodb-uri"

# Check MongoDB logs
docker-compose -f docker-compose.prod.yml logs mongo
```

## 🎯 Post-Deployment Tasks

### 1. WhatsApp Verification Checklist

- [ ] WhatsApp widget görünüyor mu?
- [ ] Popup 3 saniye sonra açılıyor mu?
- [ ] Floating button çalışıyor mu?
- [ ] Ürün sayfasında özel mesajlar çalışıyor mu?
- [ ] WhatsApp numarası doğru formatta mı?
- [ ] Mesajlar Türkçe karakterlerle sorunsuz gönderiliyor mu?

### 2. Performance Testing

```bash
# Load testing with Apache Bench
ab -n 1000 -c 10 https://yourdomain.com/

# API endpoint testing
ab -n 500 -c 5 https://api.yourdomain.com/api/products

# WhatsApp widget performance
ab -n 100 -c 5 https://yourdomain.com/
```

### 3. Security Testing

```bash
# SSL Labs test
# https://www.ssllabs.com/ssltest/

# Security headers check
curl -I https://yourdomain.com/

# WhatsApp URL security
curl -I "https://wa.me/905551234567?text=test"
```

## 📞 Support ve Maintenance

### Emergency Contacts

- **DevOps**: devops@kardiyolive.com
- **Development**: dev@kardiyolive.com
- **Security**: security@kardiyolive.com
- **WhatsApp Support**: whatsapp@kardiyolive.com

### Maintenance Schedule

- **Daily**: Log monitoring, backup verification, WhatsApp mesaj kontrolü
- **Weekly**: Security updates, performance review, WhatsApp analytics
- **Monthly**: Dependency updates, security scan, WhatsApp template optimization
- **Quarterly**: Infrastructure review, disaster recovery test, WhatsApp strategy review

### WhatsApp Analytics

```bash
# Monthly WhatsApp message stats
grep "whatsapp" /var/log/nginx/access.log | wc -l

# Most clicked WhatsApp buttons
grep "wa.me" /var/log/nginx/access.log | sort | uniq -c | sort -nr
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)

---

## 🎉 Tebrikler!

Kardiyolive e-ticaret platformunuz artık WhatsApp entegrasyonu ile production'da çalışıyor! 

### 📱 WhatsApp Özellikleri:
- ✅ Ana sayfa popup ve floating button
- ✅ Ürün sayfası özel entegrasyonu  
- ✅ Sipariş kapalı bildirimleri
- ✅ Otomatik mesaj templates
- ✅ 7/24 müşteri desteği hazır

İlk müşterilerinizi WhatsApp üzerinden karşılamaya hazırsınız!

**Production URL**: https://yourdomain.com
**Admin Panel**: https://yourdomain.com/admin
**API Documentation**: https://api.yourdomain.com/docs
**WhatsApp Test**: https://wa.me/your-number

---

*Bu rehber Kardiyolive development team tarafından hazırlanmıştır.* 