const ProductService = require('../services/ProductService');
const ResponseHandler = require('../utils/responseHandler');
const { logger } = require('../utils/logger');
const productValidation = require('../validations/productValidation');

/**
 * @desc Create a new product
 * @route POST /api/products
 * @access Private/Admin
 */
exports.createProduct = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = productValidation.createProduct.validate(req.body);
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return ResponseHandler.validationError(res, errors);
    }

    const product = await ProductService.createProduct(value);

    logger.logBusinessEvent('product_created', { 
      adminId: req.user?.userId,
      productId: product._id, 
      productName: product.name 
    });

    ResponseHandler.created(res, 'Ürün başarıyla oluşturuldu', { product });
  } catch (error) {
    logger.error('Product creation error:', { adminId: req.user?.userId, error: error.message, stack: error.stack });
      if (error.message === 'Bu isim ve boyutta bir ürün zaten mevcut') {
      return ResponseHandler.badRequest(res, error.message);
    }
    ResponseHandler.error(res, 'Ürün oluşturulamadı', error);
  }
};

/**
 * @desc Get all products with filtering and pagination
 * @route GET /api/products
 * @access Public
 */
exports.getAllProducts = async (req, res) => {
  try {
    // Validate query parameters
    const { error, value } = productValidation.getProducts.validate(req.query);
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return ResponseHandler.validationError(res, errors);
    }

    const { category, size, minPrice, maxPrice, sort, search, featured, limit, page } = value;
    
    const filters = { category, size, minPrice, maxPrice, search, featured };
    const options = { page, limit, sort };

    const result = await ProductService.getProducts(filters, options);

    logger.logBusinessEvent('products_viewed', { 
      filters,
      options,
      resultCount: result?.documents?.length || 0 
    });
    
    ResponseHandler.success(res, 'Ürünler başarıyla getirildi', {
      products: result?.documents || [],
      pagination: result?.pagination || {}
    });
  } catch (error) {
    logger.error('Get products error:', { 
      filters: req.query, 
      error: error.message,
      stack: error.stack,
      fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
    });
    ResponseHandler.error(res, 'Ürünler getirilemedi', error);
  }
};

/**
 * @desc Get single product by ID
 * @route GET /api/products/:id
 * @access Public
 */
exports.getProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await ProductService.getProductById(productId);
    
    if (!product) {
      return ResponseHandler.notFound(res, 'Ürün bulunamadı');
    }

    logger.logBusinessEvent('product_viewed', { productId, productName: product.name });

    ResponseHandler.success(res, 'Ürün başarıyla getirildi', { product });
  } catch (error) {
    logger.error('Get product error:', { productId: req.params?.id, error: error.message });
    ResponseHandler.error(res, 'Ürün getirilemedi', error);
  }
};

/**
 * @desc Get product by slug
 * @route GET /api/products/slug/:slug
 * @access Public
 */
exports.getProductBySlug = async (req, res) => {
  try {
    const slug = req.params.slug;
    const product = await ProductService.getProductBySlug(slug);
    
    if (!product) {
      return ResponseHandler.notFound(res, 'Ürün bulunamadı');
    }

    logger.logBusinessEvent('product_viewed_by_slug', { slug, productId: product._id, productName: product.name });

    ResponseHandler.success(res, 'Ürün başarıyla getirildi', { product });
  } catch (error) {
    logger.error('Get product by slug error:', { slug: req.params?.slug, error: error.message });
    ResponseHandler.error(res, 'Ürün getirilemedi', error);
  }
};

/**
 * @desc Update product
 * @route PUT /api/products/:id
 * @access Private/Admin
 */
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const updateData = req.body;

    const product = await ProductService.updateProduct(productId, updateData);

    if (!product) {
      return ResponseHandler.notFound(res, 'Ürün bulunamadı');
    }

    logger.logBusinessEvent('product_updated', { 
      adminId: req.user?.userId,
      productId, 
      productName: product.name,
      updatedFields: Object.keys(updateData)
    });

    ResponseHandler.success(res, 'Ürün başarıyla güncellendi', { product });
  } catch (error) {
    logger.error('Product update error:', { adminId: req.user?.userId, productId: req.params?.id, error: error.message });
    ResponseHandler.error(res, 'Ürün güncellenemedi', error);
  }
};

/**
 * @desc Delete product (soft delete)
 * @route DELETE /api/products/:id
 * @access Private/Admin
 */
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const deleted = await ProductService.deleteProduct(productId);

    if (!deleted) {
      return ResponseHandler.notFound(res, 'Ürün bulunamadı');
    }

    logger.logBusinessEvent('product_deleted', { 
      adminId: req.user?.userId,
      productId 
    });

    ResponseHandler.success(res, 'Ürün başarıyla silindi');
  } catch (error) {
    logger.error('Product delete error:', { adminId: req.user?.userId, productId: req.params?.id, error: error.message });
    ResponseHandler.error(res, 'Ürün silinemedi', error);
  }
};

/**
 * @desc Get all products for admin (including inactive)
 * @route GET /api/admin/products
 * @access Private/Admin
 */
exports.getAllProductsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', ...filters } = req.query;
    
    const options = {
      page: Number(page),
      limit: Number(limit),
      sortBy: sort,
      sortOrder: order,
      includeInactive: true
    };

    const result = await ProductService.getProducts(filters, options);

    logger.logBusinessEvent('admin_products_viewed', { 
      adminId: req.user?.userId,
      filters,
      options,
      resultCount: result.documents.length 
    });

    ResponseHandler.success(res, 'Ürünler başarıyla getirildi', {
      products: result.documents,
      pagination: result.pagination
    });
  } catch (error) {
    logger.error('Admin get products error:', { adminId: req.user?.userId, error: error.message });
    ResponseHandler.error(res, 'Ürünler getirilemedi', error);
  }
};

/**
 * @desc Update product (admin version)
 * @route PUT /api/admin/products/:id
 * @access Private/Admin
 */
exports.updateProductAdmin = async (req, res) => {
  try {
    const productId = req.params.id;
    const updateData = req.body;

    const product = await ProductService.updateProduct(productId, updateData);
    
    if (!product) {
      return ResponseHandler.notFound(res, 'Ürün bulunamadı');
    }

    logger.logBusinessEvent('admin_product_updated', { 
      adminId: req.user?.userId,
      productId, 
      productName: product.name,
      updatedFields: Object.keys(updateData)
    });
    
    ResponseHandler.success(res, 'Ürün başarıyla güncellendi', { product });
  } catch (error) {
    logger.error('Admin product update error:', { adminId: req.user?.userId, productId: req.params?.id, error: error.message });
    ResponseHandler.error(res, 'Ürün güncellenemedi', error);
  }
};

/**
 * @desc Delete product permanently (admin)
 * @route DELETE /api/admin/products/:id/permanent
 * @access Private/Admin
 */
exports.deleteProductAdmin = async (req, res) => {
  try {
    const productId = req.params.id;
    const deleted = await ProductService.permanentlyDeleteProduct(productId);
    
    if (!deleted) {
      return ResponseHandler.notFound(res, 'Ürün bulunamadı');
    }

    logger.logSecurityEvent('product_permanently_deleted', { 
      adminId: req.user?.userId,
      productId 
    });
    
    ResponseHandler.success(res, 'Ürün kalıcı olarak silindi');
  } catch (error) {
    logger.error('Admin product delete error:', { adminId: req.user?.userId, productId: req.params?.id, error: error.message });
    ResponseHandler.error(res, 'Ürün silinemedi', error);
  }
};