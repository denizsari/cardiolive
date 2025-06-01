/**
 * @fileoverview Settings Service - Business logic for application settings management
 * @description Handles settings operations, validation, and category filtering
 * @author Cardiolive E-commerce Platform
 * @version 1.0.0
 */

const BaseService = require('./BaseService');
const Settings = require('../models/settingsModel');
const { getSettingsByCategory, getPublicSettings } = require('../validations/settingsValidation');
const logger = require('../utils/logger');

/**
 * Settings Service Class
 * Manages application settings operations
 * @extends BaseService
 */
class SettingsService extends BaseService {
  /**
   * Create SettingsService instance
   */
  constructor() {
    super(Settings);
  }

  /**
   * Get application settings with logging
   * @returns {Promise<Object>} Settings object
   * @throws {Error} If settings retrieval fails
   */
  async getSettings() {
    try {
      logger.logEvent('business', 'settings_fetch_initiated', {
        service: 'SettingsService',
        method: 'getSettings'
      });

      let settings = await Settings.findOne().select('-__v');
      
      // If no settings exist, create default settings
      if (!settings) {
        logger.logEvent('business', 'default_settings_creation', {
          service: 'SettingsService',
          reason: 'no_existing_settings'
        });

        settings = new Settings();
        await settings.save();

        logger.logEvent('business', 'default_settings_created', {
          service: 'SettingsService',
          settingsId: settings._id
        });
      }

      logger.logEvent('business', 'settings_fetched', {
        service: 'SettingsService',
        settingsId: settings._id,
        hasDefaults: !settings.createdAt
      });

      return settings;
    } catch (error) {
      logger.logEvent('error', 'settings_fetch_failed', {
        service: 'SettingsService',
        method: 'getSettings',
        error: error.message,
        stack: error.stack
      });
      throw new Error(`Failed to retrieve settings: ${error.message}`);
    }
  }

  /**
   * Update application settings with validation and logging
   * @param {Object} updateData - Settings update data
   * @returns {Promise<Object>} Updated settings object
   * @throws {Error} If settings update fails
   */
  async updateSettings(updateData) {
    try {
      logger.logEvent('business', 'settings_update_initiated', {
        service: 'SettingsService',
        method: 'updateSettings',
        updateFields: Object.keys(updateData)
      });

      let settings = await Settings.findOne();
      
      if (!settings) {
        logger.logEvent('business', 'settings_creation_on_update', {
          service: 'SettingsService',
          reason: 'no_existing_settings'
        });

        settings = new Settings();
      }

      // Track original values for audit logging
      const originalValues = {};
      Object.keys(updateData).forEach(key => {
        originalValues[key] = settings[key];
      });

      // Update only provided fields using Object.assign for nested objects
      Object.keys(updateData).forEach(key => {
        if (typeof updateData[key] === 'object' && updateData[key] !== null && !Array.isArray(updateData[key])) {
          // Handle nested objects
          if (settings[key]) {
            settings[key] = { ...settings[key], ...updateData[key] };
          } else {
            settings[key] = updateData[key];
          }
        } else {
          // Handle primitive values
          settings[key] = updateData[key];
        }
      });

      settings.updatedAt = new Date();
      await settings.save();

      logger.logEvent('business', 'settings_updated', {
        service: 'SettingsService',
        settingsId: settings._id,
        updatedFields: Object.keys(updateData),
        originalValues,
        newValues: updateData
      });

      return settings;
    } catch (error) {
      logger.logEvent('error', 'settings_update_failed', {
        service: 'SettingsService',
        method: 'updateSettings',
        updateFields: Object.keys(updateData),
        error: error.message,
        stack: error.stack
      });
      throw new Error(`Failed to update settings: ${error.message}`);
    }
  }

  /**
   * Get public settings (filtered for frontend consumption)
   * @returns {Promise<Object>} Public settings object
   * @throws {Error} If public settings retrieval fails
   */
  async getPublicSettings() {
    try {
      logger.logEvent('business', 'public_settings_fetch_initiated', {
        service: 'SettingsService',
        method: 'getPublicSettings'
      });

      let settings = await Settings.findOne().select('-__v');
      
      if (!settings) {
        logger.logEvent('business', 'default_settings_creation_for_public', {
          service: 'SettingsService',
          reason: 'no_existing_settings'
        });

        settings = new Settings();
        await settings.save();
      }

      const publicSettings = getPublicSettings(settings.toObject());

      logger.logEvent('business', 'public_settings_fetched', {
        service: 'SettingsService',
        settingsId: settings._id,
        publicFieldCount: Object.keys(publicSettings).length
      });

      return publicSettings;
    } catch (error) {
      logger.logEvent('error', 'public_settings_fetch_failed', {
        service: 'SettingsService',
        method: 'getPublicSettings',
        error: error.message,
        stack: error.stack
      });
      throw new Error(`Failed to retrieve public settings: ${error.message}`);
    }
  }

  /**
   * Reset settings to defaults with security logging
   * @returns {Promise<Object>} Default settings object
   * @throws {Error} If settings reset fails
   */
  async resetSettings() {
    try {
      logger.logEvent('security', 'settings_reset_initiated', {
        service: 'SettingsService',
        method: 'resetSettings',
        action: 'admin_settings_reset'
      });

      // Get current settings for audit trail
      const currentSettings = await Settings.findOne();
      const currentSettingsData = currentSettings ? currentSettings.toObject() : null;

      // Delete all settings
      await Settings.deleteMany({});
      
      // Create new default settings
      const defaultSettings = new Settings();
      await defaultSettings.save();

      logger.logEvent('security', 'settings_reset_completed', {
        service: 'SettingsService',
        action: 'admin_settings_reset',
        previousSettingsId: currentSettings?._id,
        newSettingsId: defaultSettings._id,
        previousData: currentSettingsData
      });

      return defaultSettings;
    } catch (error) {
      logger.logEvent('error', 'settings_reset_failed', {
        service: 'SettingsService',
        method: 'resetSettings',
        error: error.message,
        stack: error.stack
      });
      throw new Error(`Failed to reset settings: ${error.message}`);
    }
  }

  /**
   * Get settings by category with validation
   * @param {string} category - Settings category to filter
   * @returns {Promise<Object>} Category-specific settings
   * @throws {Error} If category settings retrieval fails
   */
  async getSettingsByCategory(category) {
    try {
      logger.logEvent('business', 'category_settings_fetch_initiated', {
        service: 'SettingsService',
        method: 'getSettingsByCategory',
        category: category || 'all'
      });

      let settings = await Settings.findOne().select('-__v');
      
      if (!settings) {
        logger.logEvent('business', 'default_settings_creation_for_category', {
          service: 'SettingsService',
          reason: 'no_existing_settings',
          category: category || 'all'
        });

        settings = new Settings();
        await settings.save();
      }

      const categorySettings = getSettingsByCategory(settings.toObject(), category);

      logger.logEvent('business', 'category_settings_fetched', {
        service: 'SettingsService',
        settingsId: settings._id,
        category: category || 'all',
        fieldCount: Object.keys(categorySettings).length
      });

      return {
        settings: categorySettings,
        category: category || 'all'
      };
    } catch (error) {
      logger.logEvent('error', 'category_settings_fetch_failed', {
        service: 'SettingsService',
        method: 'getSettingsByCategory',
        category: category || 'all',
        error: error.message,
        stack: error.stack
      });
      throw new Error(`Failed to retrieve category settings: ${error.message}`);
    }
  }

  /**
   * Validate settings structure and configuration
   * @param {Object} settings - Settings object to validate
   * @returns {Promise<Object>} Validation result
   * @throws {Error} If validation fails
   */
  async validateSettings(settings) {
    try {
      logger.logEvent('business', 'settings_validation_initiated', {
        service: 'SettingsService',
        method: 'validateSettings'
      });

      const validation = {
        valid: true,
        errors: [],
        warnings: []
      };

      // Check critical configuration
      if (!settings.siteName || settings.siteName.trim().length === 0) {
        validation.errors.push('Site name is required');
        validation.valid = false;
      }

      if (!settings.siteEmail || !settings.siteEmail.includes('@')) {
        validation.errors.push('Valid site email is required');
        validation.valid = false;
      }

      // Check business logic consistency
      if (settings.lowStockThreshold <= settings.criticalStockThreshold) {
        validation.warnings.push('Low stock threshold should be higher than critical stock threshold');
      }

      if (settings.freeShippingThreshold < settings.shippingFee) {
        validation.warnings.push('Free shipping threshold is lower than shipping fee');
      }

      logger.logEvent('business', 'settings_validated', {
        service: 'SettingsService',
        valid: validation.valid,
        errorCount: validation.errors.length,
        warningCount: validation.warnings.length
      });

      return validation;
    } catch (error) {
      logger.logEvent('error', 'settings_validation_failed', {
        service: 'SettingsService',
        method: 'validateSettings',
        error: error.message,
        stack: error.stack
      });
      throw new Error(`Failed to validate settings: ${error.message}`);
    }
  }
}

module.exports = SettingsService;
