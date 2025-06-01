/**
 * @fileoverview Settings Controller - Handles application settings management
 * @description Manages application configuration, security settings, and business preferences
 * @author Cardiolive E-commerce Platform
 * @version 1.0.0
 */

const SettingsService = require('../services/SettingsService');
const ResponseHandler = require('../utils/responseHandler');
const { logger } = require('../utils/logger');

// Initialize service
const settingsService = new SettingsService();

/**
 * Get application settings
 * @route GET /api/settings
 * @access Private (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with settings
 */
exports.getSettings = async (req, res) => {
  try {
    logger.logEvent('business', 'settings_fetch_request', {
      adminId: req.user?.userId,
      requestId: req.id
    });

    const settings = await settingsService.getSettings();

    logger.logEvent('business', 'settings_fetched_successfully', {
      adminId: req.user?.userId,
      settingsId: settings._id,
      requestId: req.id
    });

    ResponseHandler.success(res, 'Ayarlar başarıyla getirildi', { settings });
  } catch (error) {
    logger.logEvent('error', 'settings_fetch_failed', {
      adminId: req.user?.userId,
      error: error.message,
      stack: error.stack,
      requestId: req.id
    });

    ResponseHandler.error(res, 'Ayarları getirme hatası', error);
  }
};

/**
 * Update application settings
 * @route PUT /api/settings
 * @access Private (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated settings
 */
exports.updateSettings = async (req, res) => {
  try {
    const updateData = req.body;

    logger.logEvent('security', 'settings_update_request', {
      adminId: req.user?.userId,
      updateFields: Object.keys(updateData),
      requestId: req.id
    });

    const settings = await settingsService.updateSettings(updateData);

    logger.logEvent('security', 'settings_updated_successfully', {
      adminId: req.user?.userId,
      settingsId: settings._id,
      updatedFields: Object.keys(updateData),
      requestId: req.id
    });

    ResponseHandler.success(res, 'Ayarlar başarıyla güncellendi', { settings });
  } catch (error) {
    logger.logEvent('error', 'settings_update_failed', {
      adminId: req.user?.userId,
      updateFields: Object.keys(req.body),
      error: error.message,
      stack: error.stack,
      requestId: req.id
    });

    ResponseHandler.error(res, 'Ayarları güncelleme hatası', error);
  }
};

/**
 * Get public settings for frontend consumption
 * @route GET /api/settings/public
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with public settings
 */
exports.getPublicSettings = async (req, res) => {
  try {
    logger.logEvent('business', 'public_settings_fetch_request', {
      requestId: req.id,
      userAgent: req.get('User-Agent')
    });

    const publicSettings = await settingsService.getPublicSettings();

    logger.logEvent('business', 'public_settings_fetched_successfully', {
      fieldCount: Object.keys(publicSettings).length,
      requestId: req.id
    });

    ResponseHandler.success(res, 'Genel ayarlar getirildi', { settings: publicSettings });
  } catch (error) {
    logger.logEvent('error', 'public_settings_fetch_failed', {
      error: error.message,
      stack: error.stack,
      requestId: req.id
    });

    ResponseHandler.error(res, 'Genel ayarları getirme hatası', error);
  }
};

/**
 * Reset settings to defaults
 * @route POST /api/settings/reset
 * @access Private (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with default settings
 */
exports.resetSettings = async (req, res) => {
  try {
    logger.logEvent('security', 'settings_reset_request', {
      adminId: req.user?.userId,
      requestId: req.id,
      action: 'admin_settings_reset'
    });

    const defaultSettings = await settingsService.resetSettings();

    logger.logEvent('security', 'settings_reset_completed', {
      adminId: req.user?.userId,
      newSettingsId: defaultSettings._id,
      requestId: req.id,
      action: 'admin_settings_reset'
    });

    ResponseHandler.success(res, 'Ayarlar varsayılan değerlere sıfırlandı', { settings: defaultSettings });
  } catch (error) {
    logger.logEvent('error', 'settings_reset_failed', {
      adminId: req.user?.userId,
      error: error.message,
      stack: error.stack,
      requestId: req.id
    });

    ResponseHandler.error(res, 'Ayarları sıfırlama hatası', error);
  }
};

/**
 * Get settings by specific category
 * @route GET /api/settings/category
 * @access Private (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with category-specific settings
 */
exports.getSettingsByCategory = async (req, res) => {
  try {
    const { category } = req.query;

    logger.logEvent('business', 'category_settings_fetch_request', {
      adminId: req.user?.userId,
      category: category || 'all',
      requestId: req.id
    });

    const result = await settingsService.getSettingsByCategory(category);

    logger.logEvent('business', 'category_settings_fetched_successfully', {
      adminId: req.user?.userId,
      category: result.category,
      fieldCount: Object.keys(result.settings).length,
      requestId: req.id
    });

    ResponseHandler.success(res, `${category || 'Tüm'} ayarlar getirildi`, result);
  } catch (error) {
    logger.logEvent('error', 'category_settings_fetch_failed', {
      adminId: req.user?.userId,
      category: req.query.category || 'all',
      error: error.message,
      stack: error.stack,
      requestId: req.id
    });

    ResponseHandler.error(res, 'Kategori ayarlarını getirme hatası', error);
  }
};
