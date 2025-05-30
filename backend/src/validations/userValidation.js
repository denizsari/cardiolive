const Joi = require('joi');

// User validation schemas
const userValidation = {
  register: Joi.object({
    name: Joi.string()
      .min(2)
      .max(50)
      .trim()
      .required()
      .messages({
        'string.min': 'İsim en az 2 karakter olmalıdır',
        'string.max': 'İsim en fazla 50 karakter olabilir',
        'any.required': 'İsim alanı zorunludur'
      }),
    email: Joi.string()
      .email()
      .lowercase()
      .trim()
      .required()
      .messages({
        'string.email': 'Geçerli bir email adresi giriniz',
        'any.required': 'Email alanı zorunludur'
      }),
    password: Joi.string()
      .min(6)
      .max(128)
      .required()
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$'))
      .messages({
        'string.min': 'Şifre en az 6 karakter olmalıdır',
        'string.max': 'Şifre en fazla 128 karakter olabilir',
        'string.pattern.base': 'Şifre en az bir küçük harf, bir büyük harf ve bir rakam içermelidir',
        'any.required': 'Şifre alanı zorunludur'
      }),
    phone: Joi.string()
      .pattern(new RegExp('^[0-9]{10,15}$'))
      .optional()
      .messages({
        'string.pattern.base': 'Geçerli bir telefon numarası giriniz'
      }),
    role: Joi.string()
      .valid('user', 'admin')
      .default('user')
      .optional()
  }),

  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Geçerli bir email adresi giriniz',
        'any.required': 'Email alanı zorunludur'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Şifre alanı zorunludur'
      })
  }),

  updateProfile: Joi.object({
    name: Joi.string()
      .min(2)
      .max(50)
      .trim()
      .optional()
      .messages({
        'string.min': 'İsim en az 2 karakter olmalıdır',
        'string.max': 'İsim en fazla 50 karakter olabilir'
      }),
    email: Joi.string()
      .email()
      .lowercase()
      .trim()
      .optional()
      .messages({
        'string.email': 'Geçerli bir email adresi giriniz'
      }),
    phoneNumber: Joi.string()
      .pattern(new RegExp('^[0-9]{10,15}$'))
      .allow('', null)
      .optional()
      .messages({
        'string.pattern.base': 'Geçerli bir telefon numarası giriniz'
      }),
    address: Joi.string()
      .max(500)
      .allow('', null)
      .optional()
      .messages({
        'string.max': 'Adres en fazla 500 karakter olabilir'
      })
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        'any.required': 'Mevcut şifre gereklidir'
      }),
    newPassword: Joi.string()
      .min(6)
      .max(128)
      .required()
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$'))
      .messages({
        'string.min': 'Yeni şifre en az 6 karakter olmalıdır',
        'string.max': 'Yeni şifre en fazla 128 karakter olabilir',
        'string.pattern.base': 'Yeni şifre en az bir küçük harf, bir büyük harf ve bir rakam içermelidir',
        'any.required': 'Yeni şifre gereklidir'
      })
  }),

  updateUserRole: Joi.object({
    role: Joi.string()
      .valid('user', 'admin')
      .required()
      .messages({
        'any.only': 'Geçerli bir rol seçiniz (user, admin)',
        'any.required': 'Rol alanı zorunludur'
      })
  }),

  updateUserStatus: Joi.object({
    isActive: Joi.boolean()
      .required()
      .messages({
        'any.required': 'Aktiflik durumu gereklidir'
      })
  }),

  forgotPassword: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Geçerli bir email adresi giriniz',
        'any.required': 'Email alanı zorunludur'
      })
  }),

  resetPassword: Joi.object({
    token: Joi.string()
      .required()
      .messages({
        'any.required': 'Sıfırlama token\'ı gereklidir'
      }),
    password: Joi.string()
      .min(6)
      .max(128)
      .required()
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$'))
      .messages({
        'string.min': 'Şifre en az 6 karakter olmalıdır',
        'string.max': 'Şifre en fazla 128 karakter olabilir',
        'string.pattern.base': 'Şifre en az bir küçük harf, bir büyük harf ve bir rakam içermelidir',
        'any.required': 'Şifre alanı zorunludur'
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
      .max(100)
      .default(10)
      .optional(),
    sort: Joi.string()
      .valid('name', 'email', 'createdAt', 'role')
      .default('createdAt')
      .optional(),
    order: Joi.string()
      .valid('asc', 'desc')
      .default('desc')
      .optional(),
    role: Joi.string()
      .valid('user', 'admin')
      .optional(),
    isActive: Joi.boolean()
      .optional(),
    search: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'Arama terimi en fazla 100 karakter olabilir'
      })
  })
};

// Validation middleware factory
const validateUser = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
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
        message: 'Validasyon hatası',
        errors
      });
    }

    req.body = value;
    next();
  };
};

// Query validation middleware
const validateUserQuery = (req, res, next) => {
  const { error, value } = userValidation.query.validate(req.query, {
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
  userValidation,
  validateUser,
  validateUserQuery
};
