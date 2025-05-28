const express = require('express');
const router = express.Router();
const { register, login, getMe, getUserCount, getAllUsers, getAllUsersAdmin, updateUserRole, updateUserStatus, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// Admin routes
router.get('/count', protect, authorize('admin'), getUserCount);
router.get('/all', protect, authorize('admin'), getAllUsers);
router.get('/admin/users', protect, authorize('admin'), getAllUsersAdmin);
router.put('/admin/users/:userId/role', protect, authorize('admin'), updateUserRole);
router.put('/admin/users/:userId/status', protect, authorize('admin'), updateUserStatus);
router.delete('/admin/users/:userId', protect, authorize('admin'), deleteUser);

module.exports = router;