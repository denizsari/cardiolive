const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  updateProfile, 
  getUserCount, 
  getAllUsers, 
  getAllUsersAdmin, 
  updateUserRole, 
  updateUserStatus, 
  deleteUser, 
  changePassword,
  forgotPassword,
  resetPassword
} = require('../controllers/userController');
const { authenticateToken, authorizeRoles, refreshTokens, logout } = require('../middlewares/auth');
const { userValidation, validateUser, validateUserQuery } = require('../validations/userValidation');
const rateLimiter = require('../middlewares/rateLimiter');

// Public routes with rate limiting
router.post('/register', 
  rateLimiter.authLimiter,
  validateUser(userValidation.register), 
  register
);

router.post('/login', 
  rateLimiter.authLimiter,
  validateUser(userValidation.login), 
  login
);

router.post('/forgot-password', 
  rateLimiter.passwordResetLimiter,
  validateUser(userValidation.forgotPassword), 
  forgotPassword
);

router.post('/reset-password', 
  rateLimiter.passwordResetLimiter,
  validateUser(userValidation.resetPassword), 
  resetPassword
);

router.post('/refresh-token', 
  rateLimiter.authLimiter,
  refreshTokens
);

// Protected routes
router.get('/me', authenticateToken, getMe);

router.put('/profile', 
  authenticateToken,
  validateUser(userValidation.updateProfile), 
  updateProfile
);

router.put('/change-password', 
  authenticateToken,
  validateUser(userValidation.changePassword), 
  changePassword
);

router.post('/logout', 
  authenticateToken, 
  logout
);

// Admin routes
router.get('/count', 
  authenticateToken, 
  authorizeRoles('admin'), 
  getUserCount
);

router.get('/all', 
  authenticateToken, 
  authorizeRoles('admin'),
  validateUserQuery,
  getAllUsers
);

router.get('/admin/users', 
  authenticateToken, 
  authorizeRoles('admin'), 
  getAllUsersAdmin
);

router.put('/admin/users/:userId/role', 
  authenticateToken, 
  authorizeRoles('admin'),
  validateUser(userValidation.updateUserRole), 
  updateUserRole
);

router.put('/admin/users/:userId/status', 
  authenticateToken, 
  authorizeRoles('admin'),
  validateUser(userValidation.updateUserStatus), 
  updateUserStatus
);

router.delete('/admin/users/:userId', 
  authenticateToken, 
  authorizeRoles('admin'), 
  deleteUser
);

module.exports = router;