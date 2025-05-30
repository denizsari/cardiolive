const Product = require('../models/productModel');
const ResponseHandler = require('../utils/responseHandler');
const productValidation = require('../validations/productValidation');

// Helper function to generate slug from name and size
const generateSlug = (name, size) => {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .trim('-'); // Remove leading/trailing hyphens
  
  const sizeSlug = size.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${baseSlug}-${sizeSlug}`;
};

// Ürün Oluşturma
exports.createProduct = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = productValidation.createProduct.validate(req.body);
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return ResponseHandler.validationError(res, errors);
    }

    // Generate slug if not provided
    if (!value.slug) {
      value.slug = generateSlug(value.name, value.size);
    }

    // Check if product with same name and size already exists
    const existingProduct = await Product.findOne({
      name: value.name,
      size: value.size,
      isActive: true
    });

    if (existingProduct) {
      return ResponseHandler.error(res, 'Bu isim ve boyutta bir ürün zaten mevcut', 409);
    }

    const product = await Product.create(value);
    return ResponseHandler.success(res, { product }, 'Ürün başarıyla oluşturuldu', 201);
    
  } catch (error) {
    console.error('Product creation error:', error);
    return ResponseHandler.error(res, 'Ürün oluşturulamadı', 500, error.message);
  }
};

// Tüm Ürünleri Getirme
exports.getAllProducts = async (req, res) => {
  try {
    // Validate query parameters
    const { error, value } = productValidation.getProducts.validate(req.query);
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return ResponseHandler.validationError(res, errors);
    }

    const { category, size, minPrice, maxPrice, sort, search, featured, limit, page } = value;
    let query = { isActive: true };

    // Öne çıkan ürünler filtresi
    if (featured === 'true') {
      query.featured = true;
    }

    // Kategori filtresi
    if (category) {
      query.category = category;
    }

    // Boyut filtresi
    if (size) {
      query.size = size;
    }

    // Fiyat filtresi
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = minPrice;
      if (maxPrice) query.price.$lte = maxPrice;
    }

    // Arama filtresi
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await Product.countDocuments(query);

    // Execute query with pagination
    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Return paginated response
    return ResponseHandler.paginated(res, products, {
      page,
      limit,
      total
    }, 'Ürünler başarıyla getirildi');

  } catch (error) {
    console.error('Get products error:', error);
    return ResponseHandler.error(res, 'Ürünler getirilemedi', 500, error.message);
  }
};

// Tek Ürün Getirme
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ürün getirilemedi',
      error: error.message
    });
  }
};

// Slug ile Ürün Getirme
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ürün getirilemedi',
      error: error.message
    });
  }
};

// Ürün Güncelleme
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Ürün güncellenemedi',
      error: error.message
    });
  }
};

// Ürün Silme (Soft Delete)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Ürün başarıyla silindi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ürün silinemedi',
      error: error.message
    });
  }
};

// Admin: Tüm ürünleri (pasif olanlar dahil) getirme
exports.getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Ürün güncelleme
exports.updateProductAdmin = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Ürün silme
exports.deleteProductAdmin = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};