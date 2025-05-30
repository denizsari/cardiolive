const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { protect, authorize } = require('../middlewares/auth');
const { userLimiter, adminLimiter } = require('../middlewares/rateLimiter');
const { 
  validateCreateBlog, 
  validateUpdateBlog, 
  validateBlogQuery, 
  validateRequest 
} = require('../validations/blogValidation');

// Public routes
router.get('/', 
  userLimiter,
  validateBlogQuery, 
  validateRequest, 
  blogController.getAllBlogs
);

router.get('/featured', 
  userLimiter,
  blogController.getFeaturedBlogs
);

router.get('/categories', 
  userLimiter,
  blogController.getBlogCategories
);

router.get('/slug/:slug', 
  userLimiter,
  blogController.getBlogBySlug
);

router.get('/:id', 
  userLimiter,
  blogController.getBlogById
);

router.get('/:id/related', 
  userLimiter,
  blogController.getRelatedBlogs
);

// Admin routes (require authentication and admin role)
router.post('/', 
  adminLimiter,
  protect, 
  authorize('admin'), 
  validateCreateBlog, 
  validateRequest, 
  blogController.createBlog
);

router.put('/:id', 
  adminLimiter,
  protect, 
  authorize('admin'), 
  validateUpdateBlog, 
  validateRequest, 
  blogController.updateBlog
);

router.delete('/:id', 
  adminLimiter,
  protect, 
  authorize('admin'), 
  blogController.deleteBlog
);

module.exports = router;