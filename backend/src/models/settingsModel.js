const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // Site Information
  siteName: { type: String, default: 'Cardiolive' },
  siteEmail: { type: String, default: 'admin@cardiolive.com' },
  supportEmail: { type: String, default: 'support@cardiolive.com' },
  contactPhone: { type: String, default: '' },
  address: { type: String, default: '' },
  
  // Site Control
  maintenanceMode: { type: Boolean, default: false },
  allowRegistration: { type: Boolean, default: true },
  
  // Notification Settings
  emailNotifications: { type: Boolean, default: true },
  smsNotifications: { type: Boolean, default: false },
  orderConfirmationEmail: { type: Boolean, default: true },
  orderStatusUpdateEmail: { type: Boolean, default: true },
  
  // Inventory Settings
  lowStockThreshold: { type: Number, default: 10 },
  criticalStockThreshold: { type: Number, default: 5 },
  
  // Commerce Settings
  currency: { type: String, default: 'TRY' },
  taxRate: { type: Number, default: 18 },
  shippingFee: { type: Number, default: 15 },
  freeShippingThreshold: { type: Number, default: 500 },
  maxOrderQuantity: { type: Number, default: 100 },
  
  // Media Settings
  defaultProductImage: { type: String, default: '' },
  
  // Social Media Links
  socialMedia: {
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    youtube: { type: String, default: '' },
    whatsapp: { type: String, default: '' }
  },
  
  // SEO Settings
  seoSettings: {
    metaTitle: { type: String, default: 'Cardiolive - Sağlık Ürünleri' },
    metaDescription: { type: String, default: 'Kaliteli sağlık ürünleri ve medikal cihazlar' },
    metaKeywords: { type: String, default: 'sağlık, medikal, cardiolive' },
    siteVerification: {
      google: { type: String, default: '' },
      bing: { type: String, default: '' },
      yandex: { type: String, default: '' }
    }
  },
  
  // Analytics Settings
  analyticsSettings: {
    googleAnalyticsId: { type: String, default: '' },
    facebookPixelId: { type: String, default: '' },
    gtmId: { type: String, default: '' },
    hotjarId: { type: String, default: '' },
    enabled: { type: Boolean, default: false }
  },
  
  // Payment Settings
  paymentSettings: {
    creditCard: { type: Boolean, default: true },
    bankTransfer: { type: Boolean, default: true },
    cashOnDelivery: { type: Boolean, default: true },
    paypal: { type: Boolean, default: false },
    stripe: { type: Boolean, default: false },
    minOrderAmount: { type: Number, default: 50 }
  },
  
  // Business Settings
  businessInfo: {
    companyName: { type: String, default: 'Cardiolive Ltd.' },
    taxNumber: { type: String, default: '' },
    registrationNumber: { type: String, default: '' },
    businessAddress: { type: String, default: '' },
    businessPhone: { type: String, default: '' },
    businessEmail: { type: String, default: '' }
  },
  
  // Security Settings
  securitySettings: {
    enableTwoFactor: { type: Boolean, default: false },
    sessionTimeout: { type: Number, default: 3600 }, // seconds
    maxLoginAttempts: { type: Number, default: 5 },
    lockoutDuration: { type: Number, default: 900 }, // seconds
    passwordMinLength: { type: Number, default: 8 },
    requirePasswordSpecialChars: { type: Boolean, default: true }
  },
  
  // Order Settings
  orderSettings: {
    autoConfirmOrders: { type: Boolean, default: false },
    autoProcessPayments: { type: Boolean, default: false },
    orderNumberPrefix: { type: String, default: 'CL' },
    orderNumberLength: { type: Number, default: 8 }
  },
  
  // Email Templates
  emailTemplates: {
    orderConfirmation: { type: String, default: '' },
    orderStatusUpdate: { type: String, default: '' },
    passwordReset: { type: String, default: '' },
    welcome: { type: String, default: '' }
  },
  
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
