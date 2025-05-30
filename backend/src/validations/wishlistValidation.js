const Joi = require('joi');
const { Types } = require('mongoose');

// Custom validation for MongoDB ObjectId
const objectId = Joi.string().custom((value, helpers) => {
  if (!Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'ObjectId validation');

// Add to wishlist validation
const addToWishlistSchema = Joi.object({
  productId: objectId.required().messages({
    'any.required': 'Ürün ID gerekli',
    'any.invalid': 'Geçersiz ürün ID'
  }),
  notes: Joi.string().trim().max(500).allow('').messages({
    'string.base': 'Not metin olmalı',
    'string.max': 'Not en fazla 500 karakter olmalı'
  })
});

// Bulk wishlist operations validation
const bulkWishlistSchema = Joi.object({
  productIds: Joi.array().items(objectId).min(1).max(50).required().messages({
    'array.base': 'Ürün ID\'leri dizi olmalı',
    'array.min': 'En az 1 ürün ID gerekli',
    'array.max': 'En fazla 50 ürün işleme alınabilir',
    'any.required': 'Ürün ID\'leri gerekli',
    'any.invalid': 'Geçersiz ürün ID\'si'
  })
});

// Wishlist notes validation
const wishlistNotesSchema = Joi.object({
  notes: Joi.string().trim().max(500).allow('').messages({
    'string.base': 'Not metin olmalı',
    'string.max': 'Not en fazla 500 karakter olmalı'
  })
});

// Query validation for wishlist
const wishlistQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Sayfa numarası sayı olmalı',
    'number.integer': 'Sayfa numarası tam sayı olmalı',
    'number.min': 'Sayfa numarası en az 1 olmalı'
  }),
  limit: Joi.number().integer().min(1).max(50).default(10).messages({
    'number.base': 'Limit sayı olmalı',
    'number.integer': 'Limit tam sayı olmalı',
    'number.min': 'Limit en az 1 olmalı',
    'number.max': 'Limit en fazla 50 olmalı'
  }),
  category: Joi.string().trim().messages({
    'string.base': 'Kategori metin olmalı'
  }),
  brand: Joi.string().trim().messages({
    'string.base': 'Marka metin olmalı'
  }),
  minPrice: Joi.number().min(0).messages({
    'number.base': 'Minimum fiyat sayı olmalı',
    'number.min': 'Minimum fiyat 0\'dan küçük olamaz'
  }),
  maxPrice: Joi.number().min(Joi.ref('minPrice')).messages({
    'number.base': 'Maksimum fiyat sayı olmalı',
    'number.min': 'Maksimum fiyat minimum fiyattan küçük olamaz'
  }),
  inStock: Joi.boolean().messages({
    'boolean.base': 'Stok durumu boolean olmalı'
  }),
  sort: Joi.string().valid('createdAt', 'price', 'name', 'rating').default('createdAt').messages({
    'any.only': 'Sıralama türü geçersiz (createdAt, price, name, rating)'
  }),
  order: Joi.string().valid('asc', 'desc').default('desc').messages({
    'any.only': 'Sıra yönü geçersiz (asc, desc)'
  }),
  startDate: Joi.date().iso().messages({
    'date.format': 'Başlangıç tarihi ISO formatında olmalı'
  }),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).messages({
    'date.format': 'Bitiş tarihi ISO formatında olmalı',
    'date.min': 'Bitiş tarihi başlangıç tarihinden sonra olmalı'
  })
});

// Create wishlist validation
const createWishlistSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.base': 'Liste adı metin olmalı',
    'string.empty': 'Liste adı boş olamaz',
    'string.min': 'Liste adı en az 2 karakter olmalı',
    'string.max': 'Liste adı en fazla 100 karakter olmalı',
    'any.required': 'Liste adı gerekli'
  }),
  description: Joi.string().trim().max(500).messages({
    'string.base': 'Açıklama metin olmalı',
    'string.max': 'Açıklama en fazla 500 karakter olmalı'
  }),
  isPublic: Joi.boolean().default(false).messages({
    'boolean.base': 'Görünürlük durumu boolean olmalı'
  }),
  products: Joi.array().items(objectId).max(100).messages({
    'array.base': 'Ürünler dizi olmalı',
    'array.max': 'En fazla 100 ürün ekleyebilirsiniz',
    'any.invalid': 'Geçersiz ürün ID\'si'
  })
});

// Update wishlist validation
const updateWishlistSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).messages({
    'string.base': 'Liste adı metin olmalı',
    'string.empty': 'Liste adı boş olamaz',
    'string.min': 'Liste adı en az 2 karakter olmalı',
    'string.max': 'Liste adı en fazla 100 karakter olmalı'
  }),
  description: Joi.string().trim().max(500).messages({
    'string.base': 'Açıklama metin olmalı',
    'string.max': 'Açıklama en fazla 500 karakter olmalı'
  }),
  isPublic: Joi.boolean().messages({
    'boolean.base': 'Görünürlük durumu boolean olmalı'
  })
}).min(1).messages({
  'object.min': 'En az bir alan güncellenmeli'
});

// Share wishlist validation
const shareWishlistSchema = Joi.object({
  emails: Joi.array().items(
    Joi.string().email().messages({
      'string.email': 'Geçersiz email adresi'
    })
  ).min(1).max(10).required().messages({
    'array.base': 'Email adresleri dizi olmalı',
    'array.min': 'En az 1 email adresi gerekli',
    'array.max': 'En fazla 10 email adresine gönderebilirsiniz',
    'any.required': 'Email adresleri gerekli'
  }),
  message: Joi.string().trim().max(500).messages({
    'string.base': 'Mesaj metin olmalı',
    'string.max': 'Mesaj en fazla 500 karakter olmalı'
  })
});

// Validation middleware functions
const validateAddToWishlist = (req, res, next) => {
  const { error, value } = addToWishlistSchema.validate(req.body, { 
    abortEarly: false,
    stripUnknown: true 
  });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Validasyon hatası',
      errors
    });
  }
  
  req.body = value;
  next();
};

const validateBulkWishlist = (req, res, next) => {
  const { error, value } = bulkWishlistSchema.validate(req.body, { 
    abortEarly: false,
    stripUnknown: true 
  });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Validasyon hatası',
      errors
    });
  }
  
  req.body = value;
  next();
};

const validateWishlistNotes = (req, res, next) => {
  const { error, value } = wishlistNotesSchema.validate(req.body, { 
    abortEarly: false,
    stripUnknown: true 
  });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Validasyon hatası',
      errors
    });
  }
  
  req.body = value;
  next();
};

// Generic validation middleware
const validateRequest = (req, res, next) => {
  next();
};

const validateWishlistQuery = (req, res, next) => {
  const { error, value } = wishlistQuerySchema.validate(req.query, { 
    abortEarly: false,
    stripUnknown: true 
  });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Validasyon hatası',
      errors
    });
  }
  
  req.query = value;
  next();
};

const validateCreateWishlist = (req, res, next) => {
  const { error, value } = createWishlistSchema.validate(req.body, { 
    abortEarly: false,
    stripUnknown: true 
  });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Validasyon hatası',
      errors
    });
  }
  
  req.body = value;
  next();
};

const validateUpdateWishlist = (req, res, next) => {
  const { error, value } = updateWishlistSchema.validate(req.body, { 
    abortEarly: false,
    stripUnknown: true 
  });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Validasyon hatası',
      errors
    });
  }
  
  req.body = value;
  next();
};

const validateShareWishlist = (req, res, next) => {
  const { error, value } = shareWishlistSchema.validate(req.body, { 
    abortEarly: false,
    stripUnknown: true 
  });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Validasyon hatası',
      errors
    });
  }
  
  req.body = value;
  next();
};

module.exports = {
  validateAddToWishlist,
  validateBulkWishlist,
  validateWishlistNotes,
  validateRequest,
  validateWishlistQuery,
  validateCreateWishlist,
  validateUpdateWishlist,
  validateShareWishlist
};
