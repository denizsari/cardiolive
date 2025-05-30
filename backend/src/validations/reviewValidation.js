const Joi = require('joi');
const { Types } = require('mongoose');

// Custom validation for MongoDB ObjectId
const objectId = Joi.string().custom((value, helpers) => {
  if (!Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'ObjectId validation');

// Create review validation
const createReviewSchema = Joi.object({
  product: objectId.required().messages({
    'any.required': 'Ürün ID gerekli',
    'any.invalid': 'Geçersiz ürün ID'
  }),
  rating: Joi.number().integer().min(1).max(5).required().messages({
    'number.base': 'Puan sayı olmalı',
    'number.integer': 'Puan tam sayı olmalı',
    'number.min': 'Puan en az 1 olmalı',
    'number.max': 'Puan en fazla 5 olmalı',
    'any.required': 'Puan gerekli'
  }),
  title: Joi.string().trim().min(5).max(100).required().messages({
    'string.base': 'Başlık metin olmalı',
    'string.empty': 'Başlık boş olamaz',
    'string.min': 'Başlık en az 5 karakter olmalı',
    'string.max': 'Başlık en fazla 100 karakter olmalı',
    'any.required': 'Başlık gerekli'
  }),
  comment: Joi.string().trim().min(10).max(1000).required().messages({
    'string.base': 'Yorum metin olmalı',
    'string.empty': 'Yorum boş olamaz',
    'string.min': 'Yorum en az 10 karakter olmalı',
    'string.max': 'Yorum en fazla 1000 karakter olmalı',
    'any.required': 'Yorum gerekli'
  }),
  recommend: Joi.boolean().default(true),
  images: Joi.array().items(
    Joi.string().uri().messages({
      'string.uri': 'Geçersiz resim URL\'si'
    })
  ).max(5).messages({
    'array.max': 'En fazla 5 resim yükleyebilirsiniz'
  })
});

// Update review validation
const updateReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).messages({
    'number.base': 'Puan sayı olmalı',
    'number.integer': 'Puan tam sayı olmalı',
    'number.min': 'Puan en az 1 olmalı',
    'number.max': 'Puan en fazla 5 olmalı'
  }),
  title: Joi.string().trim().min(5).max(100).messages({
    'string.base': 'Başlık metin olmalı',
    'string.empty': 'Başlık boş olamaz',
    'string.min': 'Başlık en az 5 karakter olmalı',
    'string.max': 'Başlık en fazla 100 karakter olmalı'
  }),
  comment: Joi.string().trim().min(10).max(1000).messages({
    'string.base': 'Yorum metin olmalı',
    'string.empty': 'Yorum boş olamaz',
    'string.min': 'Yorum en az 10 karakter olmalı',
    'string.max': 'Yorum en fazla 1000 karakter olmalı'
  }),
  recommend: Joi.boolean(),
  images: Joi.array().items(
    Joi.string().uri().messages({
      'string.uri': 'Geçersiz resim URL\'si'
    })
  ).max(5).messages({
    'array.max': 'En fazla 5 resim yükleyebilirsiniz'
  })
}).min(1).messages({
  'object.min': 'En az bir alan güncellenmeli'
});

// Query validation for reviews
const reviewQuerySchema = Joi.object({
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
  rating: Joi.number().integer().min(1).max(5).messages({
    'number.base': 'Puan filtresi sayı olmalı',
    'number.integer': 'Puan filtresi tam sayı olmalı',
    'number.min': 'Puan filtresi en az 1 olmalı',
    'number.max': 'Puan filtresi en fazla 5 olmalı'
  }),
  recommend: Joi.boolean(),
  verified: Joi.boolean(),
  sort: Joi.string().valid('createdAt', 'rating', 'helpful').default('createdAt').messages({
    'any.only': 'Sıralama türü geçersiz (createdAt, rating, helpful)'
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

// Admin review query validation
const adminReviewQuerySchema = reviewQuerySchema.keys({
  status: Joi.string().valid('pending', 'approved', 'rejected').messages({
    'any.only': 'Durum geçersiz (pending, approved, rejected)'
  }),
  user: objectId.messages({
    'any.invalid': 'Geçersiz kullanıcı ID'
  }),
  product: objectId.messages({
    'any.invalid': 'Geçersiz ürün ID'
  })
});

// Review action validation (for admin actions)
const reviewActionSchema = Joi.object({
  action: Joi.string().valid('approve', 'reject', 'feature', 'unfeature').required().messages({
    'any.only': 'Eylem geçersiz (approve, reject, feature, unfeature)',
    'any.required': 'Eylem gerekli'
  }),
  reason: Joi.string().trim().max(500).when('action', {
    is: 'reject',
    then: Joi.required(),
    otherwise: Joi.optional()
  }).messages({
    'string.base': 'Sebep metin olmalı',
    'string.max': 'Sebep en fazla 500 karakter olmalı',
    'any.required': 'Reddetme sebebi gerekli'
  })
});

// Helpful vote validation
const helpfulVoteSchema = Joi.object({
  helpful: Joi.boolean().required().messages({
    'boolean.base': 'Faydalı oyu boolean olmalı',
    'any.required': 'Faydalı oyu gerekli'
  })
});

// Validation middleware functions
const validateCreateReview = (req, res, next) => {
  const { error, value } = createReviewSchema.validate(req.body, { 
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

const validateUpdateReview = (req, res, next) => {
  const { error, value } = updateReviewSchema.validate(req.body, { 
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

const validateReviewQuery = (req, res, next) => {
  const schema = req.user?.role === 'admin' ? adminReviewQuerySchema : reviewQuerySchema;
  const { error, value } = schema.validate(req.query, { 
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

const validateReviewAction = (req, res, next) => {
  const { error, value } = reviewActionSchema.validate(req.body, { 
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

const validateHelpfulVote = (req, res, next) => {
  const { error, value } = helpfulVoteSchema.validate(req.body, { 
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
  validateCreateReview,
  validateUpdateReview,
  validateReviewQuery,
  validateReviewAction,
  validateHelpfulVote
};
