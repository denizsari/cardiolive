const BaseService = require('./BaseService');
const WishlistItem = require('../models/wishlistModel');
const Product = require('../models/productModel');
const { logger } = require('../utils/logger');
const mongoose = require('mongoose');

/**
 * Wishlist Service Class
 * Handles all wishlist-related business logic
 * @class WishlistService
 * @extends BaseService
 */
class WishlistService extends BaseService {
  constructor() {
    super(WishlistItem);
  }

  /**
   * Get user's wishlist with pagination and filtering
   * @param {string} userId - User ID
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated wishlist items
   */
  async getUserWishlist(userId, filters = {}, options = {}) {
    const { category, minPrice, maxPrice, inStock } = filters;
    
    const pipeline = [
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $match: {
          'productDetails.isActive': true,
          ...(category && { 'productDetails.category': category }),
          ...(inStock !== undefined && { 'productDetails.inStock': inStock }),
          ...(minPrice && { 'productDetails.price': { $gte: parseFloat(minPrice) } }),
          ...(maxPrice && { 'productDetails.price': { $lte: parseFloat(maxPrice) } })
        }
      },
      {
        $project: {
          _id: 1,
          user: 1,
          product: 1,
          notes: 1,
          addedAt: 1,
          productDetails: {
            name: 1,
            slug: 1,
            price: 1,
            discountedPrice: 1,
            images: 1,
            category: 1,
            brand: 1,
            inStock: 1,
            averageRating: 1,
            totalReviews: 1
          }
        }
      }
    ];

    const aggregateOptions = {
      page: options.page || 1,
      limit: options.limit || 10,
      sort: { [options.sortBy || 'addedAt']: options.sortOrder === 'asc' ? 1 : -1 }
    };

    const result = await this.aggregatePaginate(pipeline, aggregateOptions);

    // Transform the result to match expected format
    const wishlist = result.data.map(item => ({
      id: item._id,
      product: item.productDetails,
      addedAt: item.addedAt,
      notes: item.notes
    }));

    return {
      ...result,
      data: wishlist
    };
  }

  /**
   * Add product to wishlist
   * @param {string} userId - User ID
   * @param {string} productId - Product ID
   * @param {string} notes - Optional notes
   * @returns {Promise<Object>} Created wishlist item
   * @throws {Error} If product doesn't exist or already in wishlist
   */
  async addToWishlist(userId, productId, notes = '') {
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Ürün bulunamadı');
    }

    // Check if already in wishlist
    const existingItem = await this.findOne({
      user: userId,
      product: productId
    });

    if (existingItem) {
      throw new Error('Ürün zaten favori listenizde');
    }

    const wishlistItem = await this.create({
      user: userId,
      product: productId,
      notes
    });

    // Populate product details for response
    await wishlistItem.populate('product', 'name slug price discountedPrice images category brand');

    logger.info('Product added to wishlist', { userId, productId });

    return wishlistItem;
  }

  /**
   * Remove product from wishlist
   * @param {string} userId - User ID
   * @param {string} productId - Product ID
   * @returns {Promise<boolean>} True if removed, false if not found
   */
  async removeFromWishlist(userId, productId) {
    const result = await this.model.findOneAndDelete({
      user: userId,
      product: productId
    });

    if (result) {
      logger.info('Product removed from wishlist', { userId, productId });
      return true;
    }

    return false;
  }

  /**
   * Check if product is in user's wishlist
   * @param {string} userId - User ID
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} Wishlist status
   */
  async checkWishlistStatus(userId, productId) {
    const wishlistItem = await this.findOne({
      user: userId,
      product: productId
    });

    return {
      inWishlist: !!wishlistItem,
      addedAt: wishlistItem?.addedAt || null
    };
  }

  /**
   * Get wishlist count for user
   * @param {string} userId - User ID
   * @returns {Promise<number>} Wishlist item count
   */
  async getWishlistCount(userId) {
    return await this.count({ user: userId });
  }

  /**
   * Clear entire wishlist for user
   * @param {string} userId - User ID
   * @returns {Promise<number>} Number of deleted items
   */
  async clearWishlist(userId) {
    const result = await this.model.deleteMany({ user: userId });
    
    logger.info('Wishlist cleared', { userId, deletedCount: result.deletedCount });
    
    return result.deletedCount;
  }

  /**
   * Add multiple products to wishlist (bulk operation)
   * @param {string} userId - User ID
   * @param {Array<string>} productIds - Array of product IDs
   * @returns {Promise<Object>} Bulk add results
   * @throws {Error} If validation fails
   */
  async addMultipleToWishlist(userId, productIds) {
    // Validate all product IDs
    for (const productId of productIds) {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error(`Geçersiz ürün ID: ${productId}`);
      }
    }

    // Check which products exist
    const existingProducts = await Product.find({
      _id: { $in: productIds }
    }).select('_id');

    const existingProductIds = existingProducts.map(p => p._id.toString());
    const nonExistentProducts = productIds.filter(id => !existingProductIds.includes(id));

    if (nonExistentProducts.length > 0) {
      throw new Error(`Şu ürünler bulunamadı: ${nonExistentProducts.join(', ')}`);
    }

    // Check which items are already in wishlist
    const existingWishlistItems = await this.find({
      user: userId,
      product: { $in: productIds }
    }).select('product');

    const existingWishlistProductIds = existingWishlistItems.map(item => item.product.toString());
    const newProductIds = productIds.filter(id => !existingWishlistProductIds.includes(id));

    if (newProductIds.length === 0) {
      throw new Error('Tüm ürünler zaten favori listenizde');
    }

    // Create new wishlist items
    const newWishlistItems = newProductIds.map(productId => ({
      user: userId,
      product: productId,
      notes: ''
    }));

    const createdItems = await this.model.insertMany(newWishlistItems);

    // Populate product details
    const populatedItems = await this.model.find({
      _id: { $in: createdItems.map(item => item._id) }
    }).populate('product', 'name slug price discountedPrice images');

    logger.info('Multiple products added to wishlist', { 
      userId, 
      addedCount: createdItems.length,
      skippedCount: existingWishlistProductIds.length 
    });

    return {
      addedItems: populatedItems,
      addedCount: createdItems.length,
      skippedCount: existingWishlistProductIds.length,
      message: `${createdItems.length} ürün favori listesine eklendi${existingWishlistProductIds.length > 0 ? `, ${existingWishlistProductIds.length} ürün zaten listede` : ''}`
    };
  }

  /**
   * Remove multiple products from wishlist (bulk operation)
   * @param {string} userId - User ID
   * @param {Array<string>} productIds - Array of product IDs
   * @returns {Promise<Object>} Bulk remove results
   */
  async removeMultipleFromWishlist(userId, productIds) {
    // Validate all product IDs
    for (const productId of productIds) {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error(`Geçersiz ürün ID: ${productId}`);
      }
    }

    const result = await this.model.deleteMany({
      user: userId,
      product: { $in: productIds }
    });

    logger.info('Multiple products removed from wishlist', { 
      userId, 
      deletedCount: result.deletedCount 
    });

    return {
      deletedCount: result.deletedCount,
      message: `${result.deletedCount} ürün favori listesinden kaldırıldı`
    };
  }

  /**
   * Update wishlist item notes
   * @param {string} userId - User ID
   * @param {string} productId - Product ID
   * @param {string} notes - New notes
   * @returns {Promise<Object>} Updated wishlist item
   * @throws {Error} If item not found
   */
  async updateWishlistItemNotes(userId, productId, notes) {
    const wishlistItem = await this.model.findOneAndUpdate(
      { user: userId, product: productId },
      { notes: notes || '' },
      { new: true }
    ).populate('product', 'name slug price discountedPrice images');

    if (!wishlistItem) {
      throw new Error('Ürün favori listenizde bulunamadı');
    }

    logger.info('Wishlist item notes updated', { userId, productId });

    return wishlistItem;
  }

  /**
   * Get wishlist statistics for user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Wishlist statistics
   */
  async getWishlistStats(userId) {
    const stats = await this.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalValue: { $sum: '$productDetails.price' },
          averagePrice: { $avg: '$productDetails.price' },
          inStockItems: { $sum: { $cond: ['$productDetails.inStock', 1, 0] } },
          outOfStockItems: { $sum: { $cond: ['$productDetails.inStock', 0, 1] } }
        }
      }
    ]);

    const categoryBreakdown = await this.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $group: {
          _id: '$productDetails.category',
          count: { $sum: 1 },
          totalValue: { $sum: '$productDetails.price' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return {
      ...stats[0] || { totalItems: 0, totalValue: 0, averagePrice: 0, inStockItems: 0, outOfStockItems: 0 },
      categoryBreakdown
    };
  }

  /**
   * Get related products based on wishlist (recommendations)
   * @param {string} userId - User ID
   * @param {number} limit - Number of recommendations
   * @returns {Promise<Array>} Recommended products
   */
  async getRecommendations(userId, limit = 6) {
    // Get user's wishlist categories and brands
    const userPreferences = await this.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $group: {
          _id: null,
          categories: { $addToSet: '$productDetails.category' },
          brands: { $addToSet: '$productDetails.brand' }
        }
      }
    ]);

    if (!userPreferences.length) {
      return [];
    }

    const { categories, brands } = userPreferences[0];

    // Get user's current wishlist product IDs
    const wishlistProductIds = await this.find({ user: userId }).select('product');
    const excludeIds = wishlistProductIds.map(item => item.product);

    // Find similar products
    const recommendations = await Product.find({
      _id: { $nin: excludeIds },
      isActive: true,
      inStock: true,
      $or: [
        { category: { $in: categories } },
        { brand: { $in: brands } }
      ]
    })
    .sort({ averageRating: -1, totalReviews: -1 })
    .limit(limit)
    .select('name slug price discountedPrice images category brand averageRating totalReviews');

    return recommendations;
  }
}

module.exports = new WishlistService();
