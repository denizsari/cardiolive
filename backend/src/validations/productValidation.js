const Joi = require('joi');

/**
 * Product validation schemas
 */
const productValidation = {
  // Create product validation
  createProduct: Joi.object({
    name: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.empty': 'Ürün adı zorunludur',
        'string.min': 'Ürün adı en az 2 karakter olmalıdır',
        'string.max': 'Ürün adı en fazla 100 karakter olmalıdır'
      }),
    
    description: Joi.string()
      .trim()
      .min(10)
      .max(1000)
      .required()
      .messages({
        'string.empty': 'Ürün açıklaması zorunludur',
        'string.min': 'Ürün açıklaması en az 10 karakter olmalıdır',
        'string.max': 'Ürün açıklaması en fazla 1000 karakter olmalıdır'
      }),
    
    price: Joi.number()
      .positive()
      .precision(2)
      .required()
      .messages({
        'number.base': 'Fiyat sayı olmalıdır',
        'number.positive': 'Fiyat pozitif bir sayı olmalıdır',
        'any.required': 'Ürün fiyatı zorunludur'
      }),
    
    images: Joi.array()
      .items(Joi.string().uri())
      .min(1)
      .required()
      .messages({
        'array.min': 'En az bir ürün görseli zorunludur',
        'string.uri': 'Geçerli bir görsel URL\'si giriniz'
      }),
    
    category: Joi.string()
      .valid('Sızma Zeytinyağı', 'Naturel Zeytinyağı', 'Organik Zeytinyağı', 'Özel Seri')
      .required()
      .messages({
        'any.only': 'Geçerli bir kategori seçiniz',
        'any.required': 'Kategori zorunludur'
      }),
    
    stock: Joi.number()
      .integer()
      .min(0)
      .required()
      .messages({
        'number.base': 'Stok miktarı sayı olmalıdır',
        'number.integer': 'Stok miktarı tam sayı olmalıdır',
        'number.min': 'Stok miktarı 0 veya pozitif olmalıdır',
        'any.required': 'Stok miktarı zorunludur'
      }),
    
    size: Joi.string()
      .valid('250ml', '500ml', '1L', '2L', '5L')
      .required()
      .messages({
        'any.only': 'Geçerli bir boyut seçiniz',
        'any.required': 'Ürün boyutu zorunludur'
      }),
    
    featured: Joi.boolean()
      .default(false),
    
    isActive: Joi.boolean()
      .default(true)
  }),

  // Update product validation (all fields optional)
  updateProduct: Joi.object({
    name: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .messages({
        'string.min': 'Ürün adı en az 2 karakter olmalıdır',
        'string.max': 'Ürün adı en fazla 100 karakter olmalıdır'
      }),
    
    description: Joi.string()
      .trim()
      .min(10)
      .max(1000)
      .messages({
        'string.min': 'Ürün açıklaması en az 10 karakter olmalıdır',
        'string.max': 'Ürün açıklaması en fazla 1000 karakter olmalıdır'
      }),
    
    price: Joi.number()
      .positive()
      .precision(2)
      .messages({
        'number.base': 'Fiyat sayı olmalıdır',
        'number.positive': 'Fiyat pozitif bir sayı olmalıdır'
      }),
    
    images: Joi.array()
      .items(Joi.string().uri())
      .min(1)
      .messages({
        'array.min': 'En az bir ürün görseli zorunludur',
        'string.uri': 'Geçerli bir görsel URL\'si giriniz'
      }),
    
    category: Joi.string()
      .valid('Sızma Zeytinyağı', 'Naturel Zeytinyağı', 'Organik Zeytinyağı', 'Özel Seri')
      .messages({
        'any.only': 'Geçerli bir kategori seçiniz'
      }),
    
    stock: Joi.number()
      .integer()
      .min(0)
      .messages({
        'number.base': 'Stok miktarı sayı olmalıdır',
        'number.integer': 'Stok miktarı tam sayı olmalıdır',
        'number.min': 'Stok miktarı 0 veya pozitif olmalıdır'
      }),
    
    size: Joi.string()
      .valid('250ml', '500ml', '1L', '2L', '5L')
      .messages({
        'any.only': 'Geçerli bir boyut seçiniz'
      }),
    
    featured: Joi.boolean(),
    isActive: Joi.boolean()
  }).min(1), // At least one field must be provided

  // Query parameters validation
  getProducts: Joi.object({
    category: Joi.string()
      .valid('Sızma Zeytinyağı', 'Naturel Zeytinyağı', 'Organik Zeytinyağı', 'Özel Seri'),
    
    size: Joi.string()
      .valid('250ml', '500ml', '1L', '2L', '5L'),
    
    minPrice: Joi.number()
      .positive()
      .precision(2),
    
    maxPrice: Joi.number()
      .positive()
      .precision(2)
      .when('minPrice', {
        is: Joi.exist(),
        then: Joi.number().greater(Joi.ref('minPrice')),
        otherwise: Joi.number()
      }),
    
    search: Joi.string()
      .trim()
      .min(2)
      .max(50),
    
    featured: Joi.string()
      .valid('true', 'false'),
    
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10),
    
    page: Joi.number()
      .integer()
      .min(1)
      .default(1),
    
    sort: Joi.string()
      .valid('name', '-name', 'price', '-price', 'createdAt', '-createdAt')
      .default('-createdAt')
  })
};

module.exports = productValidation;
