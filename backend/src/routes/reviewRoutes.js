const express = require('express');
const router = express.Router();
const {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  voteReviewHelpful,
  getUserReviews,
  getReviewStats,
  getAllReviews,
  adminDeleteReview,
  updateReviewStatus,
  checkCanReview
} = require('../controllers/reviewController');
const { protect, authorize, optionalAuth } = require('../middlewares/auth');
const { userLimiter, adminLimiter } = require('../middlewares/rateLimiter');
const { validateCreateReview, validateUpdateReview, validateReviewQuery, validateReviewAction, validateHelpfulVote } = require('../validations/reviewValidation');

// Public routes
router.get('/product/:productId', validateReviewQuery, getProductReviews);
router.get('/stats/:productId', validateReviewQuery, getReviewStats);

// Protected user routes
router.use(protect); // All routes below require authentication

router.post('/', userLimiter, validateCreateReview, createReview);
router.get('/can-review/:productId', checkCanReview);
router.get('/user', validateReviewQuery, getUserReviews);
router.put('/:reviewId', userLimiter, validateUpdateReview, updateReview);
router.delete('/:reviewId', deleteReview);
router.patch('/:reviewId/helpful', userLimiter, validateHelpfulVote, voteReviewHelpful);

// Admin routes
router.get('/admin/all', authorize('admin'), validateReviewQuery, getAllReviews);
router.delete('/admin/:reviewId', adminLimiter, authorize('admin'), adminDeleteReview);
router.patch('/admin/:reviewId/status', adminLimiter, authorize('admin'), validateReviewAction, updateReviewStatus);

module.exports = router;
