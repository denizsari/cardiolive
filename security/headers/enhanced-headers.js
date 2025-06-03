#!/usr/bin/env node

/**
 * Enhanced Security Headers Configuration for Cardiolive
 * Advanced Content Security Policy and security header management
 * 
 * Features:
 * - Advanced Content Security Policy (CSP)
 * - HTTP Strict Transport Security (HSTS)
 * - X-Frame-Options and clickjacking protection
 * - Cross-Origin policies
 * - Permission policies
 * - Security reporting
 * 
 * @author GitHub Copilot
 * @version 1.0.0
 */

const helmet = require('helmet');
const ResponseHandler = require('../../backend/src/utils/responseHandler');

// Security Headers Configuration
const SECURITY_CONFIG = {
  // Environment-based configurations
  development: {
    csp: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        blockAllMixedContent: [],
        fontSrc: ["'self'", "https:", "data:"],
        frameAncestors: ["'none'"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        objectSrc: ["'none'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'", // Allow for development
          "'unsafe-eval'", // Allow for development
          "https://cdn.jsdelivr.net",
          "https://unpkg.com"
        ],
        scriptSrcAttr: ["'none'"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'", // Allow for development
          "https://fonts.googleapis.com",
          "https://cdn.jsdelivr.net"
        ],
        upgradeInsecureRequests: [],
        connectSrc: [
          "'self'",
          "ws://localhost:*", // WebSocket for development
          "wss://localhost:*",
          "http://localhost:*",
          "https://api.stripe.com"
        ],
        mediaSrc: ["'self'", "data:", "blob:"],
        manifestSrc: ["'self'"],
        workerSrc: ["'self'", "blob:"]
      },
      reportOnly: false
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: false // Don't preload in development
    }
  },
  
  production: {
    csp: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        blockAllMixedContent: [],
        fontSrc: [
          "'self'",
          "https:",
          "data:",
          "https://fonts.gstatic.com"
        ],
        frameAncestors: ["'none'"],
        imgSrc: [
          "'self'",
          "data:",
          "https:",
          "blob:",
          "https://images.unsplash.com",
          "https://via.placeholder.com"
        ],
        objectSrc: ["'none'"],
        scriptSrc: [
          "'self'",
          "'nonce-{NONCE}'", // Dynamic nonce generation
          "https://js.stripe.com",
          "https://checkout.stripe.com",
          "https://www.google-analytics.com",
          "https://www.googletagmanager.com"
        ],
        scriptSrcAttr: ["'none'"],
        styleSrc: [
          "'self'",
          "'nonce-{NONCE}'", // Dynamic nonce generation
          "https://fonts.googleapis.com"
        ],
        upgradeInsecureRequests: [],
        connectSrc: [
          "'self'",
          "https://api.stripe.com",
          "https://www.google-analytics.com",
          "https://vitals.vercel-analytics.com"
        ],
        mediaSrc: ["'self'", "data:", "blob:"],
        manifestSrc: ["'self'"],
        workerSrc: ["'self'", "blob:"],
        formAction: ["'self'"],
        navigateTo: ["'self'"]
      },
      reportOnly: false,
      reportUri: '/api/security/csp-report'
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }
};

// Additional security headers
const ADDITIONAL_HEADERS = {
  // X-Frame-Options
  frameOptions: {
    action: 'deny'
  },
  
  // X-Content-Type-Options
  noSniff: true,
  
  // X-XSS-Protection
  xssFilter: true,
  
  // Referrer-Policy
  referrerPolicy: {
    policy: ['strict-origin-when-cross-origin']
  },
  
  // Cross-Origin-Opener-Policy
  crossOriginOpenerPolicy: {
    policy: 'same-origin'
  },
  
  // Cross-Origin-Resource-Policy
  crossOriginResourcePolicy: {
    policy: 'same-origin'
  },
  
  // Cross-Origin-Embedder-Policy
  crossOriginEmbedderPolicy: {
    policy: 'require-corp'
  },
  
  // Permissions Policy (Feature Policy)
  permissionsPolicy: {
    features: {
      geolocation: [],
      camera: [],
      microphone: [],
      gyroscope: [],
      magnetometer: [],
      accelerometer: [],
      usb: [],
      payment: ["'self'"],
      fullscreen: ["'self'"],
      'display-capture': []
    }
  }
};

// CSP Nonce Generator
const generateNonce = () => {
  return require('crypto').randomBytes(16).toString('base64');
};

// CSP Violation Reporter
const cspReportHandler = (req, res) => {
  try {
    const report = req.body;
    
    // Log CSP violation
    console.log('[Security] CSP Violation Report:', {
      timestamp: new Date().toISOString(),
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      violation: report
    });
    
    // Store violation data for analysis
    // In production, you might want to store this in a database
    
    ResponseHandler.success(res, 'CSP report received');
  } catch (error) {
    console.error('[Security] CSP report processing failed:', error);
    ResponseHandler.error(res, 'Failed to process CSP report');
  }
};

// Security Headers Middleware
const createSecurityMiddleware = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const config = isProduction ? SECURITY_CONFIG.production : SECURITY_CONFIG.development;
  
  return (req, res, next) => {
    // Generate nonce for this request
    const nonce = generateNonce();
    req.nonce = nonce;
    
    // Replace nonce placeholder in CSP directives
    const cspDirectives = { ...config.csp.directives };
    Object.keys(cspDirectives).forEach(directive => {
      if (Array.isArray(cspDirectives[directive])) {
        cspDirectives[directive] = cspDirectives[directive].map(value => 
          value.replace('{NONCE}', nonce)
        );
      }
    });
    
    // Apply Helmet with dynamic configuration
    helmet({
      // Content Security Policy
      contentSecurityPolicy: {
        ...config.csp,
        directives: cspDirectives
      },
      
      // HTTP Strict Transport Security
      hsts: config.hsts,
      
      // Additional security headers
      ...ADDITIONAL_HEADERS,
      
      // Disable conflicting defaults
      crossOriginEmbedderPolicy: false // Will be set manually below
    })(req, res, () => {
      // Additional custom headers
      
      // Security headers
      res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
      res.setHeader('X-Download-Options', 'noopen');
      
      // Performance headers
      res.setHeader('X-DNS-Prefetch-Control', 'off');
      
      // Custom security headers
      res.setHeader('X-Request-ID', req.id || generateNonce());
      res.setHeader('X-Response-Time', Date.now());
      
      // Server information hiding
      res.removeHeader('X-Powered-By');
      res.removeHeader('Server');
      
      // CORS security headers
      if (isProduction) {
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      }
      
      next();
    });
  };
};

// Security Headers Audit
const auditSecurityHeaders = (req, res) => {
  const headers = res.getHeaders();
  
  const audit = {
    timestamp: new Date().toISOString(),
    request: {
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    },
    headers: {
      'content-security-policy': headers['content-security-policy'] ? 'Present' : 'Missing',
      'strict-transport-security': headers['strict-transport-security'] ? 'Present' : 'Missing',
      'x-frame-options': headers['x-frame-options'] ? 'Present' : 'Missing',
      'x-content-type-options': headers['x-content-type-options'] ? 'Present' : 'Missing',
      'x-xss-protection': headers['x-xss-protection'] ? 'Present' : 'Missing',
      'referrer-policy': headers['referrer-policy'] ? 'Present' : 'Missing',
      'permissions-policy': headers['permissions-policy'] ? 'Present' : 'Missing'
    },
    compliance: {
      basic: true,
      advanced: true,
      score: 0
    }
  };
  
  // Calculate compliance score
  const requiredHeaders = [
    'content-security-policy',
    'strict-transport-security',
    'x-frame-options',
    'x-content-type-options',
    'referrer-policy'
  ];
  
  const presentHeaders = requiredHeaders.filter(header => headers[header]);
  audit.compliance.score = Math.round((presentHeaders.length / requiredHeaders.length) * 100);
  audit.compliance.basic = audit.compliance.score >= 80;
  audit.compliance.advanced = audit.compliance.score >= 95;
  
  ResponseHandler.success(res, 'Security headers audit completed', audit);
};

// Security Configuration Endpoint
const getSecurityConfig = (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const config = isProduction ? SECURITY_CONFIG.production : SECURITY_CONFIG.development;
  
  const safeConfig = {
    environment: isProduction ? 'production' : 'development',
    csp: {
      enabled: true,
      reportOnly: config.csp.reportOnly,
      directiveCount: Object.keys(config.csp.directives).length
    },
    hsts: {
      enabled: true,
      maxAge: config.hsts.maxAge,
      includeSubDomains: config.hsts.includeSubDomains,
      preload: config.hsts.preload
    },
    additionalHeaders: {
      frameOptions: ADDITIONAL_HEADERS.frameOptions.action,
      noSniff: ADDITIONAL_HEADERS.noSniff,
      xssFilter: ADDITIONAL_HEADERS.xssFilter,
      referrerPolicy: ADDITIONAL_HEADERS.referrerPolicy.policy,
      permissionsPolicy: Object.keys(ADDITIONAL_HEADERS.permissionsPolicy.features).length
    }
  };
  
  ResponseHandler.success(res, 'Security configuration retrieved', safeConfig);
};

// CSP Report-Only Mode Toggle
const toggleCSPReportOnly = (req, res) => {
  const { reportOnly } = req.body;
  
  if (typeof reportOnly !== 'boolean') {
    return ResponseHandler.badRequest(res, 'reportOnly must be a boolean value');
  }
  
  const isProduction = process.env.NODE_ENV === 'production';
  const config = isProduction ? SECURITY_CONFIG.production : SECURITY_CONFIG.development;
  
  config.csp.reportOnly = reportOnly;
  
  ResponseHandler.success(res, `CSP report-only mode ${reportOnly ? 'enabled' : 'disabled'}`);
};

// Security Headers Testing Endpoint
const testSecurityHeaders = (req, res) => {
  const testResults = {
    timestamp: new Date().toISOString(),
    tests: {
      xss: {
        description: 'XSS Protection Test',
        passed: res.getHeader('x-xss-protection') === '1; mode=block',
        header: res.getHeader('x-xss-protection')
      },
      clickjacking: {
        description: 'Clickjacking Protection Test',
        passed: res.getHeader('x-frame-options') === 'DENY',
        header: res.getHeader('x-frame-options')
      },
      contentType: {
        description: 'Content Type Sniffing Protection Test',
        passed: res.getHeader('x-content-type-options') === 'nosniff',
        header: res.getHeader('x-content-type-options')
      },
      hsts: {
        description: 'HTTP Strict Transport Security Test',
        passed: !!res.getHeader('strict-transport-security'),
        header: res.getHeader('strict-transport-security')
      },
      csp: {
        description: 'Content Security Policy Test',
        passed: !!res.getHeader('content-security-policy'),
        header: res.getHeader('content-security-policy') ? 'Present' : 'Missing'
      }
    }
  };
  
  const passedTests = Object.values(testResults.tests).filter(test => test.passed).length;
  const totalTests = Object.keys(testResults.tests).length;
  
  testResults.summary = {
    passed: passedTests,
    total: totalTests,
    score: Math.round((passedTests / totalTests) * 100),
    status: passedTests === totalTests ? 'pass' : 'fail'
  };
  
  ResponseHandler.success(res, 'Security headers test completed', testResults);
};

// Apply enhanced security headers
const applyEnhancedSecurity = (app) => {
  console.log('[Security] Applying enhanced security headers...');
  
  // Apply security middleware
  app.use(createSecurityMiddleware());
  
  // CSP violation reporting endpoint
  app.post('/api/security/csp-report', express.json({ type: 'application/csp-report' }), cspReportHandler);
  
  // Security configuration endpoints
  app.get('/api/security/config', getSecurityConfig);
  app.get('/api/security/audit', auditSecurityHeaders);
  app.get('/api/security/test', testSecurityHeaders);
  app.post('/api/security/csp/toggle-report-only', toggleCSPReportOnly);
  
  console.log('[Security] Enhanced security headers applied successfully');
};

module.exports = {
  SECURITY_CONFIG,
  ADDITIONAL_HEADERS,
  applyEnhancedSecurity,
  createSecurityMiddleware,
  cspReportHandler,
  auditSecurityHeaders,
  getSecurityConfig,
  testSecurityHeaders,
  toggleCSPReportOnly,
  generateNonce
};
