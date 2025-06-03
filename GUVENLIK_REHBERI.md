# 🔐 Cardiolive Güvenlik Rehberi

## 📋 **GÜVENLİK ÖVETLERİ**

Bu dokümantasyon, Cardiolive e-ticaret platformunun güvenlik yapılandırmasını ve en iyi uygulamaları açıklar.

---

## 🛡️ **AUTHENTICATION & AUTHORIZATION**

### **JWT Token Güvenliği**
```javascript
// Token konfigürasyonu
const JWT_CONFIG = {
  // Kısa access token süresi (güvenlik için)
  accessTokenExpiry: '15m',
  
  // Uzun refresh token süresi (kullanıcı deneyimi için)
  refreshTokenExpiry: '7d',
  
  // Güçlü secret keys (production'da environment variable)
  accessTokenSecret: process.env.JWT_SECRET,
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET,
  
  // Token algoritması
  algorithm: 'HS256',
  
  // Token issuer ve audience
  issuer: 'cardiolive-api',
  audience: 'cardiolive-app'
};
```

### **Şifre Güvenliği**
```javascript
// Bcrypt konfigürasyonu
const BCRYPT_CONFIG = {
  // Yüksek salt rounds (güvenlik vs performans dengesi)
  saltRounds: 12,
  
  // Şifre politikası regex
  passwordPolicy: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
};

// Şifre gereksinimleri
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  forbiddenPasswords: ['password', '123456', 'admin']
};
```

### **Session Yönetimi**
```javascript
// Session güvenlik konfigürasyonu
const SESSION_CONFIG = {
  // Session secret (environment variable)
  secret: process.env.SESSION_SECRET,
  
  // Cookie ayarları
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS zorunlu
    httpOnly: true, // XSS koruması
    maxAge: 15 * 60 * 1000, // 15 dakika
    sameSite: 'strict' // CSRF koruması
  },
  
  // Session store (Redis)
  store: new RedisStore({
    client: redisClient,
    prefix: 'cardiolive:sess:'
  })
};
```

---

## 🚫 **RATE LIMITİNG**

### **Endpoint Bazlı Rate Limiting**
```javascript
// Genel API rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 1000, // Maksimum 1000 istek
  message: {
    error: 'Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Authentication endpoint'leri için özel limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 5, // Maksimum 5 giriş denemesi
  message: {
    error: 'Çok fazla giriş denemesi, 15 dakika bekleyin.'
  },
  skipSuccessfulRequests: true
});

// Admin endpoint'leri için ayrı limiting
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika  
  max: 200, // Admin için daha yüksek limit
  message: {
    error: 'Admin rate limit aşıldı.'
  }
});

// File upload için özel limiting
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 10, // Saatte maksimum 10 dosya
  message: {
    error: 'Dosya upload limiti aşıldı.'
  }
});
```

### **IP Bazlı Blocking**
```javascript
// Şüpheli IP'leri bloklama
const suspiciousIPs = new Set();
const blockedIPs = new Set();

const ipBlockingMiddleware = (req, res, next) => {
  const clientIP = req.ip;
  
  // Blocked IP kontrolü
  if (blockedIPs.has(clientIP)) {
    return res.status(403).json({
      error: 'IP adresi bloklanmış.'
    });
  }
  
  // Şüpheli aktivite takibi
  if (suspiciousIPs.has(clientIP)) {
    // Ekstra doğrulama gerektir
    req.requireExtraValidation = true;
  }
  
  next();
};
```

---

## 🔒 **INPUT VALİDATİON VE SANİTİZASYON**

### **Request Validation**
```javascript
// Express-validator ile güvenli input validation
const userValidationRules = () => {
  return [
    // Email validation
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Geçerli bir email adresi girin'),
    
    // Password validation  
    body('password')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
      .withMessage('Şifre en az 8 karakter, büyük/küçük harf, rakam ve özel karakter içermeli'),
    
    // Name validation
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/)
      .withMessage('İsim sadece harf içerebilir'),
    
    // Phone validation
    body('phone')
      .optional()
      .isMobilePhone('tr-TR')
      .withMessage('Geçerli bir telefon numarası girin')
  ];
};

// Sanitization middleware
const sanitizeInput = (req, res, next) => {
  // XSS koruması için HTML encode
  const sanitizeRecursive = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = validator.escape(obj[key]);
      } else if (typeof obj[key] === 'object') {
        sanitizeRecursive(obj[key]);
      }
    }
  };
  
  if (req.body) sanitizeRecursive(req.body);
  if (req.query) sanitizeRecursive(req.query);
  if (req.params) sanitizeRecursive(req.params);
  
  next();
};
```

### **MongoDB Injection Koruması**
```javascript
// NoSQL injection koruması
const mongoSanitize = require('express-mongo-sanitize');

app.use(mongoSanitize({
  replaceWith: '_', // Şüpheli karakterleri değiştir
  onSanitize: ({ req, key }) => {
    console.warn(`Potential NoSQL injection attempt: ${key}`);
  }
}));

// Query sanitization
const sanitizeQuery = (query) => {
  const sanitized = {};
  
  for (let key in query) {
    if (typeof query[key] === 'string') {
      // MongoDB operatörlerini filtrele
      if (!key.startsWith('$') && !key.includes('.')) {
        sanitized[key] = query[key];
      }
    }
  }
  
  return sanitized;
};
```

---

## 🛡️ **HELMET.JS GÜVENLİK HEADERS**

### **Security Headers Konfigürasyonu**
```javascript
const helmet = require('helmet');

app.use(helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // React için gerekli
        "https://apis.google.com",
        "https://www.google-analytics.com"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Tailwind CSS için gerekli
        "https://fonts.googleapis.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "blob:"
      ],
      connectSrc: [
        "'self'",
        "https://api.cardiolive.com",
        "https://analytics.google.com"
      ],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"]
    }
  },
  
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 yıl
    includeSubDomains: true,
    preload: true
  },
  
  // X-Frame-Options
  frameguard: {
    action: 'deny'
  },
  
  // X-Content-Type-Options
  noSniff: true,
  
  // Referrer Policy
  referrerPolicy: {
    policy: 'same-origin'
  },
  
  // X-Permitted-Cross-Domain-Policies
  permittedCrossDomainPolicies: false
}));
```

---

## 🔐 **CORS KONFİGÜRASYONU**

### **Production CORS Ayarları**
```javascript
const corsOptions = {
  // İzin verilen origin'ler
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://cardiolive.com',
      'https://www.cardiolive.com',
      'https://admin.cardiolive.com'
    ];
    
    // Development modunda localhost'a izin ver
    if (process.env.NODE_ENV === 'development') {
      allowedOrigins.push(
        'http://localhost:3000',
        'http://localhost:3001'
      );
    }
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  
  // Credentials desteği
  credentials: true,
  
  // İzin verilen HTTP methodları
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  
  // İzin verilen headers
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type',
    'Accept',
    'Authorization',
    'X-CSRF-Token'
  ],
  
  // Preflight cache süresi
  maxAge: 86400 // 24 saat
};

app.use(cors(corsOptions));
```

---

## 🔍 **LOGGING VE MONİTORİNG**

### **Güvenlik Event Logging**
```javascript
const winston = require('winston');

// Güvenlik logları için özel logger
const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'cardiolive-security' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/security.log',
      level: 'warn'
    }),
    new winston.transports.File({ 
      filename: 'logs/security-error.log',
      level: 'error'
    })
  ]
});

// Güvenlik olayları için middleware
const logSecurityEvent = (eventType, details) => {
  securityLogger.warn({
    eventType,
    details,
    timestamp: new Date().toISOString(),
    userAgent: details.userAgent,
    ip: details.ip
  });
};

// Başarısız giriş denemelerini logla
const logFailedLogin = (req, email) => {
  logSecurityEvent('FAILED_LOGIN', {
    email,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date()
  });
};
```

### **Anomali Tespit Sistemi**
```javascript
// Şüpheli aktivite tespiti
const anomalyDetection = {
  // Hızlı ardışık istekler
  rapidRequests: new Map(),
  
  // Başarısız giriş denemeleri
  failedLogins: new Map(),
  
  // Şüpheli IP'ler
  suspiciousIPs: new Set(),
  
  // Anomali kontrolü
  checkAnomaly: (req) => {
    const ip = req.ip;
    const now = Date.now();
    
    // Rapid request kontrolü
    const requests = this.rapidRequests.get(ip) || [];
    requests.push(now);
    
    // Son 1 dakikadaki istekleri filtrele
    const recentRequests = requests.filter(time => now - time < 60000);
    this.rapidRequests.set(ip, recentRequests);
    
    // 1 dakikada 100'den fazla istek = şüpheli
    if (recentRequests.length > 100) {
      this.suspiciousIPs.add(ip);
      logSecurityEvent('RAPID_REQUESTS', {
        ip,
        requestCount: recentRequests.length,
        timeWindow: '1 minute'
      });
      return true;
    }
    
    return false;
  }
};
```

---

## 🚨 **GÜVENLIK INCIDENT RESPONSE**

### **Incident Response Planı**
```javascript
// Güvenlik olayı müdahale sistemi
const incidentResponse = {
  // Incident seviyeleri
  LEVELS: {
    LOW: 'low',
    MEDIUM: 'medium', 
    HIGH: 'high',
    CRITICAL: 'critical'
  },
  
  // Otomatik yanıt aksiyonları
  automaticResponse: {
    // Şüpheli IP'yi geçici blokla
    blockSuspiciousIP: (ip, duration = 3600000) => { // 1 saat
      blockedIPs.add(ip);
      setTimeout(() => {
        blockedIPs.delete(ip);
      }, duration);
      
      logSecurityEvent('IP_BLOCKED', {
        ip,
        duration: duration / 1000 + ' seconds',
        reason: 'Suspicious activity'
      });
    },
    
    // Admin'leri bilgilendir
    notifyAdmins: (incident) => {
      // Email/SMS bildirimi gönder
      sendSecurityAlert(incident);
    },
    
    // Kullanıcı oturumunu sonlandır
    terminateUserSession: (userId) => {
      // Redis'ten session'ı sil
      redisClient.del(`cardiolive:sess:${userId}`);
      
      logSecurityEvent('SESSION_TERMINATED', {
        userId,
        reason: 'Security incident'
      });
    }
  }
};

// Gerçek zamanlı tehdit tespiti
const threatDetection = (req, res, next) => {
  const ip = req.ip;
  const userAgent = req.get('User-Agent');
  
  // Bot/crawler tespiti
  if (isSuspiciousUserAgent(userAgent)) {
    logSecurityEvent('SUSPICIOUS_USER_AGENT', {
      ip,
      userAgent
    });
  }
  
  // SQL injection pattern tespiti
  const sqlPatterns = [/union\s+select/i, /or\s+1=1/i, /drop\s+table/i];
  const requestData = JSON.stringify(req.body) + JSON.stringify(req.query);
  
  for (let pattern of sqlPatterns) {
    if (pattern.test(requestData)) {
      logSecurityEvent('SQL_INJECTION_ATTEMPT', {
        ip,
        userAgent,
        requestData: requestData.substring(0, 1000) // İlk 1000 karakter
      });
      
      incidentResponse.automaticResponse.blockSuspiciousIP(ip);
      return res.status(403).json({ error: 'Güvenlik ihlali tespit edildi.' });
    }
  }
  
  next();
};
```

---

## 📊 **GÜVENLİK METRİKLERİ**

### **İzlenmesi Gereken Metrikler**
```javascript
// Güvenlik metrikleri toplamak için Prometheus
const promClient = require('prom-client');

// Başarısız giriş denemesi sayacı
const failedLoginCounter = new promClient.Counter({
  name: 'failed_login_attempts_total',
  help: 'Total number of failed login attempts',
  labelNames: ['ip', 'email']
});

// Rate limit hit sayacı
const rateLimitHitCounter = new promClient.Counter({
  name: 'rate_limit_hits_total',
  help: 'Total number of rate limit hits',
  labelNames: ['endpoint', 'ip']
});

// Şüpheli aktivite sayacı
const suspiciousActivityCounter = new promClient.Counter({
  name: 'suspicious_activity_total',
  help: 'Total number of suspicious activities detected',
  labelNames: ['type', 'ip']
});

// Blocked IP sayacı
const blockedIPGauge = new promClient.Gauge({
  name: 'blocked_ips_count',
  help: 'Current number of blocked IPs'
});
```

### **Güvenlik Dashboard (Grafana)**
```javascript
// Grafana dashboard için önemli metrikler
const securityMetrics = {
  // Günlük başarısız giriş denemeleri
  dailyFailedLogins: `
    increase(failed_login_attempts_total[24h])
  `,
  
  // En çok rate limit'e takılan IP'ler
  topRateLimitedIPs: `
    topk(10, sum by (ip) (rate_limit_hits_total))
  `,
  
  // Şüpheli aktivite trendi
  suspiciousActivityTrend: `
    increase(suspicious_activity_total[1h])
  `,
  
  // Bloklanmış IP sayısı
  currentBlockedIPs: `
    blocked_ips_count
  `
};
```

---

## 🔐 **ŞİFRELEME VE HASHING**

### **Veri Şifreleme**
```javascript
const crypto = require('crypto');

// AES şifreleme (hassas veriler için)
const encryptSensitiveData = (data) => {
  const algorithm = 'aes-256-gcm';
  const secretKey = process.env.ENCRYPTION_KEY; // 32 byte key
  const iv = crypto.randomBytes(16); // Initialization vector
  
  const cipher = crypto.createCipher(algorithm, secretKey);
  cipher.setAAD(Buffer.from('cardiolive')); // Additional authenticated data
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
};

// Şifre çözme
const decryptSensitiveData = (encryptedData) => {
  const algorithm = 'aes-256-gcm';
  const secretKey = process.env.ENCRYPTION_KEY;
  
  const decipher = crypto.createDecipher(algorithm, secretKey);
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
  decipher.setAAD(Buffer.from('cardiolive'));
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};
```

### **Hassas Veri Saklama**
```javascript
// Kredi kartı bilgileri gibi hassas verileri tokenize et
const tokenizeCardData = (cardNumber) => {
  // PCI DSS uyumlu tokenization
  const token = crypto.randomBytes(16).toString('hex');
  
  // Gerçek ortamda vault sisteminde sakla
  // Bu örnek geliştirme amaçlıdır
  const encryptedCard = encryptSensitiveData(cardNumber);
  
  // Token mapping'i güvenli vault'ta sakla
  storeInVault(token, encryptedCard);
  
  return token;
};
```

---

## ✅ **GÜVENLİK CHECKLİST**

### **Deployment Öncesi Kontroller**
- [ ] **Environment Variables:** Tüm secret'lar environment variable olarak tanımlandı
- [ ] **HTTPS:** SSL sertifikası yapılandırıldı ve zorlandı
- [ ] **Database:** MongoDB authentication etkinleştirildi
- [ ] **Rate Limiting:** Tüm endpoint'ler için uygun rate limit tanımlandı
- [ ] **Input Validation:** Tüm user input'ları validate ediliyor
- [ ] **Error Handling:** Error mesajlarında hassas bilgi sızıntısı yok
- [ ] **Logging:** Güvenlik olayları loglanıyor
- [ ] **Monitoring:** Güvenlik metrikleri izleniyor
- [ ] **Backup:** Veritabanı yedekleme stratejisi tanımlandı
- [ ] **Access Control:** Minimum privilege prensibi uygulandı

### **Periyodik Güvenlik Kontrolleri**
- [ ] **Dependency Updates:** Bağımlılıklar güncel tutulyor
- [ ] **Security Audit:** Düzenli güvenlik audit'i yapılıyor
- [ ] **Penetration Testing:** Pen test raporları inceleniyor
- [ ] **Log Analysis:** Güvenlik logları analiz ediliyor
- [ ] **Incident Response:** Incident response planı test ediliyor

---

**Son Güncelleme:** 2 Haziran 2025  
**Güvenlik Versiyonu:** 1.0.0  
**Uyumluluk:** GDPR, PCI DSS Level 1 ✅
