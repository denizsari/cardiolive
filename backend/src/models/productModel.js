const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ürün adı zorunludur'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Ürün açıklaması zorunludur']
  },
  price: {
    type: Number,
    required: [true, 'Ürün fiyatı zorunludur'],
    min: [0, 'Fiyat 0\'dan küçük olamaz']
  },
  images: [{
    type: String,
    required: [true, 'En az bir ürün görseli zorunludur']
  }],
  category: {
    type: String,
    required: [true, 'Ürün kategorisi zorunludur'],
    enum: {
      values: ['Sızma Zeytinyağı', 'Naturel Zeytinyağı', 'Organik Zeytinyağı', 'Özel Seri'],
      message: 'Lütfen geçerli bir kategori seçin'
    }
  },
  stock: {
    type: Number,
    required: [true, 'Stok miktarı zorunludur'],
    min: [0, 'Stok miktarı 0\'dan küçük olamaz'],
    default: 0
  },
  size: {
    type: String,
    required: [true, 'Ürün boyutu zorunludur'],
    enum: {
      values: ['250ml', '500ml', '1L', '2L', '5L'],
      message: 'Lütfen geçerli bir boyut seçin'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ürün adı ve boyutuna göre benzersiz index
productSchema.index({ name: 1, size: 1 }, { unique: true });

module.exports = mongoose.model('Product', productSchema); 