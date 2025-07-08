# 🚀 Kardiyolive cPanel Deployment Rehberi

## 📋 cPanel Deployment Stratejisi

cPanel shared hosting ortamında Kardiyolive projesini deploy etmek için özel bir yaklaşım kullanacağız.

---

## 🔍 Ön Kontrol - cPanel Özellikleri

### 1. **cPanel'inizde Şunları Kontrol Edin:**

```bash
# cPanel'de kontrol edilecekler:
✅ Node.js desteği var mı? (App Manager)
✅ MongoDB desteği var mı?
✅ SSL sertifikası mevcut mu?
✅ Subdomain oluşturabilir misiniz?
✅ File Manager erişimi var mı?
✅ Email accounts oluşturabilir misiniz?
```

### 2. **Hosting Provider Bilgileri:**
- **Hosting Provider**: ?
- **Plan Type**: Shared/VPS/Dedicated
- **Node.js Version**: ?
- **Database Support**: MySQL/PostgreSQL
- **Storage Limit**: ?

---

## 🎯 Deployment Seçenekleri

### Seçenek 1: Hibrit Yaklaşım (Önerilen)
```
Frontend (Static) → cPanel
Backend (External) → Railway/Vercel/Heroku
Database → MongoDB Atlas
WhatsApp Widget → Static Integration
```

### Seçenek 2: Full cPanel (Node.js Destekliyorsa)
```
Frontend → cPanel Static
Backend → cPanel Node.js App
Database → External MongoDB Atlas
```

### Seçenek 3: Static Only
```
Frontend → Static HTML/CSS/JS
Backend → Serverless Functions
Database → External Service
WhatsApp → Client-side only
```

---

## 🚀 Seçenek 1: Hibrit Deployment (Önerilen)

### Adım 1: Frontend Static Build

```bash
# Local bilgisayarınızda:
cd frontend
npm install
npm run build
```

Bu komut `frontend/.next` klasöründe static dosyalar oluşturacak.

### Adım 2: cPanel'e Frontend Upload

1. **cPanel File Manager'a girin**
2. **public_html klasörüne gidin**
3. **Frontend dosyalarını upload edin:**

```
public_html/
├── _next/          (Next.js static files)
├── images/         (Product images)
├── icons/          (App icons)
├── manifest.json
├── index.html
└── ...
```

### Adım 3: External Backend Kurulumu

#### Railway ile Backend Deploy:

```bash
# GitHub'dan Railway'e connect edin
1. Railway.app'e gidin
2. GitHub repository'nizi bağlayın
3. Backend klasörünü seçin
4. Environment variables'ları ayarlayın
```

#### Environment Variables (Railway):
```env
MONGO_URI=mongodb+srv://kardiyolive:kardiyolive2548@kardiyolive.44a1l4a.mongodb.net/?retryWrites=true&w=majority&appName=kardiyolive
JWT_SECRET=your_jwt_secret
FRONTEND_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Adım 4: MongoDB Atlas Setup

```bash
1. MongoDB Atlas'a gidin (https://cloud.mongodb.com)
2. Free cluster oluşturun
3. Database user oluşturun
4. Network access ayarlayın (0.0.0.0/0)
5. Connection string'i alın
```

### Adım 5: Domain ve SSL Konfigürasyonu

```bash
# cPanel'de:
1. SSL sertifikası yükleyin
2. Subdomain oluşturun: api.yourdomain.com → Railway URL
3. CNAME records ayarlayın
```

---

## 🚀 Seçenek 2: Full cPanel Deployment

### Ön Gereksinimler:
- cPanel'de Node.js App Manager
- SSH access (opsiyonel)
- Yeterli storage space

### Adım 1: Node.js App Oluşturma

```bash
# cPanel Node.js App Manager'da:
1. "Create Application" tıklayın
2. Node.js version seçin (18+)
3. Application root: /kardiyolive-backend
4. Application URL: api.yourdomain.com
5. Application startup file: server.js
```

### Adım 2: Backend Dosyalarını Upload

```bash
# File Manager ile:
1. /kardiyolive-backend/ klasörü oluşturun
2. Backend dosyalarını upload edin:
   - package.json
   - server.js
   - src/ klasörü
   - .env dosyası
```

### Adım 3: Dependencies Kurulumu

```bash
# cPanel Terminal veya Node.js App Manager'da:
cd /kardiyolive-backend
npm install
```

### Adım 4: Environment Variables

```bash
# cPanel Node.js App Manager'da Environment Variables:
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret
FRONTEND_URL=https://yourdomain.com
PORT=3001
```

### Adım 5: Application Start

```bash
# Node.js App Manager'da:
1. "Restart" butonuna tıklayın
2. Application durumunu kontrol edin
3. Error logs'u inceleyin
```

---

## 🚀 Seçenek 3: Static Only Deployment

### Adım 1: Static Site Oluşturma

```bash
# Frontend'i static export yapın:
cd frontend
npm run build
npm run export
```

### Adım 2: WhatsApp Widget Konfigürasyonu

```html
<!-- public_html/index.html içinde -->
<script>
// WhatsApp Widget Configuration
window.KARDIYOLIVE_CONFIG = {
  whatsappNumber: '+905XXXXXXXXX',
  businessName: 'Kardiyolive',
  defaultMessage: 'Merhaba! Kardiyolive ürünleri hakkında bilgi almak istiyorum.'
};
</script>
```

### Adım 3: Contact Form Setup

```php
<?php
// public_html/contact.php
if ($_POST) {
    $name = $_POST['name'];
    $email = $_POST['email'];
    $message = $_POST['message'];
    
    $to = 'info@yourdomain.com';
    $subject = 'Kardiyolive İletişim Formu';
    $body = "Ad: $name\nEmail: $email\nMesaj: $message";
    
    mail($to, $subject, $body);
    
    echo json_encode(['success' => true]);
}
?>
```

---

## 📱 WhatsApp Integration (Tüm Seçenekler)

### Static JavaScript Implementation:

```javascript
// public_html/js/whatsapp-widget.js
class KardiyoliveWhatsApp {
    constructor(config) {
        this.phoneNumber = config.phoneNumber;
        this.defaultMessage = config.defaultMessage;
        this.init();
    }
    
    init() {
        this.createWidget();
        this.addEventListeners();
        setTimeout(() => this.showPopup(), 3000);
    }
    
    createWidget() {
        const widget = document.createElement('div');
        widget.innerHTML = `
            <div id="whatsapp-widget" class="whatsapp-widget">
                <div id="whatsapp-popup" class="whatsapp-popup" style="display: none;">
                    <div class="popup-header">
                        <h3>Kardiyolive Destek</h3>
                        <span class="close-popup">&times;</span>
                    </div>
                    <div class="popup-content">
                        <p>Merhaba! Size nasıl yardımcı olabiliriz?</p>
                        <button onclick="kardiyoliveWhatsApp.sendMessage()">
                            WhatsApp'ta Mesaj Gönder
                        </button>
                    </div>
                </div>
                <div class="whatsapp-button" onclick="kardiyoliveWhatsApp.togglePopup()">
                    <span>💬</span>
                </div>
            </div>
        `;
        document.body.appendChild(widget);
    }
    
    sendMessage(customMessage = null) {
        const message = customMessage || this.defaultMessage;
        const url = `https://wa.me/${this.phoneNumber.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
        this.hidePopup();
    }
    
    togglePopup() {
        const popup = document.getElementById('whatsapp-popup');
        popup.style.display = popup.style.display === 'none' ? 'block' : 'none';
    }
    
    showPopup() {
        document.getElementById('whatsapp-popup').style.display = 'block';
    }
    
    hidePopup() {
        document.getElementById('whatsapp-popup').style.display = 'none';
    }
}

// Initialize
const kardiyoliveWhatsApp = new KardiyoliveWhatsApp({
    phoneNumber: '+905XXXXXXXXX',
    defaultMessage: 'Merhaba! Kardiyolive ürünleri hakkında bilgi almak istiyorum.'
});
```

### CSS Styling:

```css
/* public_html/css/whatsapp-widget.css */
.whatsapp-widget {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
}

.whatsapp-button {
    width: 60px;
    height: 60px;
    background-color: #25d366;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 24px;
    animation: bounce 2s infinite;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.whatsapp-popup {
    position: absolute;
    bottom: 80px;
    right: 0;
    width: 300px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
    border: 1px solid #e0e0e0;
}

.popup-header {
    background: #075e54;
    color: white;
    padding: 15px;
    border-radius: 12px 12px 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.popup-content {
    padding: 20px;
}

.popup-content button {
    background: #25d366;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 8px;
    cursor: pointer;
    width: 100%;
    font-size: 14px;
    margin-top: 15px;
}

@keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
    }
    40% {
        transform: translateY(-10px);
    }
    60% {
        transform: translateY(-5px);
    }
}

/* Responsive */
@media (max-width: 768px) {
    .whatsapp-widget {
        bottom: 15px;
        right: 15px;
    }
    
    .whatsapp-popup {
        width: 280px;
        right: -220px;
    }
}
```

---

## 📧 Email Konfigürasyonu

### cPanel Email Accounts:

```bash
# cPanel'de email accounts oluşturun:
1. info@yourdomain.com (Genel bilgi)
2. orders@yourdomain.com (Siparişler)
3. support@yourdomain.com (Destek)
```

### PHP Mail Setup:

```php
<?php
// public_html/includes/mail-config.php
function sendKardiyoliveEmail($to, $subject, $message, $fromName = 'Kardiyolive') {
    $headers = [
        'From: ' . $fromName . ' <noreply@yourdomain.com>',
        'Reply-To: info@yourdomain.com',
        'Content-Type: text/html; charset=UTF-8',
        'X-Mailer: PHP/' . phpversion()
    ];
    
    return mail($to, $subject, $message, implode("\r\n", $headers));
}
?>
```

---

## 🔧 File Structure (cPanel)

```
public_html/
├── index.html                 (Ana sayfa)
├── products/
│   ├── index.html
│   └── [product-pages].html
├── cart/
│   └── index.html
├── checkout/
│   └── whatsapp-redirect.html
├── css/
│   ├── main.css
│   └── whatsapp-widget.css
├── js/
│   ├── main.js
│   └── whatsapp-widget.js
├── images/
│   ├── products/
│   ├── gallery/
│   └── icons/
├── includes/
│   ├── header.php
│   ├── footer.php
│   └── mail-config.php
├── api/ (eğer PHP kullanıyorsanız)
│   ├── contact.php
│   ├── newsletter.php
│   └── order-inquiry.php
└── .htaccess
```

---

## ⚙️ .htaccess Konfigürasyonu

```apache
# public_html/.htaccess
RewriteEngine On

# HTTPS Redirect
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Clean URLs
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^products/([^/]+)/?$ /product.php?slug=$1 [L,QSA]

# Security Headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache Control
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
```

---

## 📱 Mobile Optimization

### Responsive Meta Tags:

```html
<!-- Tüm HTML sayfalarında -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#075e54">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">

<!-- PWA için -->
<link rel="manifest" href="/manifest.json">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
```

### manifest.json:

```json
{
  "name": "Kardiyolive",
  "short_name": "Kardiyolive",
  "description": "Premium zeytinyağı ve doğal ürünler",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#075e54",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 🚦 Deployment Adımları (Özet)

### 1. **Hazırlık (Local)**
```bash
git clone https://github.com/denizsari/Kardiyolive.git
cd Kardiyolive/frontend
npm install
npm run build
```

### 2. **cPanel Upload**
```bash
# File Manager ile:
1. public_html'e gidin
2. Build dosyalarını upload edin
3. WhatsApp widget'ı entegre edin
4. Email forms'ları setup edin
```

### 3. **External Services**
```bash
# MongoDB Atlas setup
# Railway/Vercel backend deploy (opsiyonel)
# Email service configuration
```

### 4. **Domain Configuration**
```bash
# SSL certificate
# Subdomain setup (api.domain.com)
# CNAME records
```

### 5. **Testing**
```bash
# Website functionality
# WhatsApp widget
# Contact forms
# Mobile responsiveness
# SSL certificate
```

---

## 🔍 Troubleshooting

### Common cPanel Issues:

1. **Node.js App Başlamıyor:**
```bash
# cPanel App Manager'da:
- Node version kontrolü
- Package.json syntax kontrolü
- Environment variables kontrolü
- Error logs inceleme
```

2. **WhatsApp Widget Çalışmıyor:**
```bash
# Browser console'da:
- JavaScript errors kontrolü
- CORS issues kontrolü
- Phone number format kontrolü
```

3. **Email Gönderilmiyor:**
```bash
# PHP mail function:
- SMTP settings kontrolü
- SPF/DKIM records
- Email account existence
```

4. **SSL Certificate Issues:**
```bash
# cPanel SSL/TLS:
- Certificate installation
- Force HTTPS redirect
- Mixed content issues
```

---

## 📊 Performance Optimization

### Image Optimization:
```bash
# Local'de optimize edin:
1. WebP format kullanın
2. Compression uygulayın
3. Lazy loading ekleyin
4. CDN kullanmayı düşünün
```

### Caching Strategy:
```bash
# .htaccess ile:
1. Browser caching
2. Gzip compression
3. ETags
4. Expires headers
```

### WhatsApp Widget Optimization:
```javascript
// Lazy load WhatsApp widget
window.addEventListener('load', function() {
    setTimeout(() => {
        loadWhatsAppWidget();
    }, 1000);
});
```

---

## 🎯 Next Steps

### 1. **cPanel Bilgilerinizi Hazırlayın:**
- Hosting provider
- cPanel URL ve login
- Domain name
- SSL certificate status

### 2. **Hangi Seçeneği Tercih Ediyorsunuz:**
- **Seçenek 1**: Hibrit (Static frontend + External backend)
- **Seçenek 2**: Full cPanel (Node.js destekliyorsa)
- **Seçenek 3**: Static only

### 3. **WhatsApp Business Account:**
- WhatsApp Business app kurulumu
- Phone number preparation
- Business profile setup

---

**🤔 Hangi seçeneği tercih ediyorsunuz? cPanel'inizin özelliklerini paylaşabilir misiniz?**

Bu bilgilere göre size en uygun deployment stratejisini detaylandırabilirim! 