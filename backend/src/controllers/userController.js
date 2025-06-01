const UserService = require('../services/UserService');
const ResponseHandler = require('../utils/responseHandler');
const { logger } = require('../utils/logger');

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
exports.register = async (req, res) => {  try {
    const { name, email, password, phone } = req.body;

    const result = await UserService.registerUser({ name, email, password, phoneNumber: phone });

    logger.logAuthEvent('user_registered', { userId: result?._id, email, userAgent: req.headers['user-agent'] });

    ResponseHandler.created(res, 'Kullanıcı başarıyla kaydedildi', { user: result });  } catch (error) {
    logger.error('User registration error:', { 
      email: req.body?.email, 
      error: error.message, 
      stack: error.stack 
    });
    
    if (error.message === 'Bu e-posta adresi zaten kullanımda') {
      return ResponseHandler.badRequest(res, error.message);
    }
    ResponseHandler.error(res, 'Kullanıcı kayıt hatası', 500, error);
  }
};

/**
 * @desc Login user
 * @route POST /api/auth/login
 * @access Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await UserService.authenticateUser(email, password);    logger.logAuthEvent('user_login', { 
      userId: result.user._id, 
      email, 
      userAgent: req.headers['user-agent'],
      ip: req.ip 
    });

    ResponseHandler.success(res, 'Giriş başarılı', result);
  } catch (error) {
    logger.logAuthEvent('login_failed', { 
      email: req.body?.email, 
      reason: error.message,
      userAgent: req.headers['user-agent'],
      ip: req.ip 
    });
      if (error.message === 'Geçersiz e-posta veya şifre' || 
        error.message === 'Hesabınız deaktif durumda') {
      return ResponseHandler.unauthorized(res, error.message);
    }
    ResponseHandler.error(res, 'Giriş hatası', error);
  }
};

/**
 * @desc Get current user profile
 * @route GET /api/users/me
 * @access Private
 */
exports.getMe = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await UserService.findById(userId);

    if (!user) {
      return ResponseHandler.notFound(res, 'Kullanıcı bulunamadı');
    }

    ResponseHandler.success(res, 'Kullanıcı bilgileri getirildi', { user });
  } catch (error) {
    logger.error('Error getting user profile:', { userId: req.user?.userId, error: error.message });
    ResponseHandler.error(res, 'Kullanıcı bilgisi getirme hatası', error);
  }
};

/**
 * @desc Update user profile
 * @route PUT /api/users/profile
 * @access Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phoneNumber, address } = req.body;
    const userId = req.user.userId;

    const updatedUser = await UserService.updateProfile(userId, { name, email, phoneNumber, address });

    logger.logBusinessEvent('profile_updated', { userId, updatedFields: Object.keys(req.body) });

    ResponseHandler.success(res, 'Profil başarıyla güncellendi', { user: updatedUser });
  } catch (error) {
    logger.error('Profile update error:', { userId: req.user?.userId, error: error.message });
    
    if (error.message === 'Bu email adresi başka bir kullanıcı tarafından kullanılıyor') {
      return ResponseHandler.badRequest(res, error.message);
    }
    ResponseHandler.error(res, 'Profil güncelleme hatası', error);
  }
};

/**
 * @desc Change user password
 * @route PUT /api/users/change-password
 * @access Private
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    await UserService.changePassword(userId, currentPassword, newPassword);

    logger.logSecurityEvent('password_changed', { userId });

    ResponseHandler.success(res, 'Şifre başarıyla değiştirildi');
  } catch (error) {
    logger.error('Password change error:', { userId: req.user?.userId, error: error.message });
    
    if (error.message === 'Mevcut şifre yanlış' || 
        error.message === 'Yeni şifre mevcut şifreden farklı olmalıdır') {
      return ResponseHandler.badRequest(res, error.message);
    }
    ResponseHandler.error(res, 'Şifre değiştirme hatası', error);
  }
};

/**
 * @desc Forgot password
 * @route POST /api/auth/forgot-password
 * @access Public
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    await UserService.forgotPassword(email);

    logger.logSecurityEvent('password_reset_requested', { email });

    ResponseHandler.success(res, 'Şifre sıfırlama linki email adresinize gönderilmiştir');
  } catch (error) {
    logger.error('Forgot password error:', { email: req.body?.email, error: error.message });
    ResponseHandler.error(res, 'Şifre sıfırlama hatası', error);
  }
};

/**
 * @desc Reset password
 * @route POST /api/auth/reset-password
 * @access Public
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    await UserService.resetPassword(token, password);

    logger.logSecurityEvent('password_reset_completed', { token: token.substring(0, 8) + '...' });

    ResponseHandler.success(res, 'Şifre başarıyla sıfırlandı');
  } catch (error) {
    logger.error('Reset password error:', { error: error.message });
    
    if (error.message === 'Geçersiz veya süresi dolmuş token') {
      return ResponseHandler.badRequest(res, error.message);
    }
    ResponseHandler.error(res, 'Şifre sıfırlama hatası', error);
  }
};

/**
 * @desc Get user count (Admin)
 * @route GET /api/admin/users/count
 * @access Private/Admin
 */
exports.getUserCount = async (req, res) => {
  try {
    const stats = await UserService.getUserStats();
    const count = stats.totalUsers || 0;
    ResponseHandler.success(res, 'Kullanıcı sayısı getirildi', { count });
  } catch (error) {
    logger.error('Error getting user count:', { adminId: req.user?.userId, error: error.message });
    ResponseHandler.error(res, 'Kullanıcı sayısı getirme hatası', error);
  }
};

/**
 * @desc Get all users with pagination (Admin)
 * @route GET /api/admin/users
 * @access Private/Admin
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', role, isActive, search } = req.query;
    
    const filters = { role, isActive, search };
    const options = {
      page: Number(page),
      limit: Number(limit),
      sortBy: sort,
      sortOrder: order
    };

    const result = await UserService.getUsers(filters, options);

    logger.logBusinessEvent('admin_users_list_viewed', { 
      adminId: req.user.userId, 
      userCount: result.data.length,
      filters,
      options 
    });

    ResponseHandler.success(res, 'Kullanıcılar başarıyla getirildi', {
      users: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    logger.error('Error getting all users:', { adminId: req.user?.userId, error: error.message });
    ResponseHandler.error(res, 'Kullanıcıları getirme hatası', error);
  }
};

/**
 * @desc Get all users without pagination (Admin)
 * @route GET /api/admin/users/all
 * @access Private/Admin
 */
exports.getAllUsersAdmin = async (req, res) => {
  try {
    const result = await UserService.getUsers({}, { limit: 0 }); // No pagination
    
    ResponseHandler.success(res, 'Kullanıcılar başarıyla getirildi', { users: result.data });
  } catch (error) {
    logger.error('Error getting all users admin:', { adminId: req.user?.userId, error: error.message });
    ResponseHandler.error(res, 'Kullanıcıları getirme hatası', error);
  }
};

/**
 * @desc Update user role (Admin)
 * @route PUT /api/admin/users/:userId/role
 * @access Private/Admin
 */
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const user = await UserService.updateUserRole(userId, role);

    logger.logSecurityEvent('user_role_updated', { 
      adminId: req.user.userId, 
      targetUserId: userId, 
      newRole: role 
    });

    ResponseHandler.success(res, 'Kullanıcı rolü başarıyla güncellendi', { user });
  } catch (error) {
    logger.error('Error updating user role:', { adminId: req.user?.userId, targetUserId: req.params?.userId, error: error.message });
    
    if (error.message === 'Kullanıcı bulunamadı') {
      return ResponseHandler.notFound(res, error.message);
    }
    ResponseHandler.error(res, 'Kullanıcı rolü güncelleme hatası', error);
  }
};

/**
 * @desc Update user status (Admin)
 * @route PUT /api/admin/users/:userId/status
 * @access Private/Admin
 */
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await UserService.updateUserStatus(userId, isActive);

    logger.logSecurityEvent('user_status_updated', { 
      adminId: req.user.userId, 
      targetUserId: userId, 
      newStatus: isActive 
    });

    ResponseHandler.success(res, 'Kullanıcı durumu başarıyla güncellendi', { user });
  } catch (error) {
    logger.error('Error updating user status:', { adminId: req.user?.userId, targetUserId: req.params?.userId, error: error.message });
    
    if (error.message === 'Kullanıcı bulunamadı') {
      return ResponseHandler.notFound(res, error.message);
    }
    ResponseHandler.error(res, 'Kullanıcı durumu güncelleme hatası', error);
  }
};

/**
 * @desc Delete user (Admin)
 * @route DELETE /api/admin/users/:userId
 * @access Private/Admin
 */
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user.userId;

    // Prevent admin from deleting themselves
    if (userId === adminId) {
      return ResponseHandler.badRequest(res, 'Kendi hesabınızı silemezsiniz');
    }

    const deleted = await UserService.deleteUser(userId);

    if (!deleted) {
      return ResponseHandler.notFound(res, 'Kullanıcı bulunamadı');
    }

    logger.logSecurityEvent('user_deleted', { adminId, deletedUserId: userId });

    ResponseHandler.success(res, 'Kullanıcı başarıyla silindi');
  } catch (error) {
    logger.error('Error deleting user:', { adminId: req.user?.userId, targetUserId: req.params?.userId, error: error.message });
    ResponseHandler.error(res, 'Kullanıcı silme hatası', error);
  }
};