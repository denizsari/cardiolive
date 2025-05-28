const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'Cardiolive' },
  siteEmail: { type: String, default: 'admin@cardiolive.com' },
  supportEmail: { type: String, default: 'support@cardiolive.com' },
  maintenanceMode: { type: Boolean, default: false },
  allowRegistration: { type: Boolean, default: true },
  emailNotifications: { type: Boolean, default: true },
  orderConfirmationEmail: { type: Boolean, default: true },
  lowStockThreshold: { type: Number, default: 10 },
  currency: { type: String, default: 'TRY' },
  taxRate: { type: Number, default: 18 },
  shippingFee: { type: Number, default: 15 },
  freeShippingThreshold: { type: Number, default: 500 },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Settings', settingsSchema);
