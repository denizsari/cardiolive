/**
 * @fileoverview Review Controller - Handles review management operations
 * @description Manages product reviews, ratings, and moderation
 * @author Cardiolive E-commerce Platform
 * @version 1.0.0
 */

const ReviewService = require('../services/ReviewService');
const ResponseHandler = require('../utils/responseHandler');
const { logger } = require('../utils/logger');

/**
 * Get reviews for a specific product
 * @route GET /api/reviews/product/:productId
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with product reviews and statistics
 */
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const filterOptions = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      rating: req.query.rating,
      verified: req.query.verified,
      sort: req.query.sort || 'createdAt',
      order: req.query.order || 'desc'
    };

    logger.logEvent('business', 'review_fetch_initiated', {
      productId,
      filters: filterOptions,
      requestId: req.id
    });

    const result = await ReviewService.getProductReviews(productId, filterOptions);

    logger.logEvent('business', 'product_reviews_fetched', {
      productId,
      reviewCount: result.reviews.length,
      totalReviews: result.pagination.totalReviews,
      averageRating: result.stats.averageRating,
      requestId: req.id
    });

    ResponseHandler.success(res, 'Yorumlar başarıyla getirildi', result);
  } catch (error) {
    logger.logEvent('error', 'product_reviews_fetch_failed', {
      productId: req.params.productId,
      error: error.message,
      stack: error.stack,
      requestId: req.id
    });

    ResponseHandler.error(res, 'Yorumları getirme hatası', error);
  }
};

/**
 * Create a new product review
 * @route POST /api/reviews
 * @access Private (authenticated users)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with created review
 */
exports.createReview = async (req, res) => {
  try {
    const reviewData = {
      ...req.body,
      user: req.user.userId
    };

    logger.logEvent('business', 'review_creation_initiated', {
      userId: req.user.userId,
      productId: reviewData.product,
      rating: reviewData.rating,
      requestId: req.id
    });

    const review = await ReviewService.createReview(reviewData);

    logger.logEvent('business', 'review_created', {
      reviewId: review._id,
      userId: req.user.userId,
      productId: reviewData.product,
      rating: reviewData.rating,
      isVerifiedPurchase: review.isVerifiedPurchase,
      requestId: req.id
    });

    ResponseHandler.created(res, 'Yorum başarıyla eklendi ve onay bekliyor', { review });
  } catch (error) {
    logger.logEvent('error', 'review_creation_failed', {
      userId: req.user.userId,
      productId: req.body.product,
      error: error.message,
      stack: error.stack,
      requestId: req.id
    });

    ResponseHandler.error(res, 'Yorum ekleme hatası', error);
  }
};

/**
 * Get current user's reviews
 * @route GET /api/reviews/my-reviews
 * @access Private (authenticated users)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user's reviews
 */
exports.getUserReviews = async (req, res) => {  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
    
    const options = {
      page: Number(page),
      limit: Number(limit),
      sort: { [sort]: order === 'desc' ? -1 : 1 }
    };

    logger.logEvent('business', 'user_reviews_fetch_initiated', {
      userId,
      options,
      requestId: req.id
    });const result = await ReviewService.getUserReviews(userId, options);

    logger.logEvent('business', 'user_reviews_fetched', {
      userId,
      reviewCount: result.documents?.length || 0,
      totalReviews: result.pagination?.totalItems || 0,
      requestId: req.id
    });

    ResponseHandler.success(res, 'Yorumlar başarıyla getirildi', {
      reviews: result.documents,
      pagination: result.pagination
    });
  } catch (error) {
    logger.logEvent('error', 'user_reviews_fetch_failed', {
      userId: req.user.userId,
      error: error.message,
      stack: error.stack,
      requestId: req.id
    });

    ResponseHandler.error(res, 'Yorumları getirme hatası', error);
  }
};

/**
 * Update a user's review
 * @route PUT /api/reviews/:reviewId
 * @access Private (review owner only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated review
 */
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.userId;
    const updateData = req.body;

    logger.logEvent('business', 'review_update_initiated', {
      reviewId,
      userId,
      updateFields: Object.keys(updateData),
      requestId: req.id
    });

    const review = await ReviewService.updateReview(reviewId, userId, updateData);

    logger.logEvent('business', 'review_updated', {
      reviewId,
      userId,
      productId: review.product._id,
      newRating: review.rating,
      status: review.status,
      requestId: req.id
    });

    ResponseHandler.success(res, 'Yorum başarıyla güncellendi ve onay bekliyor', { review });
  } catch (error) {
    logger.logEvent('error', 'review_update_failed', {
      reviewId: req.params.reviewId,
      userId: req.user.userId,
      error: error.message,
      stack: error.stack,
      requestId: req.id
    });

    ResponseHandler.error(res, 'Yorum güncelleme hatası', error);
  }
};

/**
 * Delete a user's review
 * @route DELETE /api/reviews/:reviewId
 * @access Private (review owner only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response confirmation
 */
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.userId;

    logger.logEvent('business', 'review_deletion_initiated', {
      reviewId,
      userId,
      requestId: req.id
    });

    await ReviewService.deleteReview(reviewId, userId);

    logger.logEvent('business', 'review_deleted', {
      reviewId,
      userId,
      requestId: req.id
    });

    ResponseHandler.success(res, 'Yorum başarıyla silindi');
  } catch (error) {
    logger.logEvent('error', 'review_deletion_failed', {
      reviewId: req.params.reviewId,
      userId: req.user.userId,
      error: error.message,
      stack: error.stack,
      requestId: req.id
    });

    ResponseHandler.error(res, 'Yorum silme hatası', error);
  }
};

/**
 * Vote on review helpfulness
 * @route POST /api/reviews/:reviewId/vote
 * @access Private (authenticated users)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with vote counts
 */
exports.voteReviewHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { helpful } = req.body;
    const userId = req.user.userId;

    logger.logEvent('business', 'review_vote_initiated', {
      reviewId,
      userId,
      helpful,
      requestId: req.id
    });

    const result = await ReviewService.voteReviewHelpful(reviewId, userId, helpful);

    logger.logEvent('business', 'review_voted', {
      reviewId,
      userId,
      helpful,
      newHelpfulCount: result.helpfulCount,
      newUnhelpfulCount: result.unhelpfulCount,
      requestId: req.id
    });

    ResponseHandler.success(res, 'Oy başarıyla kaydedildi', result);
  } catch (error) {
    logger.logEvent('error', 'review_vote_failed', {
      reviewId: req.params.reviewId,
      userId: req.user.userId,
      helpful: req.body.helpful,
      error: error.message,
      stack: error.stack,
      requestId: req.id
    });

    ResponseHandler.error(res, 'Oy verme hatası', error);
  }
};

/**
 * Get all reviews (Admin access)
 * @route GET /api/admin/reviews
 * @access Private (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with all reviews and statistics
 */
exports.getAllReviews = async (req, res) => {
  try {
    const filterOptions = {
      page: req.query.page || 1,
      limit: req.query.limit || 20,
      status: req.query.status,
      rating: req.query.rating,
      productId: req.query.productId,
      userId: req.query.userId,
      sort: req.query.sort || 'createdAt',
      order: req.query.order || 'desc'
    };

    logger.logEvent('business', 'admin_reviews_fetch_initiated', {
      adminId: req.user.userId,
      filters: filterOptions,
      requestId: req.id
    });

    const result = await ReviewService.getAllReviews(filterOptions);

    logger.logEvent('business', 'admin_reviews_fetched', {
      adminId: req.user.userId,
      reviewCount: result.reviews.length,
      totalReviews: result.pagination.totalReviews,
      requestId: req.id
    });

    ResponseHandler.success(res, 'Yorumlar başarıyla getirildi', result);
  } catch (error) {
    logger.logEvent('error', 'admin_reviews_fetch_failed', {
      adminId: req.user.userId,
      error: error.message,
      stack: error.stack,
      requestId: req.id
    });

    ResponseHandler.error(res, 'Yorumları getirme hatası', error);
  }
};

/**
 * Update review status (Admin access)
 * @route PUT /api/admin/reviews/:reviewId/status
 * @access Private (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated review
 */
exports.updateReviewStatus = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { action, reason } = req.body;
    const adminId = req.user.userId;

    logger.logEvent('security', 'admin_review_moderation_initiated', {
      adminId,
      reviewId,
      action,
      reason,
      requestId: req.id
    });

    const review = await ReviewService.updateReviewStatus(reviewId, adminId, action, reason);

    logger.logEvent('security', 'review_status_updated', {
      adminId,
      reviewId,
      action,
      newStatus: review.status,
      isFeatured: review.isFeatured,
      moderationReason: review.moderationReason,
      requestId: req.id
    });

    ResponseHandler.success(res, 'Yorum durumu başarıyla güncellendi', { review });
  } catch (error) {
    logger.logEvent('error', 'admin_review_moderation_failed', {
      adminId: req.user.userId,
      reviewId: req.params.reviewId,
      action: req.body.action,
      error: error.message,
      stack: error.stack,
      requestId: req.id
    });

    ResponseHandler.error(res, 'Yorum durumu güncelleme hatası', error);
  }
};

/**
 * Permanently delete a review (Admin access)
 * @route DELETE /api/admin/reviews/:reviewId
 * @access Private (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response confirmation
 */
exports.adminDeleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const adminId = req.user.userId;

    logger.logEvent('security', 'admin_review_deletion_initiated', {
      adminId,
      reviewId,
      requestId: req.id
    });

    await ReviewService.adminDeleteReview(reviewId);

    logger.logEvent('security', 'review_permanently_deleted', {
      adminId,
      reviewId,
      requestId: req.id
    });

    ResponseHandler.success(res, 'Yorum kalıcı olarak silindi');
  } catch (error) {
    logger.logEvent('error', 'admin_review_deletion_failed', {
      adminId: req.user.userId,
      reviewId: req.params.reviewId,
      error: error.message,
      stack: error.stack,
      requestId: req.id
    });

    ResponseHandler.error(res, 'Yorum silme hatası', error);
  }
};

/**
 * Get review statistics for a product
 * @route GET /api/reviews/stats/:productId
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with review statistics
 */
exports.getReviewStats = async (req, res) => {
  try {
    const { productId } = req.params;

    logger.logEvent('business', 'review_stats_fetch_initiated', {
      productId,
      requestId: req.id
    });

    const stats = await ReviewService.getReviewStats(productId);

    logger.logEvent('business', 'review_stats_fetched', {
      productId,
      totalReviews: stats.totalReviews,
      averageRating: stats.averageRating,
      requestId: req.id
    });

    ResponseHandler.success(res, 'İstatistikler getirildi', stats);
  } catch (error) {
    logger.logEvent('error', 'review_stats_fetch_failed', {
      productId: req.params.productId,
      error: error.message,
      stack: error.stack,
      requestId: req.id
    });

    ResponseHandler.error(res, 'İstatistik getirme hatası', error);
  }
};

/**
 * Check if user can leave a review for a product (has purchased it)
 * @route GET /api/reviews/can-review/:productId
 * @access Private (authenticated users)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with purchase verification status
 */
exports.checkCanReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.userId;

    logger.logEvent('business', 'purchase_verification_initiated', {
      productId,
      userId,
      requestId: req.id
    });

    const canReview = await ReviewService.checkCanReview(productId, userId);

    logger.logEvent('business', 'purchase_verification_completed', {
      productId,
      userId,
      canReview: canReview.canReview,
      hasExistingReview: canReview.hasExistingReview,
      requestId: req.id
    });

    ResponseHandler.success(res, 'Değerlendirme durumu kontrol edildi', canReview);
  } catch (error) {
    logger.logEvent('error', 'purchase_verification_failed', {
      productId: req.params.productId,
      userId: req.user.userId,
      error: error.message,
      stack: error.stack,
      requestId: req.id
    });

    ResponseHandler.error(res, 'Değerlendirme durumu kontrol hatası', error);
  }
};


