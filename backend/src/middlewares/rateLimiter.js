const rateLimit = require('express-rate-limit');
const ResponseHandler = require('../utils/responseHandler');

/**
 * Rate limiting configurations for different endpoints
 */

// General API rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Çok fazla istek gönderdiniz. Lütfen 15 dakika sonra tekrar deneyin.',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    return ResponseHandler.rateLimit(res, 'Çok fazla istek gönderdiniz. Lütfen biraz bekleyin.');
  },
});

// Authentication rate limiter (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    success: false,
    message: 'Çok fazla giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin.',
    timestamp: new Date().toISOString(),
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    return ResponseHandler.rateLimit(res, 'Çok fazla giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin.');
  },
});

// Password reset rate limiter
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset attempts per hour
  message: {
    success: false,
    message: 'Çok fazla şifre sıfırlama isteği. Lütfen 1 saat sonra tekrar deneyin.',
    timestamp: new Date().toISOString(),
  },
  handler: (req, res) => {
    return ResponseHandler.rateLimit(res, 'Çok fazla şifre sıfırlama isteği. Lütfen 1 saat sonra tekrar deneyin.');
  },
});

// Contact form rate limiter
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 contact form submissions per hour
  message: {
    success: false,
    message: 'Çok fazla iletişim formu gönderdiniz. Lütfen 1 saat sonra tekrar deneyin.',
    timestamp: new Date().toISOString(),
  },
  handler: (req, res) => {
    return ResponseHandler.rateLimit(res, 'Çok fazla iletişim formu gönderdiniz. Lütfen 1 saat sonra tekrar deneyin.');
  },
});

// Review submission rate limiter
const reviewLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 10, // Limit each IP to 10 reviews per day
  message: {
    success: false,
    message: 'Günlük yorum limitinizi aştınız. Lütfen yarın tekrar deneyin.',
    timestamp: new Date().toISOString(),
  },
  handler: (req, res) => {
    return ResponseHandler.rateLimit(res, 'Günlük yorum limitinizi aştınız. Lütfen yarın tekrar deneyin.');
  },
});

// Order creation rate limiter
const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 orders per hour
  message: {
    success: false,
    message: 'Çok fazla sipariş vermeye çalışıyorsunuz. Lütfen 1 saat sonra tekrar deneyin.',
    timestamp: new Date().toISOString(),
  },
  handler: (req, res) => {
    return ResponseHandler.rateLimit(res, 'Çok fazla sipariş vermeye çalışıyorsunuz. Lütfen 1 saat sonra tekrar deneyin.');
  },
});

// Admin operations rate limiter
const adminLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // Limit each IP to 50 admin operations per 5 minutes
  message: {
    success: false,
    message: 'Çok fazla yönetici işlemi. Lütfen 5 dakika sonra tekrar deneyin.',
    timestamp: new Date().toISOString(),
  },
  handler: (req, res) => {
    return ResponseHandler.rateLimit(res, 'Çok fazla yönetici işlemi. Lütfen 5 dakika sonra tekrar deneyin.');
  },
});

// User operations rate limiter (for general user actions)
const userLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 user operations per windowMs
  message: {
    success: false,
    message: 'Çok fazla işlem gerçekleştirdiniz. Lütfen 15 dakika sonra tekrar deneyin.',
    timestamp: new Date().toISOString(),
  },
  handler: (req, res) => {
    return ResponseHandler.rateLimit(res, 'Çok fazla işlem gerçekleştirdiniz. Lütfen biraz bekleyin.');
  },
});

// Search rate limiter
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute
  message: {
    success: false,
    message: 'Çok fazla arama isteği. Lütfen biraz bekleyin.',
    timestamp: new Date().toISOString(),
  },
  handler: (req, res) => {
    return ResponseHandler.rateLimit(res, 'Çok fazla arama isteği. Lütfen biraz bekleyin.');
  },
});

// Upload rate limiter
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 uploads per 15 minutes
  message: {
    success: false,
    message: 'Çok fazla dosya yükleme isteği. Lütfen 15 dakika sonra tekrar deneyin.',
    timestamp: new Date().toISOString(),
  },
  handler: (req, res) => {
    return ResponseHandler.rateLimit(res, 'Çok fazla dosya yükleme isteği. Lütfen biraz bekleyin.');
  },
});

// Wishlist operations rate limiter
const wishlistLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 50 wishlist operations per 5 minutes
  message: {
    success: false,
    message: 'Çok fazla favori işlemi. Lütfen 5 dakika sonra tekrar deneyin.',
    timestamp: new Date().toISOString(),
  },
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise fall back to IP
    return req.user?.id || req.ip;
  },
  handler: (req, res) => {
    return ResponseHandler.rateLimit(res, 'Çok fazla favori işlemi. Lütfen biraz bekleyin.');
  },
});

// API rate limiter function
const applyRateLimit = (type = 'general') => {
  const limiters = {
    general: generalLimiter,
    api: generalLimiter,
    user: userLimiter,
    admin: adminLimiter,
    auth: authLimiter,
    passwordReset: passwordResetLimiter,
    contact: contactLimiter,
    reviews: reviewLimiter,
    orders: orderLimiter,
    search: searchLimiter,
    upload: uploadLimiter,
    wishlist: wishlistLimiter,
    tracking: userLimiter
  };

  return limiters[type] || generalLimiter;
};

module.exports = {
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  contactLimiter,
  reviewLimiter,
  orderLimiter,
  adminLimiter,
  userLimiter,
  searchLimiter,
  uploadLimiter,
  wishlistLimiter,
  applyRateLimit
};
