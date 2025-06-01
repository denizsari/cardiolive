const Joi = require('joi');
const { Types } = require('mongoose');

// Custom validation for MongoDB ObjectId
const objectId = Joi.string().custom((value, helpers) => {
  if (!Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'ObjectId validation');

// Create blog validation
const createBlogSchema = Joi.object({
  title: Joi.string().trim().min(5).max(200).required().messages({
    'string.base': 'Başlık metin olmalı',
    'string.empty': 'Başlık boş olamaz',
    'string.min': 'Başlık en az 5 karakter olmalı',
    'string.max': 'Başlık en fazla 200 karakter olmalı',
    'any.required': 'Başlık gerekli'
  }),
  excerpt: Joi.string().trim().min(10).max(500).required().messages({
    'string.base': 'Özet metin olmalı',
    'string.empty': 'Özet boş olamaz',
    'string.min': 'Özet en az 10 karakter olmalı',
    'string.max': 'Özet en fazla 500 karakter olmalı',
    'any.required': 'Özet gerekli'
  }),
  content: Joi.string().trim().min(50).required().messages({
    'string.base': 'İçerik metin olmalı',
    'string.empty': 'İçerik boş olamaz',
    'string.min': 'İçerik en az 50 karakter olmalı',
    'any.required': 'İçerik gerekli'
  }),
  category: Joi.string().trim().min(2).max(50).required().messages({
    'string.base': 'Kategori metin olmalı',
    'string.empty': 'Kategori boş olamaz',
    'string.min': 'Kategori en az 2 karakter olmalı',
    'string.max': 'Kategori en fazla 50 karakter olmalı',
    'any.required': 'Kategori gerekli'
  }),
  tags: Joi.array().items(
    Joi.string().trim().min(2).max(30).messages({
      'string.base': 'Etiket metin olmalı',
      'string.min': 'Etiket en az 2 karakter olmalı',
      'string.max': 'Etiket en fazla 30 karakter olmalı'
    })
  ).max(10).messages({
    'array.base': 'Etiketler dizi olmalı',
    'array.max': 'En fazla 10 etiket ekleyebilirsiniz'
  }),  featured: Joi.boolean().messages({
    'boolean.base': 'Öne çıkarma durumu boolean olmalı'
  }),
  image: Joi.string().uri().messages({
    'string.uri': 'Resim URL formatında olmalı'
  }),
  metaTitle: Joi.string().trim().max(60).messages({
    'string.base': 'Meta başlık metin olmalı',
    'string.max': 'Meta başlık en fazla 60 karakter olmalı'
  }),  metaDescription: Joi.string().trim().max(160).messages({
    'string.base': 'Meta açıklama metin olmalı',
    'string.max': 'Meta açıklama en fazla 160 karakter olmalı'
  })
});

// Update blog validation
const updateBlogSchema = Joi.object({
  title: Joi.string().trim().min(5).max(200).messages({
    'string.base': 'Başlık metin olmalı',
    'string.empty': 'Başlık boş olamaz',
    'string.min': 'Başlık en az 5 karakter olmalı',
    'string.max': 'Başlık en fazla 200 karakter olmalı'
  }),
  excerpt: Joi.string().trim().min(10).max(500).messages({
    'string.base': 'Özet metin olmalı',
    'string.empty': 'Özet boş olamaz',
    'string.min': 'Özet en az 10 karakter olmalı',
    'string.max': 'Özet en fazla 500 karakter olmalı'
  }),
  content: Joi.string().trim().min(50).messages({
    'string.base': 'İçerik metin olmalı',
    'string.empty': 'İçerik boş olamaz',
    'string.min': 'İçerik en az 50 karakter olmalı'
  }),
  category: Joi.string().trim().min(2).max(50).messages({
    'string.base': 'Kategori metin olmalı',
    'string.empty': 'Kategori boş olamaz',
    'string.min': 'Kategori en az 2 karakter olmalı',
    'string.max': 'Kategori en fazla 50 karakter olmalı'
  }),
  tags: Joi.array().items(
    Joi.string().trim().min(2).max(30).messages({
      'string.base': 'Etiket metin olmalı',
      'string.min': 'Etiket en az 2 karakter olmalı',
      'string.max': 'Etiket en fazla 30 karakter olmalı'
    })
  ).max(10).messages({
    'array.base': 'Etiketler dizi olmalı',
    'array.max': 'En fazla 10 etiket ekleyebilirsiniz'
  }),  featured: Joi.boolean().messages({
    'boolean.base': 'Öne çıkarma durumu boolean olmalı'
  }),
  image: Joi.string().uri().messages({
    'string.uri': 'Resim URL formatında olmalı'
  }),
  metaTitle: Joi.string().trim().max(60).messages({
    'string.base': 'Meta başlık metin olmalı',
    'string.max': 'Meta başlık en fazla 60 karakter olmalı'
  }),
  metaDescription: Joi.string().trim().max(160).messages({
    'string.base': 'Meta açıklama metin olmalı',
    'string.max': 'Meta açıklama en fazla 160 karakter olmalı'
  })
}).min(1).messages({
  'object.min': 'En az bir alan güncellenmeli'
});

// Blog query validation
const blogQuerySchema = Joi.object({
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
  }),  category: Joi.string().trim().messages({
    'string.base': 'Kategori metin olmalı'
  }),
  search: Joi.string().trim().min(2).messages({
    'string.base': 'Arama terimi metin olmalı',
    'string.min': 'Arama terimi en az 2 karakter olmalı'
  }),
  sort: Joi.string().valid('createdAt', 'publishedAt', 'title', 'viewCount').default('createdAt').messages({
    'any.only': 'Sıralama türü geçersiz (createdAt, publishedAt, title, viewCount)'
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

// Validation middleware functions
const validateCreateBlog = (req, res, next) => {
  const { error, value } = createBlogSchema.validate(req.body, { 
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

const validateUpdateBlog = (req, res, next) => {
  const { error, value } = updateBlogSchema.validate(req.body, { 
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

const validateBlogQuery = (req, res, next) => {
  const { error, value } = blogQuerySchema.validate(req.query, { 
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

// Generic validation middleware
const validateRequest = (req, res, next) => {
  next();
};

module.exports = {
  validateCreateBlog,
  validateUpdateBlog,
  validateBlogQuery,
  validateRequest
};
