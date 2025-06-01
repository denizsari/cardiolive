const BaseService = require('./BaseService');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { logger } = require('../utils/logger');

/**
 * User Service Class
 * Handles all user-related business logic
 * @class UserService
 * @extends BaseService
 */
class UserService extends BaseService {
  constructor() {
    super(User);
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.name - User's full name
   * @param {string} userData.email - User's email address
   * @param {string} userData.password - User's password
   * @param {string} [userData.phoneNumber] - User's phone number
   * @returns {Promise<Object>} Created user without password
   * @throws {Error} If email already exists or validation fails
   */
  async registerUser(userData) {
    const { name, email, password, phoneNumber } = userData;

    // Check if user already exists
    const existingUser = await this.findOne({ email });
    if (existingUser) {
      throw new Error('Bu e-posta adresi zaten kullanımda');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await this.create({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      role: 'user',
      isActive: true
    });

    logger.info('User registered successfully', { userId: user._id, email });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  /**
   * Authenticate user login
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object>} Authentication result with tokens
   * @throws {Error} If credentials are invalid
   */  async authenticateUser(email, password) {
    const user = await this.findOne({ email }, { select: '+password' });
    if (!user) {
      throw new Error('Geçersiz e-posta veya şifre');
    }

    if (!user.isActive) {
      throw new Error('Hesabınız deaktif durumda');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Geçersiz e-posta veya şifre');
    }

    // Generate tokens
    const tokens = this.generateTokens(user);

    // Update last login
    await this.updateById(user._id, { 
      lastLogin: new Date(),
      refreshToken: tokens.refreshToken
    });

    logger.info('User authenticated successfully', { userId: user._id, email });

    const { password: _, refreshToken: __, ...userWithoutSensitive } = user.toObject();
    
    return {
      user: userWithoutSensitive,
      ...tokens
    };
  }  /**
   * Generate JWT tokens for user
   * @param {Object} user - User document
   * @returns {Object} Access and refresh tokens
   * @private
   */
  generateTokens(user) {
    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion || 1
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { 
      expiresIn: '1h',
      issuer: 'cardiolive-api',
      audience: 'cardiolive-app'
    });

    const refreshToken = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_REFRESH_SECRET, 
      { 
        expiresIn: '7d',
        issuer: 'cardiolive-api',
        audience: 'cardiolive-app'
      }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Refresh user token
   * @param {string} refreshToken - Current refresh token
   * @returns {Promise<Object>} New tokens
   * @throws {Error} If refresh token is invalid
   */
  async refreshUserToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await this.findById(decoded.userId);

      if (!user || !user.isActive || user.refreshToken !== refreshToken) {
        throw new Error('Geçersiz refresh token');
      }

      const tokens = this.generateTokens(user);
      
      // Update refresh token in database
      await this.updateById(user._id, { refreshToken: tokens.refreshToken });

      logger.info('Token refreshed successfully', { userId: user._id });

      return tokens;
    } catch (error) {
      logger.error('Token refresh failed', { error: error.message });
      throw new Error('Token yenileme başarısız');
    }
  }

  /**
   * Logout user by invalidating refresh token
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async logoutUser(userId) {
    await this.updateById(userId, { refreshToken: null });
    logger.info('User logged out successfully', { userId });
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Profile update data
   * @returns {Promise<Object>} Updated user without password
   */
  async updateProfile(userId, updateData) {
    const allowedFields = ['name', 'phoneNumber', 'address', 'city', 'postalCode'];
    const filteredData = {};
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    const updatedUser = await this.updateById(userId, filteredData);
    if (!updatedUser) {
      throw new Error('Kullanıcı bulunamadı');
    }

    logger.info('User profile updated', { userId });

    const { password: _, refreshToken: __, ...userWithoutSensitive } = updatedUser.toObject();
    return userWithoutSensitive;
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   * @throws {Error} If current password is incorrect
   */  async changePassword(userId, currentPassword, newPassword) {
    const user = await this.findById(userId, { select: '+password' });
    if (!user) {
      throw new Error('Kullanıcı bulunamadı');
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      throw new Error('Mevcut şifre yanlış');
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await this.updateById(userId, { 
      password: hashedPassword,
      refreshToken: null // Invalidate all sessions
    });

    logger.info('User password changed', { userId });
  }

  /**
   * Get users with filtering and pagination (Admin only)
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated users list
   */
  async getUsers(filters = {}, options = {}) {
    const { search, role, isActive, startDate, endDate } = filters;
    
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const queryOptions = {
      ...options,
      select: '-password -refreshToken'
    };

    return await this.findAll(filter, queryOptions);
  }

  /**
   * Update user status (Admin only)
   * @param {string} userId - User ID
   * @param {boolean} isActive - Active status
   * @returns {Promise<Object>} Updated user
   */
  async updateUserStatus(userId, isActive) {
    const updatedUser = await this.updateById(userId, { isActive });
    if (!updatedUser) {
      throw new Error('Kullanıcı bulunamadı');
    }

    if (!isActive) {
      // Invalidate refresh token when deactivating
      await this.updateById(userId, { refreshToken: null });
    }

    logger.info('User status updated', { userId, isActive });

    const { password: _, refreshToken: __, ...userWithoutSensitive } = updatedUser.toObject();
    return userWithoutSensitive;
  }

  /**
   * Get user statistics
   * @returns {Promise<Object>} User statistics
   */
  async getUserStats() {
    const stats = await this.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
          inactiveUsers: { $sum: { $cond: ['$isActive', 0, 1] } },
          adminUsers: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
          regularUsers: { $sum: { $cond: [{ $eq: ['$role', 'user'] }, 1, 0] } }
        }
      }
    ]);

    return stats[0] || {
      totalUsers: 0,
      activeUsers: 0,
      inactiveUsers: 0,
      adminUsers: 0,
      regularUsers: 0
    };
  }

  /**
   * Initiate password reset process
   * @param {string} email - User email
   * @returns {Promise<void>}
   */
  async forgotPassword(email) {
    const user = await this.findOne({ email });
    if (!user) {
      throw new Error('Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı');
    }

    // Generate reset token (in a real implementation, this would be stored and sent via email)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.updateById(user._id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetTokenExpiry
    });

    logger.info('Password reset token generated', { userId: user._id, email });

    // In a real implementation, send email here
    // await emailService.sendPasswordResetEmail(email, resetToken);
  }

  /**
   * Reset user password using token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  async resetPassword(token, newPassword) {
    const user = await this.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      throw new Error('Geçersiz veya süresi dolmuş token');
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await this.updateById(user._id, {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
      refreshToken: null // Logout user from all devices
    });

    logger.info('Password reset completed', { userId: user._id });
  }

  /**
   * Update user role (Admin only)
   * @param {string} userId - User ID
   * @param {string} role - New role
   * @returns {Promise<Object>} Updated user
   */
  async updateUserRole(userId, role) {
    const updatedUser = await this.updateById(userId, { role });
    if (!updatedUser) {
      throw new Error('Kullanıcı bulunamadı');
    }

    logger.info('User role updated', { userId, role });

    const { password: _, refreshToken: __, ...userWithoutSensitive } = updatedUser.toObject();
    return userWithoutSensitive;
  }

  /**
   * Delete user (Admin only)
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteUser(userId) {
    const deleted = await this.deleteById(userId);
    if (deleted) {
      logger.info('User deleted', { userId });
    }
    return deleted;
  }
}

module.exports = new UserService();
