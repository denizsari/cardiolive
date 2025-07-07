# Kardiyolive E-ticaret Projesi Deployment Rehberi

## 🚀 Production Deployment

### Backend Deployment (Node.js)

1. **Environment Variables Ayarlama:**
   ```bash
   cp .env.example .env
   # .env dosyasını production değerleriyle düzenleyin
   ```

2. **Production Dependencies:**
   ```bash
   npm ci --production
   ```

3. **PM2 ile Production Deployment:**
   ```bash
   npm install -g pm2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

### Frontend Deployment (Next.js)

1. **Environment Variables:**
   ```bash
   cp .env.example .env.local
   # Production API URL'ini ayarlayın
   ```

2. **Build Process:**
   ```bash
   npm run build
   npm start
   ```

3. **Vercel Deployment:**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

## 🔧 Production Checklist

### Security
- [ ] JWT secrets güncellendi
- [ ] MongoDB connection string production'a ayarlandı
- [ ] CORS ayarları production domain'e göre yapılandırıldı
- [ ] Rate limiting aktif
- [ ] Helmet security headers aktif

### Performance
- [ ] Database indexler oluşturuldu
- [ ] Image optimization aktif
- [ ] Compression middleware aktif
- [ ] Caching stratejisi belirlendi

### Monitoring
- [ ] Error logging sistemi kuruldu
- [ ] Performance monitoring aktif
- [ ] Health check endpoints test edildi

## 📊 Database Indexes

MongoDB'de performans için gerekli indexler:

```javascript
// Users collection
db.users.createIndex({ email: 1 }, { unique: true })

// Products collection
db.products.createIndex({ category: 1 })
db.products.createIndex({ name: "text", description: "text" })

// Orders collection
db.orders.createIndex({ user: 1 })
db.orders.createIndex({ orderId: 1 }, { unique: true })
db.orders.createIndex({ status: 1 })

// Blogs collection
db.blogs.createIndex({ title: "text", content: "text" })
db.blogs.createIndex({ isActive: 1 })
```

## 🔄 Backup Strategy

1. **MongoDB Backup:**
   ```bash
   mongodump --uri="your_connection_string" --out backup/$(date +%Y%m%d)
   ```

2. **Automated Backup Script:**
   ```bash
   #!/bin/bash
   # backup.sh
   DATE=$(date +%Y%m%d_%H%M%S)
   mongodump --uri="$MONGO_URI" --out "/backups/$DATE"
   find /backups -type d -mtime +7 -exec rm -rf {} +
   ```

## 📈 Scaling Considerations

1. **Database Scaling:**
   - MongoDB Atlas cluster scaling
   - Read replicas for better performance
   - Sharding for large datasets

2. **Application Scaling:**
   - Load balancer setup
   - Multiple backend instances
   - CDN for static assets

3. **Caching:**
   - Redis for session storage
   - Database query caching
   - API response caching
