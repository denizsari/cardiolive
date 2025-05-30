const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { protect, authorize } = require('../middlewares/auth');
const { userLimiter, adminLimiter } = require('../middlewares/rateLimiter');
const { 
  validateUpdateSettings, 
  validateSettingsQuery, 
  validateRequest 
} = require('../validations/settingsValidation');

// Public routes (rate limited)
router.get('/public', 
  userLimiter,
  settingsController.getPublicSettings
);

// Protected routes (require authentication)
router.get('/', 
  userLimiter,
  protect, 
  authorize('admin'),
  validateSettingsQuery,
  validateRequest,
  settingsController.getSettings
);

router.get('/category', 
  userLimiter,
  protect, 
  authorize('admin'),
  validateSettingsQuery,
  validateRequest,
  settingsController.getSettingsByCategory
);

// Admin only routes (stricter rate limiting)
router.put('/', 
  adminLimiter,
  protect, 
  authorize('admin'),
  validateUpdateSettings,
  validateRequest,
  settingsController.updateSettings
);

router.post('/reset', 
  adminLimiter,
  protect, 
  authorize('admin'),
  settingsController.resetSettings
);

module.exports = router;
