const express = require('express');
const router = express.Router();
const {
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlistStatus,
  getWishlistCount,
  clearWishlist,
  addMultipleToWishlist,
  removeMultipleFromWishlist,
  updateWishlistItemNotes
} = require('../controllers/wishlistController');
const { protect } = require('../middlewares/auth');
const { userLimiter } = require('../middlewares/rateLimiter');
const { 
  validateAddToWishlist, 
  validateBulkWishlist, 
  validateWishlistNotes, 
  validateRequest 
} = require('../validations/wishlistValidation');

// All wishlist routes require authentication
router.use(userLimiter);
router.use(protect);

// Get user's complete wishlist
router.get('/', getUserWishlist);

// Get wishlist item count
router.get('/count', getWishlistCount);

// Check if specific product is in wishlist
router.get('/check/:productId', checkWishlistStatus);

// Add product to wishlist
router.post('/', 
  validateAddToWishlist, 
  validateRequest, 
  addToWishlist
);

// Add multiple products to wishlist (bulk operation)
router.post('/bulk-add', 
  validateBulkWishlist, 
  validateRequest, 
  addMultipleToWishlist
);

// Remove multiple products from wishlist (bulk operation)
router.post('/bulk-remove', 
  validateBulkWishlist, 
  validateRequest, 
  removeMultipleFromWishlist
);

// Update wishlist item notes
router.patch('/:productId/notes', 
  validateWishlistNotes, 
  validateRequest, 
  updateWishlistItemNotes
);

// Remove product from wishlist
router.delete('/:productId', removeFromWishlist);

// Clear entire wishlist
router.delete('/', clearWishlist);

module.exports = router;
