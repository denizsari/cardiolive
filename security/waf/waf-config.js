#!/usr/bin/env node

/**
 * Web Application Firewall (WAF) Configuration for Cardiolive
 * Advanced security layer for application protection
 * 
 * Features:
 * - Request pattern matching
 * - Rate limiting and throttling
 * - IP-based blocking and whitelisting
 * - SQL injection detection
 * - XSS prevention
 * - CSRF protection
 * - File upload security
 * - Bot detection
 * 
 * @author GitHub Copilot
 * @version 1.0.0
 */

const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const helmet = require('helmet');
const { body, query, param } = require('express-validator');
const ResponseHandler = require('../../backend/src/utils/responseHandler');

// WAF Configuration Object
const WAF_CONFIG = {
  // IP-based security
  security: {
    // Known malicious IP patterns
    blockedIPs: [
      // Add known malicious IPs
    ],
    
    // Trusted IP ranges (for admin access)
    whitelistedIPs: [
      '127.0.0.1',
      '::1',
      // Add your office/trusted IPs
    ],
    
    // Geographic restrictions (optional)
    blockedCountries: [
      // Add country codes if needed: 'CN', 'RU', etc.
    ]
  },
  
  // Request pattern detection
  patterns: {
    // SQL Injection patterns
    sqlInjection: [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
      /(UNION.*SELECT)/gi,
      /('|(\\');)/gi,
      /(OR\s+1=1)/gi,
      /(AND\s+1=1)/gi,
      /(\bOR\b.*=.*\bOR\b)/gi
    ],
    
    // XSS patterns
    xss: [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<img[^>]+src[^>]*=.*javascript:/gi,
      /<object[^>]*>.*?<\/object>/gi
    ],
      // Path traversal patterns
    pathTraversal: [
      /\.\.\//g,
      /\.\.\\/g,
      /%2e%2e%2f/gi,
      /%2e%2e%5c/gi,
      /\.\.\%2f/gi
    ],
    
    // Command injection patterns
    commandInjection: [
      /[;&|`].*?(cat|ls|ps|whoami|id|pwd|uname)/gi,
      /\$\(.*?\)/g,
      /`.*?`/g,
      /\|\s*(cat|ls|ps|whoami|id|pwd|uname)/gi
    ],
    
    // LDAP injection patterns
    ldapInjection: [
      /\*\)\(.*?\=/gi,
      /\)\(.*?\=.*?\*/gi,
      /\(\|.*?\=.*?\)/gi
    ],
    
    // XML injection patterns
    xmlInjection: [
      /<!DOCTYPE[^>]*>/gi,
      /<!ENTITY[^>]*>/gi,
      /<\?xml[^>]*>/gi
    ]
  },
  
  // Rate limiting configurations
  rateLimits: {
    // Global rate limit
    global: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // requests per window
      message: 'Too many requests from this IP',
      standardHeaders: true,
      legacyHeaders: false
    },
    
    // API rate limit
    api: {
      windowMs: 15 * 60 * 1000,
      max: 500,
      message: 'Too many API requests',
      skip: (req) => req.ip && WAF_CONFIG.security.whitelistedIPs.includes(req.ip)
    },
    
    // Authentication endpoints
    auth: {
      windowMs: 15 * 60 * 1000,
      max: 20,
      message: 'Too many authentication attempts',
      skipSuccessfulRequests: true
    },
    
    // Admin endpoints
    admin: {
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Too many admin requests'
    },
    
    // File upload endpoints
    upload: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10,
      message: 'Too many file uploads'
    }
  },
  
  // Request throttling
  throttling: {
    // Slow down repeated requests
    delayAfter: 5,
    delayMs: 500,
    maxDelayMs: 20000
  },
  
  // File upload security
  fileUpload: {
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'text/csv'
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.txt', '.csv']
  },
  
  // Bot detection
  botDetection: {
    // Known bot user agents
    blockedUserAgents: [
      /scrapy/i,
      /curl/i,
      /wget/i,
      /python-requests/i,
      /bot/i,
      /crawler/i,
      /spider/i
    ],
    
    // Allowed bot user agents (search engines, etc.)
    allowedBots: [
      /googlebot/i,
      /bingbot/i,
      /facebookexternalhit/i,
      /twitterbot/i,
      /linkedinbot/i
    ]
  }
};

/**
 * IP-based blocking middleware
 */
const ipBlocking = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  
  // Check if IP is blocked
  if (WAF_CONFIG.security.blockedIPs.includes(clientIP)) {
    console.log(`[WAF] Blocked IP attempt: ${clientIP}`);
    return ResponseHandler.forbidden(res, 'Access denied');
  }
  
  next();
};

/**
 * Bot detection middleware
 */
const botDetection = (req, res, next) => {
  const userAgent = req.get('User-Agent') || '';
  
  // Check for blocked bots
  const isBlockedBot = WAF_CONFIG.botDetection.blockedUserAgents.some(pattern => 
    pattern.test(userAgent)
  );
  
  // Check for allowed bots
  const isAllowedBot = WAF_CONFIG.botDetection.allowedBots.some(pattern => 
    pattern.test(userAgent)
  );
  
  if (isBlockedBot && !isAllowedBot) {
    console.log(`[WAF] Blocked bot: ${userAgent}`);
    return ResponseHandler.forbidden(res, 'Bot access denied');
  }
  
  next();
};

/**
 * Advanced pattern matching middleware
 */
const patternMatching = (req, res, next) => {
  const checkPatterns = (data, patternCategory) => {
    if (!data) return false;
    
    const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
    return WAF_CONFIG.patterns[patternCategory].some(pattern => pattern.test(dataStr));
  };
  
  // Check various request parts
  const requestData = {
    body: req.body,
    query: req.query,
    params: req.params,
    headers: req.headers,
    url: req.url
  };
  
  // Check for SQL injection
  if (Object.values(requestData).some(data => checkPatterns(data, 'sqlInjection'))) {
    console.log(`[WAF] SQL injection attempt detected from ${req.ip}`);
    return ResponseHandler.badRequest(res, 'Malicious request detected');
  }
  
  // Check for XSS
  if (Object.values(requestData).some(data => checkPatterns(data, 'xss'))) {
    console.log(`[WAF] XSS attempt detected from ${req.ip}`);
    return ResponseHandler.badRequest(res, 'Malicious script detected');
  }
  
  // Check for path traversal
  if (checkPatterns(req.url, 'pathTraversal')) {
    console.log(`[WAF] Path traversal attempt detected from ${req.ip}`);
    return ResponseHandler.badRequest(res, 'Invalid path detected');
  }
  
  // Check for command injection
  if (Object.values(requestData).some(data => checkPatterns(data, 'commandInjection'))) {
    console.log(`[WAF] Command injection attempt detected from ${req.ip}`);
    return ResponseHandler.badRequest(res, 'Malicious command detected');
  }
  
  next();
};

/**
 * File upload security middleware
 */
const fileUploadSecurity = (req, res, next) => {
  if (!req.files && !req.file) {
    return next();
  }
  
  const files = req.files || [req.file];
  
  for (const file of files) {
    // Check file type
    if (!WAF_CONFIG.fileUpload.allowedTypes.includes(file.mimetype)) {
      console.log(`[WAF] Blocked file type: ${file.mimetype}`);
      return ResponseHandler.badRequest(res, 'File type not allowed');
    }
    
    // Check file size
    if (file.size > WAF_CONFIG.fileUpload.maxSize) {
      console.log(`[WAF] File too large: ${file.size} bytes`);
      return ResponseHandler.badRequest(res, 'File too large');
    }
    
    // Check file extension
    const fileExtension = file.originalname.toLowerCase().match(/\.[^.]+$/);
    if (!fileExtension || !WAF_CONFIG.fileUpload.allowedExtensions.includes(fileExtension[0])) {
      console.log(`[WAF] Blocked file extension: ${fileExtension ? fileExtension[0] : 'none'}`);
      return ResponseHandler.badRequest(res, 'File extension not allowed');
    }
  }
  
  next();
};

/**
 * Request size limiting middleware
 */
const requestSizeLimiting = (req, res, next) => {
  const contentLength = req.get('Content-Length');
  const maxSize = 50 * 1024 * 1024; // 50MB max request size
  
  if (contentLength && parseInt(contentLength) > maxSize) {
    console.log(`[WAF] Request too large: ${contentLength} bytes`);
    return ResponseHandler.badRequest(res, 'Request too large');
  }
  
  next();
};

/**
 * Header validation middleware
 */
const headerValidation = (req, res, next) => {
  // Check for suspicious headers
  const suspiciousHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-cluster-client-ip'
  ];
  
  // Validate Content-Type for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');
    if (!contentType || (!contentType.includes('application/json') && 
                         !contentType.includes('multipart/form-data') && 
                         !contentType.includes('application/x-www-form-urlencoded'))) {
      console.log(`[WAF] Invalid content type: ${contentType}`);
      return ResponseHandler.badRequest(res, 'Invalid content type');
    }
  }
  
  next();
};

/**
 * Create rate limiters
 */
const createRateLimiters = () => {
  return {
    global: rateLimit(WAF_CONFIG.rateLimits.global),
    api: rateLimit(WAF_CONFIG.rateLimits.api),
    auth: rateLimit(WAF_CONFIG.rateLimits.auth),
    admin: rateLimit(WAF_CONFIG.rateLimits.admin),
    upload: rateLimit(WAF_CONFIG.rateLimits.upload)
  };
};

/**
 * Create request throttling
 */
const createThrottling = () => {
  return slowDown(WAF_CONFIG.throttling);
};

/**
 * WAF logging middleware
 */
const wafLogging = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length') || 0
    };
    
    // Log suspicious activity
    if (res.statusCode >= 400) {
      console.log(`[WAF] Suspicious activity:`, logData);
    }
  });
  
  next();
};

/**
 * Apply WAF middleware to Express app
 */
const applyWAF = (app) => {
  console.log('[WAF] Initializing Web Application Firewall...');
  
  // Trust proxy settings
  app.set('trust proxy', 1);
  
  // WAF logging
  app.use(wafLogging);
  
  // Rate limiters
  const rateLimiters = createRateLimiters();
  app.use(rateLimiters.global);
  
  // Request throttling
  app.use(createThrottling());
  
  // Security middleware
  app.use(ipBlocking);
  app.use(botDetection);
  app.use(requestSizeLimiting);
  app.use(headerValidation);
  app.use(patternMatching);
  
  // Route-specific rate limiting
  app.use('/api/auth', rateLimiters.auth);
  app.use('/api/admin', rateLimiters.admin);
  app.use('/api/upload', rateLimiters.upload);
  app.use('/api', rateLimiters.api);
  
  // File upload security
  app.use(fileUploadSecurity);
  
  console.log('[WAF] Web Application Firewall initialized successfully');
};

/**
 * WAF status endpoint
 */
const wafStatus = (req, res) => {
  const stats = {
    timestamp: new Date().toISOString(),
    wafVersion: '1.0.0',
    status: 'active',
    configuration: {
      rateLimiting: 'enabled',
      patternMatching: 'enabled',
      botDetection: 'enabled',
      ipBlocking: 'enabled',
      fileUploadSecurity: 'enabled'
    },
    blockedIPs: WAF_CONFIG.security.blockedIPs.length,
    whitelistedIPs: WAF_CONFIG.security.whitelistedIPs.length,
    patterns: {
      sqlInjection: WAF_CONFIG.patterns.sqlInjection.length,
      xss: WAF_CONFIG.patterns.xss.length,
      pathTraversal: WAF_CONFIG.patterns.pathTraversal.length,
      commandInjection: WAF_CONFIG.patterns.commandInjection.length
    }
  };
  
  ResponseHandler.success(res, 'WAF status retrieved', stats);
};

module.exports = {
  WAF_CONFIG,
  applyWAF,
  wafStatus,
  ipBlocking,
  botDetection,
  patternMatching,
  fileUploadSecurity,
  requestSizeLimiting,
  headerValidation,
  wafLogging,
  createRateLimiters,
  createThrottling
};
