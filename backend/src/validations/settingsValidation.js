// filepath: d:\expoProjects\cardiolive\backend\src\validations\settingsValidation.js
const Joi = require('joi');
const ResponseHandler = require('../utils/responseHandler');

// Validation schema for updating settings
const updateSettingsSchema = Joi.object({
  // Site Information
  siteName: Joi.string().min(2).max(100).trim(),
  siteEmail: Joi.string().email().trim(),
  supportEmail: Joi.string().email().trim(),
  contactPhone: Joi.string().pattern(/^[\d\s\-\+\(\)]+$/).allow(''),
  address: Joi.string().max(500).allow(''),
  
  // Site Control
  maintenanceMode: Joi.boolean(),
  allowRegistration: Joi.boolean(),
  
  // Notification Settings
  emailNotifications: Joi.boolean(),
  smsNotifications: Joi.boolean(),
  orderConfirmationEmail: Joi.boolean(),
  orderStatusUpdateEmail: Joi.boolean(),
  
  // Inventory Settings
  lowStockThreshold: Joi.number().integer().min(0).max(1000),
  criticalStockThreshold: Joi.number().integer().min(0).max(1000),
  
  // Commerce Settings
  currency: Joi.string().valid('TRY', 'USD', 'EUR', 'GBP').default('TRY'),
  taxRate: Joi.number().min(0).max(100),
  shippingFee: Joi.number().min(0).max(1000),
  freeShippingThreshold: Joi.number().min(0).max(10000),
  maxOrderQuantity: Joi.number().integer().min(1).max(1000),
  
  // Media Settings
  defaultProductImage: Joi.string().uri().allow(''),
  
  // Social Media Links
  socialMedia: Joi.object({
    facebook: Joi.string().uri().allow(''),
    twitter: Joi.string().uri().allow(''),
    instagram: Joi.string().uri().allow(''),
    linkedin: Joi.string().uri().allow(''),
    youtube: Joi.string().uri().allow(''),
    whatsapp: Joi.string().allow('')
  }),
  
  // SEO Settings
  seoSettings: Joi.object({
    metaTitle: Joi.string().max(60).allow(''),
    metaDescription: Joi.string().max(160).allow(''),
    metaKeywords: Joi.string().max(255).allow(''),
    siteVerification: Joi.object({
      google: Joi.string().allow(''),
      bing: Joi.string().allow(''),
      yandex: Joi.string().allow('')
    })
  }),
  
  // Analytics Settings
  analyticsSettings: Joi.object({
    googleAnalyticsId: Joi.string().pattern(/^G-[A-Z0-9]+$/).allow(''),
    facebookPixelId: Joi.string().pattern(/^\d+$/).allow(''),
    gtmId: Joi.string().pattern(/^GTM-[A-Z0-9]+$/).allow(''),
    hotjarId: Joi.string().pattern(/^\d+$/).allow(''),
    enabled: Joi.boolean()
  }),
  
  // Payment Settings
  paymentSettings: Joi.object({
    creditCard: Joi.boolean(),
    bankTransfer: Joi.boolean(),
    cashOnDelivery: Joi.boolean(),
    paypal: Joi.boolean(),
    stripe: Joi.boolean(),
    minOrderAmount: Joi.number().min(0).max(10000)
  }),
  
  // Business Settings
  businessInfo: Joi.object({
    companyName: Joi.string().max(200).allow(''),
    taxNumber: Joi.string().max(50).allow(''),
    registrationNumber: Joi.string().max(50).allow(''),
    businessAddress: Joi.string().max(500).allow(''),
    businessPhone: Joi.string().pattern(/^[\d\s\-\+\(\)]+$/).allow(''),
    businessEmail: Joi.string().email().allow('')
  }),
  
  // Security Settings
  securitySettings: Joi.object({
    enableTwoFactor: Joi.boolean(),
    sessionTimeout: Joi.number().integer().min(300).max(86400), // 5 min to 24 hours
    maxLoginAttempts: Joi.number().integer().min(3).max(10),
    lockoutDuration: Joi.number().integer().min(60).max(3600), // 1 min to 1 hour
    passwordMinLength: Joi.number().integer().min(6).max(50),
    requirePasswordSpecialChars: Joi.boolean()
  }),
  
  // Order Settings
  orderSettings: Joi.object({
    autoConfirmOrders: Joi.boolean(),
    autoProcessPayments: Joi.boolean(),
    orderNumberPrefix: Joi.string().max(10).pattern(/^[A-Z0-9]+$/),
    orderNumberLength: Joi.number().integer().min(6).max(20)
  }),
  
  // Email Templates
  emailTemplates: Joi.object({
    orderConfirmation: Joi.string().allow(''),
    orderStatusUpdate: Joi.string().allow(''),
    passwordReset: Joi.string().allow(''),
    welcome: Joi.string().allow('')
  })
});

// Validation schema for settings query parameters
const settingsQuerySchema = Joi.object({
  category: Joi.string().valid(
    'site', 'notifications', 'inventory', 'commerce', 
    'social', 'seo', 'analytics', 'payments', 'business', 
    'security', 'orders', 'emails'
  )
});

// Validation middleware for updating settings
const validateUpdateSettings = (req, res, next) => {
  const { error, value } = updateSettingsSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    allowUnknown: false
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));

    return ResponseHandler.badRequest(res, 'Geçersiz ayar verileri', { errors });
  }

  req.body = value;
  next();
};

// Validation middleware for settings query
const validateSettingsQuery = (req, res, next) => {
  const { error, value } = settingsQuerySchema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return ResponseHandler.badRequest(res, 'Geçersiz sorgu parametreleri', { errors });
  }

  req.query = value;
  next();
};

// General validation request middleware
const validateRequest = (req, res, next) => {
  next();
};

// Settings category filter helper
const getSettingsByCategory = (settings, category) => {
  if (!category) return settings;

  const categoryMapping = {
    site: ['siteName', 'siteEmail', 'supportEmail', 'contactPhone', 'address'],
    notifications: ['emailNotifications', 'smsNotifications', 'orderConfirmationEmail', 'orderStatusUpdateEmail'],
    inventory: ['lowStockThreshold', 'criticalStockThreshold'],
    commerce: ['currency', 'taxRate', 'shippingFee', 'freeShippingThreshold', 'maxOrderQuantity'],
    social: ['socialMedia'],
    seo: ['seoSettings'],
    analytics: ['analyticsSettings'],
    payments: ['paymentSettings'],
    business: ['businessInfo'],
    security: ['securitySettings'],
    orders: ['orderSettings'],
    emails: ['emailTemplates']
  };

  const fieldsToInclude = categoryMapping[category] || [];
  const filteredSettings = {};

  fieldsToInclude.forEach(field => {
    if (settings[field] !== undefined) {
      filteredSettings[field] = settings[field];
    }
  });

  return filteredSettings;
};

// Public settings filter (remove sensitive data)
const getPublicSettings = (settings) => {
  const publicFields = [
    'siteName', 'supportEmail', 'contactPhone', 'address',
    'currency', 'taxRate', 'shippingFee', 'freeShippingThreshold',
    'socialMedia', 'seoSettings', 'businessInfo'
  ];

  const publicSettings = {};
  publicFields.forEach(field => {
    if (settings[field] !== undefined) {
      publicSettings[field] = settings[field];
    }
  });

  // Remove sensitive business info
  if (publicSettings.businessInfo) {
    const { taxNumber, registrationNumber, businessEmail, ...publicBusinessInfo } = publicSettings.businessInfo;
    publicSettings.businessInfo = publicBusinessInfo;
  }

  return publicSettings;
};

module.exports = {
  updateSettingsSchema,
  settingsQuerySchema,
  validateUpdateSettings,
  validateSettingsQuery,
  validateRequest,
  getSettingsByCategory,
  getPublicSettings
};
