const BaseService = require('./BaseService');
const Product = require('../models/productModel');
const { logger } = require('../utils/logger');
const mongoose = require('mongoose');

/**
 * Product Service Class
 * Handles all product-related business logic
 * @class ProductService
 * @extends BaseService
 */
class ProductService extends BaseService {
  constructor() {
    super(Product);
  }

  /**
   * Get products with advanced filtering and search
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated products with metadata
   */
  async getProducts(filters = {}, options = {}) {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      inStock,
      featured,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    // Build filter object
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (featured !== undefined) filter.featured = featured;
    if (inStock !== undefined) filter.inStock = inStock;

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Rating filter
    if (rating) {
      filter.averageRating = { $gte: parseFloat(rating) };
    }

    // Sort options
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const queryOptions = {
      ...options,
      sort
    };

    const result = await this.findAll(filter, queryOptions);

    // Get filter metadata
    const metadata = await this.getFilterMetadata();

    return {
      ...result,
      metadata
    };
  }

  /**
   * Get filter metadata for product filtering UI
   * @returns {Promise<Object>} Available filter options
   * @private
   */
  async getFilterMetadata() {
    const [categories, brands, priceRange] = await Promise.all([
      this.model.distinct('category'),
      this.model.distinct('brand'),
      this.model.aggregate([
        {
          $group: {
            _id: null,
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' }
          }
        }
      ])
    ]);

    return {
      categories: categories.filter(Boolean),
      brands: brands.filter(Boolean),
      priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 }
    };
  }

  /**
   * Get product by slug with related products
   * @param {string} slug - Product slug
   * @returns {Promise<Object>} Product with related products
  /**
   * Get product by ID
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} Product
   */
  async getProductById(productId) {
    const product = await this.findById(productId);
    if (!product) {
      throw new Error('Ürün bulunamadı');
    }
    return product;
  }
  async getProductBySlug(slug) {
    const product = await this.findOne({ slug });
    if (!product) {
      throw new Error('Ürün bulunamadı');
    }

    // Get related products (same category, excluding current product)
    const relatedProducts = await this.model
      .find({
        category: product.category,
        _id: { $ne: product._id },
        inStock: true
      })
      .limit(4)
      .select('name slug price discountedPrice images averageRating totalReviews');

    return {
      product,
      relatedProducts
    };
  }

  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} Created product
   */
  async createProduct(productData) {
    // Generate slug from name
    const slug = this.generateSlug(productData.name);
    
    // Check if slug already exists
    const existingProduct = await this.findOne({ slug });
    if (existingProduct) {
      throw new Error('Bu isimle bir ürün zaten mevcut');
    }

    const product = await this.create({
      ...productData,
      slug,
      averageRating: 0,
      totalReviews: 0
    });

    logger.info('Product created', { productId: product._id, name: product.name });

    return product;
  }

  /**
   * Update product
   * @param {string} productId - Product ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated product
   */
  async updateProduct(productId, updateData) {
    // If name is being updated, regenerate slug
    if (updateData.name) {
      const newSlug = this.generateSlug(updateData.name);
      const existingProduct = await this.findOne({ 
        slug: newSlug, 
        _id: { $ne: productId } 
      });
      
      if (existingProduct) {
        throw new Error('Bu isimle başka bir ürün zaten mevcut');
      }
      
      updateData.slug = newSlug;
    }

    const product = await this.updateById(productId, updateData);
    if (!product) {
      throw new Error('Ürün bulunamadı');
    }

    logger.info('Product updated', { productId, name: product.name });

    return product;
  }

  /**
   * Delete product
   * @param {string} productId - Product ID
   * @returns {Promise<void>}
   */
  async deleteProduct(productId) {
    const product = await this.findById(productId);
    if (!product) {
      throw new Error('Ürün bulunamadı');
    }

    await this.deleteById(productId);

    logger.info('Product deleted', { productId, name: product.name });
  }

  /**
   * Update product rating based on reviews
   * @param {string} productId - Product ID
   * @returns {Promise<void>}
   */
  async updateProductRating(productId) {
    const Review = require('../models/reviewModel');
    
    const stats = await Review.aggregate([
      { 
        $match: { 
          product: new mongoose.Types.ObjectId(productId),
          status: 'approved'
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    const { averageRating = 0, totalReviews = 0 } = stats[0] || {};

    await this.updateById(productId, {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews
    });

    logger.info('Product rating updated', { productId, averageRating, totalReviews });
  }

  /**
   * Bulk update product stock
   * @param {Array} updates - Array of {productId, stock, inStock}
   * @returns {Promise<Object>} Update results
   */
  async bulkUpdateStock(updates) {
    const bulkOps = updates.map(({ productId, stock, inStock }) => ({
      updateOne: {
        filter: { _id: productId },
        update: { 
          stock: parseInt(stock),
          inStock: inStock !== undefined ? inStock : parseInt(stock) > 0
        }
      }
    }));

    const result = await this.model.bulkWrite(bulkOps);

    logger.info('Bulk stock update completed', { 
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    });

    return {
      success: true,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    };
  }

  /**
   * Get featured products
   * @param {number} limit - Number of products to return
   * @returns {Promise<Array>} Featured products
   */
  async getFeaturedProducts(limit = 6) {
    return await this.model
      .find({ featured: true, inStock: true })
      .sort({ averageRating: -1, totalReviews: -1 })
      .limit(limit)
      .select('name slug price discountedPrice images averageRating totalReviews');
  }

  /**
   * Get products by category
   * @param {string} category - Product category
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated products
   */
  async getProductsByCategory(category, options = {}) {
    const filter = { category, inStock: true };
    return await this.findAll(filter, options);
  }

  /**
   * Search products with autocomplete suggestions
   * @param {string} query - Search query
   * @param {number} limit - Number of suggestions
   * @returns {Promise<Array>} Product suggestions
   */
  async getSearchSuggestions(query, limit = 5) {
    if (!query || query.length < 2) return [];

    const products = await this.model
      .find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ],
        inStock: true
      })
      .limit(limit)
      .select('name slug')
      .sort({ averageRating: -1 });

    return products.map(product => ({
      name: product.name,
      slug: product.slug
    }));
  }

  /**
   * Get product statistics
   * @returns {Promise<Object>} Product statistics
   */
  async getProductStats() {
    const stats = await this.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          inStockProducts: { $sum: { $cond: ['$inStock', 1, 0] } },
          outOfStockProducts: { $sum: { $cond: ['$inStock', 0, 1] } },
          featuredProducts: { $sum: { $cond: ['$featured', 1, 0] } },
          averagePrice: { $avg: '$price' },
          totalValue: { $sum: { $multiply: ['$price', '$stock'] } }
        }
      }
    ]);

    const categoryStats = await this.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averagePrice: { $avg: '$price' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return {
      ...stats[0],
      categoryStats
    };
  }

  /**
   * Generate URL-friendly slug from product name
   * @param {string} name - Product name
   * @returns {string} Generated slug
   * @private
   */
  generateSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  }
}

module.exports = new ProductService();
