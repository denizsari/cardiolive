const Joi = require('joi');

// Order validation schemas
const orderValidation = {
  create: Joi.object({
    items: Joi.array()
      .items(        Joi.object({
          product: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
              'string.pattern.base': 'Geçerli bir ürün ID\'si gereklidir',
              'any.required': 'Ürün ID\'si zorunludur'
            }),
          name: Joi.string()
            .trim()
            .required()
            .messages({
              'any.required': 'Ürün adı zorunludur'
            }),
          quantity: Joi.number()
            .integer()
            .min(1)
            .max(100)
            .required()
            .messages({
              'number.min': 'Miktar en az 1 olmalıdır',
              'number.max': 'Miktar en fazla 100 olabilir',
              'any.required': 'Miktar zorunludur'
            }),
          price: Joi.number()
            .positive()
            .required()
            .messages({
              'number.positive': 'Fiyat pozitif olmalıdır',
              'any.required': 'Fiyat zorunludur'
            }),
          image: Joi.string()
            .required()
            .messages({
              'any.required': 'Ürün görseli zorunludur'
            })
        })
      )
      .min(1)
      .required()
      .messages({
        'array.min': 'En az bir ürün gereklidir',
        'any.required': 'Sipariş öğeleri zorunludur'
      }),
    total: Joi.number()
      .positive()
      .required()
      .messages({
        'number.positive': 'Toplam tutar pozitif olmalıdır',
        'any.required': 'Toplam tutar zorunludur'
      }),
    shippingAddress: Joi.object({
      fullName: Joi.string()
        .min(2)
        .max(100)
        .trim()
        .required()
        .messages({
          'string.min': 'Ad soyad en az 2 karakter olmalıdır',
          'string.max': 'Ad soyad en fazla 100 karakter olabilir',
          'any.required': 'Ad soyad zorunludur'
        }),
      email: Joi.string()
        .email()
        .required()
        .messages({
          'string.email': 'Geçerli bir email adresi giriniz',
          'any.required': 'Email zorunludur'
        }),
      phone: Joi.string()
        .pattern(/^[0-9+\-\s()]{10,20}$/)
        .required()
        .messages({
          'string.pattern.base': 'Geçerli bir telefon numarası giriniz',
          'any.required': 'Telefon numarası zorunludur'
        }),
      address: Joi.string()
        .min(10)
        .max(500)
        .trim()
        .required()
        .messages({
          'string.min': 'Adres en az 10 karakter olmalıdır',
          'string.max': 'Adres en fazla 500 karakter olabilir',
          'any.required': 'Adres zorunludur'
        }),      city: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .required()
        .messages({
          'string.min': 'Şehir en az 2 karakter olmalıdır',
          'string.max': 'Şehir en fazla 50 karakter olabilir',
          'any.required': 'Şehir zorunludur'
        }),
      district: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .required()
        .messages({
          'string.min': 'İlçe en az 2 karakter olmalıdır',
          'string.max': 'İlçe en fazla 50 karakter olabilir',
          'any.required': 'İlçe zorunludur'
        }),
      postalCode: Joi.string()
        .pattern(/^[0-9]{5}$/)
        .optional()
        .messages({
          'string.pattern.base': 'Posta kodu 5 haneli olmalıdır'
        }),
      country: Joi.string()
        .min(2)
        .max(50)
        .default('Türkiye')
        .optional()
    }).required(),
    paymentMethod: Joi.string()
      .valid('credit_card', 'debit_card', 'bank_transfer', 'cash_on_delivery')
      .required()
      .messages({
        'any.only': 'Geçerli bir ödeme yöntemi seçiniz',
        'any.required': 'Ödeme yöntemi zorunludur'
      }),
    notes: Joi.string()
      .max(500)
      .trim()
      .allow('')
      .optional()
      .messages({
        'string.max': 'Notlar en fazla 500 karakter olabilir'
      })
  }),

  updateStatus: Joi.object({
    status: Joi.string()
      .valid('pending', 'processing', 'shipped', 'delivered', 'cancelled')
      .required()
      .messages({
        'any.only': 'Geçerli bir sipariş durumu seçiniz',
        'any.required': 'Sipariş durumu zorunludur'
      }),
    trackingNumber: Joi.string()
      .min(5)
      .max(50)
      .optional()
      .messages({
        'string.min': 'Takip numarası en az 5 karakter olmalıdır',
        'string.max': 'Takip numarası en fazla 50 karakter olabilir'
      }),
    notes: Joi.string()
      .max(500)
      .allow('')
      .optional()
      .messages({
        'string.max': 'Notlar en fazla 500 karakter olabilir'
      })
  }),

  query: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .optional(),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(50)
      .default(10)
      .optional(),
    status: Joi.string()
      .valid('pending', 'processing', 'shipped', 'delivered', 'cancelled')
      .optional(),
    startDate: Joi.date()
      .optional(),
    endDate: Joi.date()
      .min(Joi.ref('startDate'))
      .optional()
      .messages({
        'date.min': 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır'
      }),
    minTotal: Joi.number()
      .positive()
      .optional(),
    maxTotal: Joi.number()
      .positive()
      .min(Joi.ref('minTotal'))
      .optional()
      .messages({
        'number.min': 'Maksimum tutar minimum tutardan büyük olmalıdır'
      }),
    sort: Joi.string()
      .valid('createdAt', 'total', 'status')
      .default('createdAt')
      .optional(),
    order: Joi.string()
      .valid('asc', 'desc')
      .default('desc')
      .optional()
  })
};

// Validation middleware factory
const validateOrder = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
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
};

// Query validation middleware
const validateOrderQuery = (req, res, next) => {
  const { error, value } = orderValidation.query.validate(req.query, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      message: 'Query parametreleri geçersiz',
      errors
    });
  }

  req.query = value;
  next();
};

module.exports = {
  orderValidation,
  validateOrder,
  validateOrderQuery
};
