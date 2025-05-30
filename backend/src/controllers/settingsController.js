const Settings = require('../models/settingsModel');
const ResponseHandler = require('../utils/responseHandler');
const { getSettingsByCategory, getPublicSettings } = require('../validations/settingsValidation');

// Get application settings
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne().select('-__v');
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    
    ResponseHandler.success(res, 'Ayarlar başarıyla getirildi', { settings });
  } catch (error) {
    ResponseHandler.error(res, 'Ayarları getirme hatası', error);
  }
};

// Update application settings (Admin only)
exports.updateSettings = async (req, res) => {
  try {
    const updateData = req.body;

    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings();
    }

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

    ResponseHandler.success(res, 'Ayarlar başarıyla güncellendi', { settings });
  } catch (error) {
    ResponseHandler.error(res, 'Ayarları güncelleme hatası', error);
  }
};

// Get public settings (for frontend consumption)
exports.getPublicSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne().select('-__v');
    
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }

    const publicSettings = getPublicSettings(settings.toObject());
    
    ResponseHandler.success(res, 'Genel ayarlar getirildi', { settings: publicSettings });
  } catch (error) {
    ResponseHandler.error(res, 'Genel ayarları getirme hatası', error);
  }
};

// Reset settings to defaults (Admin only)
exports.resetSettings = async (req, res) => {
  try {
    await Settings.deleteMany({});
    
    const defaultSettings = new Settings();
    await defaultSettings.save();
    
    ResponseHandler.success(res, 'Ayarlar varsayılan değerlere sıfırlandı', { settings: defaultSettings });
  } catch (error) {
    ResponseHandler.error(res, 'Ayarları sıfırlama hatası', error);
  }
};

// Get specific setting category
exports.getSettingsByCategory = async (req, res) => {
  try {
    const { category } = req.query;
    let settings = await Settings.findOne().select('-__v');
    
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }

    const categorySettings = getSettingsByCategory(settings.toObject(), category);
    
    ResponseHandler.success(res, `${category || 'Tüm'} ayarlar getirildi`, { 
      settings: categorySettings,
      category: category || 'all'
    });
  } catch (error) {
    ResponseHandler.error(res, 'Kategori ayarlarını getirme hatası', error);
  }
};
