const Review = require('../models/reviewModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const ResponseHandler = require('../utils/responseHandler');

// Get reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, rating, verified, sort = 'createdAt', order = 'desc' } = req.query;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return ResponseHandler.notFound(res, 'Ürün bulunamadı');
    }

    // Build filter
    const filter = { 
      product: productId, 
      status: 'approved'
    };
    
    if (rating) filter.rating = rating;
    if (verified !== undefined) filter.isVerifiedPurchase = verified;

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build sort
    const sortObj = { [sort]: order === 'asc' ? 1 : -1 };

    const reviews = await Review.find(filter)
      .populate('user', 'name')
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit))
      .select('-__v');

    const totalReviews = await Review.countDocuments(filter);

    // Calculate rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { product: productId, status: 'approved' } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Calculate average rating
    const avgResult = await Review.aggregate([
      { $match: { product: productId, status: 'approved' } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      averageRating: avgResult[0]?.averageRating || 0,
      totalReviews: avgResult[0]?.totalReviews || 0,
      ratingDistribution: ratingDistribution.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };

    const pagination = {
      currentPage: Number(page),
      totalPages: Math.ceil(totalReviews / limit),
      totalReviews,
      hasNext: page < Math.ceil(totalReviews / limit),
      hasPrev: page > 1
    };

    ResponseHandler.success(res, 'Yorumlar başarıyla getirildi', {
      reviews,
      pagination,
      stats
    });
  } catch (error) {
    ResponseHandler.error(res, 'Yorumları getirme hatası', error);
  }
};

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { product, rating, title, comment, recommend, images } = req.body;
    const userId = req.user.userId;

    // Check if product exists
    const productDoc = await Product.findById(product);
    if (!productDoc) {
      return ResponseHandler.notFound(res, 'Ürün bulunamadı');
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product,
      user: userId,
      status: { $ne: 'deleted' }
    });

    if (existingReview) {
      return ResponseHandler.badRequest(res, 'Bu ürün için zaten bir yorum yapmışsınız');
    }

    // Check if user has purchased this product
    const hasPurchased = await Order.findOne({
      user: userId,
      'items.product': product,
      status: 'delivered'
    });

    const review = new Review({
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

    await review.save();
    await review.populate('user', 'name email');

    // Update product rating
    await updateProductRating(product);

    ResponseHandler.created(res, 'Yorum başarıyla eklendi ve onay bekliyor', { review });
  } catch (error) {
    ResponseHandler.error(res, 'Yorum ekleme hatası', error);
  }
};

// Get user's own reviews
exports.getUserReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
    const userId = req.user.userId;

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build sort
    const sortObj = { [sort]: order === 'asc' ? 1 : -1 };

    const reviews = await Review.find({
      user: userId,
      status: { $ne: 'deleted' }
    })
      .populate('product', 'name images price')
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit))
      .select('-__v');

    const totalReviews = await Review.countDocuments({
      user: userId,
      status: { $ne: 'deleted' }
    });

    const pagination = {
      currentPage: Number(page),
      totalPages: Math.ceil(totalReviews / limit),
      totalReviews,
      hasNext: page < Math.ceil(totalReviews / limit),
      hasPrev: page > 1
    };

    ResponseHandler.success(res, 'Yorumlar başarıyla getirildi', {
      reviews,
      pagination
    });
  } catch (error) {
    ResponseHandler.error(res, 'Yorumları getirme hatası', error);
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment, recommend, images } = req.body;
    const userId = req.user.userId;

    const review = await Review.findOne({
      _id: reviewId,
      user: userId
    });

    if (!review) {
      return ResponseHandler.notFound(res, 'Yorum bulunamadı veya düzenleme yetkiniz yok');
    }

    // Update fields
    if (rating !== undefined) review.rating = rating;
    if (title !== undefined) review.title = title;
    if (comment !== undefined) review.comment = comment;
    if (recommend !== undefined) review.recommend = recommend;
    if (images !== undefined) review.images = images;
    
    review.status = 'pending'; // Re-approve after edit
    review.updatedAt = new Date();

    await review.save();
    await review.populate('user', 'name email');
    await review.populate('product', 'name');

    // Update product rating
    await updateProductRating(review.product._id);

    ResponseHandler.success(res, 'Yorum başarıyla güncellendi ve onay bekliyor', { review });
  } catch (error) {
    ResponseHandler.error(res, 'Yorum güncelleme hatası', error);
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.userId;

    const review = await Review.findOne({
      _id: reviewId,
      user: userId
    });

    if (!review) {
      return ResponseHandler.notFound(res, 'Yorum bulunamadı veya silme yetkiniz yok');
    }

    const productId = review.product;
    review.status = 'deleted';
    await review.save();

    // Update product rating
    await updateProductRating(productId);

    ResponseHandler.success(res, 'Yorum başarıyla silindi');
  } catch (error) {
    ResponseHandler.error(res, 'Yorum silme hatası', error);
  }
};

// Mark review as helpful/unhelpful
exports.voteReviewHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { helpful } = req.body;
    const userId = req.user.userId;

    const review = await Review.findOne({
      _id: reviewId,
      status: 'approved'
    });

    if (!review) {
      return ResponseHandler.notFound(res, 'Yorum bulunamadı');
    }

    // Prevent voting on own review
    if (review.user.toString() === userId) {
      return ResponseHandler.badRequest(res, 'Kendi yorumunuza oy veremezsiniz');
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

    ResponseHandler.success(res, 'Oy başarıyla kaydedildi', {
      helpfulCount: review.helpfulCount,
      unhelpfulCount: review.unhelpfulCount
    });
  } catch (error) {
    ResponseHandler.error(res, 'Oy verme hatası', error);
  }
};

// Admin: Get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      rating, 
      productId, 
      userId, 
      sort = 'createdAt', 
      order = 'desc' 
    } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (rating) filter.rating = rating;
    if (productId) filter.product = productId;
    if (userId) filter.user = userId;

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build sort
    const sortObj = { [sort]: order === 'asc' ? 1 : -1 };

    const reviews = await Review.find(filter)
      .populate('user', 'name email')
      .populate('product', 'name')
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit))
      .select('-__v');

    const totalReviews = await Review.countDocuments(filter);

    // Get statistics
    const stats = await Review.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      }
    ]);

    const pagination = {
      currentPage: Number(page),
      totalPages: Math.ceil(totalReviews / limit),
      totalReviews,
      hasNext: page < Math.ceil(totalReviews / limit),
      hasPrev: page > 1
    };

    ResponseHandler.success(res, 'Yorumlar başarıyla getirildi', {
      reviews,
      pagination,
      stats: stats.reduce((acc, item) => {
        acc[item._id] = {
          count: item.count,
          avgRating: item.avgRating
        };
        return acc;
      }, {})
    });
  } catch (error) {
    ResponseHandler.error(res, 'Yorumları getirme hatası', error);
  }
};

// Admin: Update review status
exports.updateReviewStatus = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { action, reason } = req.body;

    const review = await Review.findById(reviewId)
      .populate('user', 'name email')
      .populate('product', 'name');

    if (!review) {
      return ResponseHandler.notFound(res, 'Yorum bulunamadı');
    }

    switch (action) {
      case 'approve':
        review.status = 'approved';
        review.moderatedAt = new Date();
        review.moderatedBy = req.user.userId;
        break;
      case 'reject':
        review.status = 'rejected';
        review.moderationReason = reason;
        review.moderatedAt = new Date();
        review.moderatedBy = req.user.userId;
        break;
      case 'feature':
        review.isFeatured = true;
        break;
      case 'unfeature':
        review.isFeatured = false;
        break;
      default:
        return ResponseHandler.badRequest(res, 'Geçersiz işlem');
    }

    await review.save();

    // Update product rating if status changed to approved/rejected
    if (['approve', 'reject'].includes(action)) {
      await updateProductRating(review.product._id);
    }

    ResponseHandler.success(res, 'Yorum durumu başarıyla güncellendi', { review });
  } catch (error) {
    ResponseHandler.error(res, 'Yorum durumu güncelleme hatası', error);
  }
};

// Admin: Delete review permanently
exports.adminDeleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findByIdAndDelete(reviewId);

    if (!review) {
      return ResponseHandler.notFound(res, 'Yorum bulunamadı');
    }

    // Update product rating
    await updateProductRating(review.product);

    ResponseHandler.success(res, 'Yorum kalıcı olarak silindi');
  } catch (error) {
    ResponseHandler.error(res, 'Yorum silme hatası', error);
  }
};

// Get review statistics for a product
exports.getReviewStats = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(productId)) {
      return ResponseHandler.badRequest(res, 'Geçersiz ürün ID');
    }

    const stats = await Review.aggregate([
      { 
        $match: { 
          product: productId, 
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
      return ResponseHandler.success(res, 'İstatistikler getirildi', {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: {}
      });
    }

    const { totalReviews, averageRating, ratingCounts } = stats[0];
    
    // Calculate rating distribution
    const ratingDistribution = ratingCounts.reduce((acc, rating) => {
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {});

    ResponseHandler.success(res, 'İstatistikler getirildi', {
      totalReviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
      ratingDistribution
    });
  } catch (error) {
    ResponseHandler.error(res, 'İstatistik getirme hatası', error);
  }
};

// Utility function to update product rating
const updateProductRating = async (productId) => {
  try {
    const reviews = await Review.find({ 
      product: productId, 
      status: 'approved' 
    });

    if (reviews.length === 0) {
      await Product.findByIdAndUpdate(productId, {
        averageRating: 0,
        totalReviews: 0
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Product.findByIdAndUpdate(productId, {
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: reviews.length
    });
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
};

// Utility function to validate ObjectId
const isValidObjectId = (id) => {
  return id && id.match(/^[0-9a-fA-F]{24}$/);
};
