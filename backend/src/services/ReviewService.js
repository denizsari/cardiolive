const BaseService = require('./BaseService');
const Review = require('../models/reviewModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const { logger } = require('../utils/logger');
const mongoose = require('mongoose');

/**
 * Review Service Class
 * Handles all review-related business logic
 * @class ReviewService
 * @extends BaseService
 */
class ReviewService extends BaseService {
  constructor() {
    super(Review);
  }

  /**
   * Create a new review with validation
   * @param {Object} reviewData - Review creation data
   * @param {string} userId - User ID creating the review
   * @returns {Promise<Object>} Created review
   * @throws {Error} If validation fails or duplicate review
   */
  async createReview(reviewData, userId) {
    const { product, rating, title, comment, recommend, images } = reviewData;

    // Check if product exists
    const productDoc = await Product.findById(product);
    if (!productDoc) {
      throw new Error('Ürün bulunamadı');
    }

    // Check if user already reviewed this product
    const existingReview = await this.findOne({
      product,
      user: userId,
      status: { $ne: 'deleted' }
    });

    if (existingReview) {
      throw new Error('Bu ürün için zaten bir yorum yapmışsınız');
    }

    // Check if user has purchased this product
    const hasPurchased = await Order.findOne({
      user: userId,
      'items.product': product,
      status: 'delivered'
    });

    const review = await this.create({
      product,
      user: userId,
      rating,
      title,
      comment,
      recommend: recommend || true,
      images: images || [],
      isVerifiedPurchase: !!hasPurchased,
      status: 'pending' // Reviews need approval
    });

    // Update product rating
    await this.updateProductRating(product);

    logger.info('Review created', { reviewId: review._id, productId: product, userId });

    return review;
  }

  /**
   * Get reviews for a product with filtering and pagination
   * @param {string} productId - Product ID
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated reviews with stats
   */
  async getProductReviews(productId, filters = {}, options = {}) {
    const { rating, verified } = filters;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Ürün bulunamadı');
    }

    const filter = { 
      product: productId, 
      status: 'approved'
    };
    
    if (rating) filter.rating = rating;
    if (verified !== undefined) filter.isVerifiedPurchase = verified;

    const queryOptions = {
      ...options,
      populate: [{ path: 'user', select: 'name' }]
    };

    const result = await this.findAll(filter, queryOptions);

    // Calculate rating distribution and average
    const [ratingDistribution, avgResult] = await Promise.all([
      this.aggregate([
        { $match: { product: new mongoose.Types.ObjectId(productId), status: 'approved' } },
        {
          $group: {
            _id: '$rating',
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      this.aggregate([
        { $match: { product: new mongoose.Types.ObjectId(productId), status: 'approved' } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 }
          }
        }
      ])
    ]);

    const stats = {
      averageRating: avgResult[0]?.averageRating || 0,
      totalReviews: avgResult[0]?.totalReviews || 0,
      ratingDistribution: ratingDistribution.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };

    return {
      ...result,
      stats
    };
  }

  /**
   * Update a review (only by review owner)
   * @param {string} reviewId - Review ID
   * @param {Object} updateData - Update data
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<Object>} Updated review
   * @throws {Error} If review not found or unauthorized
   */
  async updateReview(reviewId, updateData, userId) {
    const { rating, title, comment, recommend, images } = updateData;

    const review = await this.findOne({ _id: reviewId, user: userId });
    if (!review) {
      throw new Error('Yorum bulunamadı veya düzenleme yetkiniz yok');
    }

    const updateFields = {};
    if (rating !== undefined) updateFields.rating = rating;
    if (title !== undefined) updateFields.title = title;
    if (comment !== undefined) updateFields.comment = comment;
    if (recommend !== undefined) updateFields.recommend = recommend;
    if (images !== undefined) updateFields.images = images;
    
    updateFields.status = 'pending'; // Re-approve after edit
    updateFields.updatedAt = new Date();

    const updatedReview = await this.updateById(reviewId, updateFields);

    // Update product rating
    await this.updateProductRating(review.product);

    logger.info('Review updated', { reviewId, userId });

    return updatedReview;
  }

  /**
   * Delete a review (soft delete)
   * @param {string} reviewId - Review ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<void>}
   * @throws {Error} If review not found or unauthorized
   */
  async deleteReview(reviewId, userId) {
    const review = await this.findOne({ _id: reviewId, user: userId });
    if (!review) {
      throw new Error('Yorum bulunamadı veya silme yetkiniz yok');
    }

    const productId = review.product;
    await this.updateById(reviewId, { status: 'deleted' });

    // Update product rating
    await this.updateProductRating(productId);

    logger.info('Review deleted', { reviewId, userId });
  }

  /**
   * Vote on review helpfulness
   * @param {string} reviewId - Review ID
   * @param {boolean} helpful - Whether the review is helpful
   * @param {string} userId - User ID voting
   * @returns {Promise<Object>} Updated vote counts
   * @throws {Error} If review not found or voting on own review
   */
  async voteReviewHelpful(reviewId, helpful, userId) {
    const review = await this.findOne({ _id: reviewId, status: 'approved' });
    if (!review) {
      throw new Error('Yorum bulunamadı');
    }

    // Prevent voting on own review
    if (review.user.toString() === userId) {
      throw new Error('Kendi yorumunuza oy veremezsiniz');
    }

    // Initialize helpfulVotes if not exists
    if (!review.helpfulVotes) {
      review.helpfulVotes = [];
    }

    // Check if user already voted
    const existingVoteIndex = review.helpfulVotes.findIndex(
      vote => vote.user.toString() === userId
    );

    if (existingVoteIndex !== -1) {
      // Update existing vote
      review.helpfulVotes[existingVoteIndex].helpful = helpful;
    } else {
      // Add new vote
      review.helpfulVotes.push({ user: userId, helpful });
    }

    // Recalculate helpful counts
    review.helpfulCount = review.helpfulVotes.filter(vote => vote.helpful).length;
    review.unhelpfulCount = review.helpfulVotes.filter(vote => !vote.helpful).length;

    await review.save();

    logger.info('Review vote recorded', { reviewId, userId, helpful });

    return {
      helpfulCount: review.helpfulCount,
      unhelpfulCount: review.unhelpfulCount
    };
  }

  /**
   * Get user's reviews with pagination
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated user reviews
   */
  async getUserReviews(userId, options = {}) {
    const filter = {
      user: userId,
      status: { $ne: 'deleted' }
    };

    const queryOptions = {
      ...options,
      populate: [{ path: 'product', select: 'name images price' }]
    };

    return await this.findAll(filter, queryOptions);
  }

  /**
   * Update review status (Admin only)
   * @param {string} reviewId - Review ID
   * @param {string} action - Action to perform (approve, reject, feature, unfeature)
   * @param {string} adminId - Admin user ID
   * @param {string} reason - Reason for action (required for reject)
   * @returns {Promise<Object>} Updated review
   * @throws {Error} If review not found or invalid action
   */
  async updateReviewStatus(reviewId, action, adminId, reason = null) {
    const review = await this.findById(reviewId);
    if (!review) {
      throw new Error('Yorum bulunamadı');
    }

    switch (action) {
      case 'approve':
        review.status = 'approved';
        review.moderatedAt = new Date();
        review.moderatedBy = adminId;
        break;
      case 'reject':
        review.status = 'rejected';
        review.moderationReason = reason;
        review.moderatedAt = new Date();
        review.moderatedBy = adminId;
        break;
      case 'feature':
        review.isFeatured = true;
        break;
      case 'unfeature':
        review.isFeatured = false;
        break;
      default:
        throw new Error('Geçersiz işlem');
    }

    await review.save();

    // Update product rating if status changed to approved/rejected
    if (['approve', 'reject'].includes(action)) {
      await this.updateProductRating(review.product._id);
    }

    logger.info('Review status updated', { reviewId, action, adminId });

    return review;
  }

  /**
   * Get all reviews with filtering (Admin)
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated reviews with stats
   */
  async getAllReviews(filters = {}, options = {}) {
    const { status, rating, productId, userId } = filters;
    
    const filter = {};
    if (status) filter.status = status;
    if (rating) filter.rating = rating;
    if (productId) filter.product = productId;
    if (userId) filter.user = userId;

    const queryOptions = {
      ...options,
      populate: [
        { path: 'user', select: 'name email' },
        { path: 'product', select: 'name' }
      ]
    };

    const result = await this.findAll(filter, queryOptions);

    // Get statistics
    const stats = await this.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      }
    ]);    return {
      reviews: result.documents,
      pagination: result.pagination,
      stats: stats.reduce((acc, item) => {
        acc[item._id] = {
          count: item.count,
          avgRating: item.avgRating
        };
        return acc;
      }, {})
    };
  }

  /**
   * Get review statistics for a product
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} Review statistics
   */
  async getReviewStats(productId) {
    const stats = await this.aggregate([
      { 
        $match: { 
          product: new mongoose.Types.ObjectId(productId), 
          status: 'approved' 
        } 
      },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          ratingCounts: {
            $push: '$rating'
          }
        }
      }
    ]);

    if (!stats.length) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: {}
      };
    }

    const { totalReviews, averageRating, ratingCounts } = stats[0];
    
    // Calculate rating distribution
    const ratingDistribution = ratingCounts.reduce((acc, rating) => {
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {});

    return {
      totalReviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
      ratingDistribution
    };
  }

  /**
   * Update product rating based on approved reviews
   * @param {string} productId - Product ID
   * @returns {Promise<void>}
   * @private
   */
  async updateProductRating(productId) {
    const stats = await this.aggregate([
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

    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews
    });

    logger.info('Product rating updated', { productId, averageRating, totalReviews });
  }
}

module.exports = new ReviewService();
