const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const { body, validationResult } = require('express-validator');
const ResponseHandler = require('../utils/responseHandler');

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://yourdomain.com'
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-CSRF-Token']
};

// Helmet configuration for security headers
const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
};

// Simple CSRF protection using custom tokens
const generateCsrfToken = () => {
  return require('crypto').randomBytes(32).toString('hex');
};

// Store CSRF tokens in memory (in production, use Redis or similar)
const csrfTokens = new Map();

// CSRF protection middleware
const csrfProtection = (req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }

  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionId = req.sessionID || req.ip;

  if (!token || !csrfTokens.has(sessionId) || csrfTokens.get(sessionId) !== token) {
    return ResponseHandler.forbidden(res, 'Invalid CSRF token');
  }

  next();
};

// Input sanitization middleware
const sanitizeInput = [
  body('*').trim().escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHandler.badRequest(res, 'Invalid input data', { 
        errors: errors.array() 
      });
    }
    next();
  }
];

// XSS protection middleware
const xssProtection = (req, res, next) => {
  const xssPattern = /<script[^>]*>.*?<\/script>/gi;
  
  // Check body for XSS
  if (req.body) {
    const bodyStr = JSON.stringify(req.body);
    if (xssPattern.test(bodyStr)) {
      return ResponseHandler.badRequest(res, 'Potentially malicious content detected');
    }
  }
  
  // Check query parameters for XSS
  if (req.query) {
    const queryStr = JSON.stringify(req.query);
    if (xssPattern.test(queryStr)) {
      return ResponseHandler.badRequest(res, 'Potentially malicious content detected');
    }
  }
  
  next();
};

// SQL injection protection middleware
const sqlInjectionProtection = (req, res, next) => {
  const sqlPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi;
  
  // Check body for SQL injection
  if (req.body) {
    const bodyStr = JSON.stringify(req.body);
    if (sqlPattern.test(bodyStr)) {
      return ResponseHandler.badRequest(res, 'Potentially malicious SQL detected');
    }
  }
  
  // Check query parameters for SQL injection
  if (req.query) {
    const queryStr = JSON.stringify(req.query);
    if (sqlPattern.test(queryStr)) {
      return ResponseHandler.badRequest(res, 'Potentially malicious SQL detected');
    }
  }
  
  next();
};

// CSRF token endpoint
const getCsrfToken = (req, res) => {
  const token = generateCsrfToken();
  const sessionId = req.sessionID || req.ip;
  
  // Store token for this session
  csrfTokens.set(sessionId, token);
  
  // Clean up old tokens (simple cleanup)
  if (csrfTokens.size > 1000) {
    const entries = Array.from(csrfTokens.entries());
    entries.slice(0, 500).forEach(([key]) => csrfTokens.delete(key));
  }

  ResponseHandler.success(res, 'CSRF token generated', {
    csrfToken: token
  });
};

// Apply security middleware
const applySecurity = (app) => {
  // Basic security
  app.use(helmet(helmetConfig));
  app.use(cors(corsOptions));
  app.use(cookieParser());
  
  // Trust proxy if behind reverse proxy
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }
  
  // CSRF token endpoint
  app.get('/api/csrf-token', getCsrfToken);
  
  // Apply CSRF protection to API routes (optional for now)
  if (process.env.ENABLE_CSRF === 'true') {
    app.use('/api', (req, res, next) => {
      // Skip CSRF for auth endpoints and GET requests
      const skipCsrfPaths = ['/api/auth/login', '/api/auth/register', '/api/csrf-token'];
      const isSkipPath = skipCsrfPaths.some(path => req.path.startsWith(path));
      
      if (isSkipPath || req.method === 'GET') {
        return next();
      }
      
      return csrfProtection(req, res, next);
    });
  }
  
  // XSS and SQL injection protection
  app.use('/api', xssProtection);
  app.use('/api', sqlInjectionProtection);
};

module.exports = {
  applySecurity,
  corsOptions,
  helmetConfig,
  csrfProtection,
  sanitizeInput,
  xssProtection,
  sqlInjectionProtection,
  getCsrfToken
};
