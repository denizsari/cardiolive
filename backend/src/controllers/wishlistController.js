const WishlistService = require('../services/WishlistService');
const ResponseHandler = require('../utils/responseHandler');
const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

/**
 * @desc Get user's wishlist with filtering and pagination
 * @route GET /api/wishlist
 * @access Private
 */
exports.getUserWishlist = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'addedAt', order = 'desc', category, minPrice, maxPrice, inStock } = req.query;
    const userId = req.user.userId;

    const filters = { category, minPrice, maxPrice, inStock };
    const options = { 
      page: Number(page), 
      limit: Number(limit), 
      sortBy: sort, 
      sortOrder: order 
    };

    const result = await WishlistService.getUserWishlist(userId, filters, options);

    logger.logBusinessEvent('wishlist_viewed', { 
      userId, 
      itemCount: result.data.length,
      filters,
      options 
    });

    ResponseHandler.success(res, 'Favori listesi başarıyla getirildi', {
      wishlist: result.data,
      pagination: result.pagination,
      count: result.data.length
    });
  } catch (error) {
    logger.error('Error getting user wishlist:', { userId: req.user?.userId, error: error.message, stack: error.stack });
    ResponseHandler.error(res, 'Favori listesi getirme hatası', error);
  }
};

/**
 * @desc Add product to wishlist
 * @route POST /api/wishlist
 * @access Private
 */
exports.addToWishlist = async (req, res) => {
  try {
    const { productId, notes } = req.body;
    const userId = req.user.userId;

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return ResponseHandler.badRequest(res, 'Geçersiz ürün ID');
    }

    const wishlistItem = await WishlistService.addToWishlist(userId, productId, notes);

    logger.logBusinessEvent('product_added_to_wishlist', { userId, productId, notes: !!notes });

    ResponseHandler.created(res, 'Ürün favori listesine eklendi', { wishlistItem });
  } catch (error) {
    logger.error('Error adding to wishlist:', { userId: req.user?.userId, productId: req.body?.productId, error: error.message });
    
    if (error.message === 'Ürün bulunamadı' || error.message === 'Ürün zaten favori listenizde') {
      return ResponseHandler.badRequest(res, error.message);
    }
    ResponseHandler.error(res, 'Favori listesine ekleme hatası', error);
  }
};

/**
 * @desc Remove product from wishlist
 * @route DELETE /api/wishlist/:productId
 * @access Private
 */
exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return ResponseHandler.badRequest(res, 'Geçersiz ürün ID');
    }

    const removed = await WishlistService.removeFromWishlist(userId, productId);

    if (!removed) {
      return ResponseHandler.notFound(res, 'Ürün favori listenizde bulunamadı');
    }

    logger.logBusinessEvent('product_removed_from_wishlist', { userId, productId });

    ResponseHandler.success(res, 'Ürün favori listesinden kaldırıldı');
  } catch (error) {
    logger.error('Error removing from wishlist:', { userId: req.user?.userId, productId: req.params?.productId, error: error.message });
    ResponseHandler.error(res, 'Favori listesinden kaldırma hatası', error);
  }
};

/**
 * @desc Check if product is in wishlist
 * @route GET /api/wishlist/check/:productId
 * @access Private
 */
exports.checkWishlistStatus = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.userId;

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return ResponseHandler.badRequest(res, 'Geçersiz ürün ID');
    }

    const status = await WishlistService.checkWishlistStatus(userId, productId);

    ResponseHandler.success(res, 'Favori listesi durumu getirildi', status);
  } catch (error) {
    logger.error('Error checking wishlist status:', { userId: req.user?.userId, productId: req.params?.productId, error: error.message });
    ResponseHandler.error(res, 'Favori listesi kontrolü hatası', error);
  }
};

/**
 * @desc Get wishlist count for user
 * @route GET /api/wishlist/count
 * @access Private
 */
exports.getWishlistCount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const count = await WishlistService.getWishlistCount(userId);

    ResponseHandler.success(res, 'Favori listesi sayısı getirildi', { count });
  } catch (error) {
    logger.error('Error getting wishlist count:', { userId: req.user?.userId, error: error.message });
    ResponseHandler.error(res, 'Favori listesi sayısı alma hatası', error);
  }
};

/**
 * @desc Clear entire wishlist
 * @route DELETE /api/wishlist/clear
 * @access Private
 */
exports.clearWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const deletedCount = await WishlistService.clearWishlist(userId);

    logger.logBusinessEvent('wishlist_cleared', { userId, deletedCount });

    ResponseHandler.success(res, 'Favori listesi temizlendi', { deletedCount });
  } catch (error) {
    logger.error('Error clearing wishlist:', { userId: req.user?.userId, error: error.message });
    ResponseHandler.error(res, 'Favori listesi temizleme hatası', error);
  }
};

/**
 * @desc Add multiple products to wishlist (bulk operation)
 * @route POST /api/wishlist/bulk
 * @access Private
 */
exports.addMultipleToWishlist = async (req, res) => {
  try {
    const { productIds } = req.body;
    const userId = req.user.userId;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return ResponseHandler.badRequest(res, 'Geçerli ürün ID listesi gerekli');
    }

    const result = await WishlistService.addMultipleToWishlist(userId, productIds);

    logger.logBusinessEvent('bulk_add_to_wishlist', { 
      userId, 
      productCount: productIds.length,
      addedCount: result.addedCount,
      skippedCount: result.skippedCount 
    });

    ResponseHandler.success(res, result.message, {
      addedCount: result.addedCount,
      skippedCount: result.skippedCount,
      addedItems: result.addedItems
    });
  } catch (error) {
    logger.error('Error bulk adding to wishlist:', { userId: req.user?.userId, productIds: req.body?.productIds, error: error.message });
    
    if (error.message.includes('Geçersiz ürün ID') || 
        error.message.includes('bulunamadı') || 
        error.message.includes('zaten favori listenizde')) {
      return ResponseHandler.badRequest(res, error.message);
    }
    ResponseHandler.error(res, 'Toplu favori listesine ekleme hatası', error);
  }
};

/**
 * @desc Remove multiple products from wishlist (bulk operation)
 * @route DELETE /api/wishlist/bulk
 * @access Private
 */
exports.removeMultipleFromWishlist = async (req, res) => {
  try {
    const { productIds } = req.body;
    const userId = req.user.userId;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return ResponseHandler.badRequest(res, 'Geçerli ürün ID listesi gerekli');
    }

    const result = await WishlistService.removeMultipleFromWishlist(userId, productIds);

    logger.logBusinessEvent('bulk_remove_from_wishlist', { 
      userId, 
      productCount: productIds.length,
      deletedCount: result.deletedCount 
    });

    ResponseHandler.success(res, result.message, {
      deletedCount: result.deletedCount
    });
  } catch (error) {
    logger.error('Error bulk removing from wishlist:', { userId: req.user?.userId, productIds: req.body?.productIds, error: error.message });
    
    if (error.message.includes('Geçersiz ürün ID')) {
      return ResponseHandler.badRequest(res, error.message);
    }
    ResponseHandler.error(res, 'Toplu favori listesinden kaldırma hatası', error);
  }
};

/**
 * @desc Update wishlist item notes
 * @route PUT /api/wishlist/:productId/notes
 * @access Private
 */
exports.updateWishlistItemNotes = async (req, res) => {
  try {
    const { productId } = req.params;
    const { notes } = req.body;
    const userId = req.user.userId;

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return ResponseHandler.badRequest(res, 'Geçersiz ürün ID');
    }

    const wishlistItem = await WishlistService.updateWishlistItemNotes(userId, productId, notes);

    if (!wishlistItem) {
      return ResponseHandler.notFound(res, 'Ürün favori listenizde bulunamadı');
    }

    logger.logBusinessEvent('wishlist_notes_updated', { userId, productId, hasNotes: !!notes });

    ResponseHandler.success(res, 'Favori listesi notu güncellendi', { wishlistItem });
  } catch (error) {
    logger.error('Error updating wishlist notes:', { userId: req.user?.userId, productId: req.params?.productId, error: error.message });
    ResponseHandler.error(res, 'Favori listesi notu güncelleme hatası', error);
  }
};

/**
 * @desc Get wishlist recommendations
 * @route GET /api/wishlist/recommendations
 * @access Private
 */
exports.getWishlistRecommendations = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const userId = req.user.userId;

    const recommendations = await WishlistService.getWishlistRecommendations(userId, Number(limit));

    ResponseHandler.success(res, 'Favori listesi önerileri getirildi', { 
      recommendations,
      count: recommendations.length 
    });
  } catch (error) {
    logger.error('Error getting wishlist recommendations:', { userId: req.user?.userId, error: error.message });
    ResponseHandler.error(res, 'Favori listesi önerileri alma hatası', error);
  }
};

/**
 * @desc Get wishlist statistics
 * @route GET /api/wishlist/stats
 * @access Private
 */
exports.getWishlistStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const stats = await WishlistService.getWishlistStats(userId);

    ResponseHandler.success(res, 'Favori listesi istatistikleri getirildi', stats);
  } catch (error) {
    logger.error('Error getting wishlist stats:', { userId: req.user?.userId, error: error.message });
    ResponseHandler.error(res, 'Favori listesi istatistikleri alma hatası', error);
  }
};
