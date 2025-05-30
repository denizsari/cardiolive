const User = require('../models/userModel');
const ResponseHandler = require('../utils/responseHandler');
const { generateTokenPair, hashPassword, comparePassword, generateSecureToken } = require('../middlewares/auth');
const rateLimiter = require('../middlewares/rateLimiter');

// Kullanıcı Kaydı
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Email kontrolü
    const userExists = await User.findOne({ email });
    if (userExists) {
      return ResponseHandler.badRequest(res, 'Bu email adresi zaten kayıtlı');
    }

    // Şifreyi hash'le
    const hashedPassword = await hashPassword(password);

    // Yeni kullanıcı oluşturma
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phoneNumber: phone,
      tokenVersion: 1
    });

    // Token çifti oluştur
    const tokens = generateTokenPair(user);

    // Kullanıcı bilgilerini temizle
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      isActive: user.isActive,
      createdAt: user.createdAt
    };

    ResponseHandler.created(res, 'Kullanıcı başarıyla kaydedildi', {
      user: userResponse,
      ...tokens
    });
  } catch (error) {
    ResponseHandler.error(res, 'Kullanıcı kayıt hatası', error);
  }
};

// Kullanıcı Girişi
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kullanıcı kontrolü (şifre ile birlikte)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return ResponseHandler.unauthorized(res, 'Geçersiz email veya şifre');
    }

    // Kullanıcı aktif mi kontrolü
    if (!user.isActive) {
      return ResponseHandler.forbidden(res, 'Hesabınız deaktive edilmiştir');
    }

    // Şifre kontrolü
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return ResponseHandler.unauthorized(res, 'Geçersiz email veya şifre');
    }

    // Token çifti oluştur
    const tokens = generateTokenPair(user);

    // Kullanıcı bilgilerini temizle
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      isActive: user.isActive
    };

    ResponseHandler.success(res, 'Giriş başarılı', {
      user: userResponse,
      ...tokens
    });
  } catch (error) {
    ResponseHandler.error(res, 'Giriş hatası', error);
  }
};

// Kullanıcı Bilgileri
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return ResponseHandler.notFound(res, 'Kullanıcı bulunamadı');
    }

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      address: user.address,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    ResponseHandler.success(res, 'Kullanıcı bilgileri getirildi', { user: userResponse });
  } catch (error) {
    ResponseHandler.error(res, 'Kullanıcı bilgisi getirme hatası', error);
  }
};

// Profil Güncelleme
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phoneNumber, address } = req.body;
    const userId = req.user.userId;

    // Email unique kontrolü (eğer email değiştiriliyorsa)
    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: userId }
      });

      if (existingUser) {
        return ResponseHandler.badRequest(res, 'Bu email adresi başka bir kullanıcı tarafından kullanılıyor');
      }
    }

    // Kullanıcı bilgilerini güncelle
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(name && { name }),
        ...(email && { email }),
        ...(phoneNumber !== undefined && { phoneNumber }),
        ...(address !== undefined && { address })
      },
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!updatedUser) {
      return ResponseHandler.notFound(res, 'Kullanıcı bulunamadı');
    }

    const userResponse = {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phoneNumber: updatedUser.phoneNumber,
      address: updatedUser.address,
      isActive: updatedUser.isActive,
      updatedAt: updatedUser.updatedAt
    };

    ResponseHandler.success(res, 'Profil başarıyla güncellendi', { user: userResponse });
  } catch (error) {
    ResponseHandler.error(res, 'Profil güncelleme hatası', error);
  }
};

// Kullanıcı Sayısı (Admin)
exports.getUserCount = async (req, res) => {
  try {
    const count = await User.countDocuments();
    ResponseHandler.success(res, 'Kullanıcı sayısı getirildi', { count });
  } catch (error) {
    ResponseHandler.error(res, 'Kullanıcı sayısı getirme hatası', error);
  }
};

// Tüm Kullanıcıları Getir (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const { page, limit, sort, order, role, isActive, search } = req.query;
    
    // Build filter object
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build sort object
    const sortObj = { [sort]: order === 'asc' ? 1 : -1 };

    // Get users with pagination
    const users = await User.find(filter)
      .select('-password')
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    };

    ResponseHandler.success(res, 'Kullanıcılar başarıyla getirildi', {
      users,
      pagination
    });
  } catch (error) {
    ResponseHandler.error(res, 'Kullanıcıları getirme hatası', error);
  }
};

// Admin endpoint to get all users
exports.getAllUsersAdmin = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    ResponseHandler.success(res, 'Kullanıcılar başarıyla getirildi', { users });
  } catch (error) {
    ResponseHandler.error(res, 'Kullanıcıları getirme hatası', error);
  }
};

// Admin endpoint to update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { role, tokenVersion: (await User.findById(userId)).tokenVersion + 1 }, // Invalidate tokens
      { new: true }
    ).select('-password');

    if (!user) {
      return ResponseHandler.notFound(res, 'Kullanıcı bulunamadı');
    }

    ResponseHandler.success(res, 'Kullanıcı rolü başarıyla güncellendi', { user });
  } catch (error) {
    ResponseHandler.error(res, 'Kullanıcı rolü güncelleme hatası', error);
  }
};

// Admin endpoint to update user status
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        isActive,
        tokenVersion: isActive ? (await User.findById(userId)).tokenVersion : 
                      (await User.findById(userId)).tokenVersion + 1 // Invalidate tokens if deactivating
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return ResponseHandler.notFound(res, 'Kullanıcı bulunamadı');
    }

    ResponseHandler.success(res, 'Kullanıcı durumu başarıyla güncellendi', { user });
  } catch (error) {
    ResponseHandler.error(res, 'Kullanıcı durumu güncelleme hatası', error);
  }
};

// Admin endpoint to delete user
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (userId === req.user.userId) {
      return ResponseHandler.badRequest(res, 'Kendi hesabınızı silemezsiniz');
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return ResponseHandler.notFound(res, 'Kullanıcı bulunamadı');
    }

    ResponseHandler.success(res, 'Kullanıcı başarıyla silindi');
  } catch (error) {
    ResponseHandler.error(res, 'Kullanıcı silme hatası', error);
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not for security
      return ResponseHandler.success(res, 'Eğer email kayıtlı ise, şifre sıfırlama linki gönderilmiştir');
    }

    // Generate reset token
    const resetToken = generateSecureToken();
    const resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Save reset token to user
    user.passwordResetToken = resetToken;
    user.passwordResetExpiry = resetTokenExpiry;
    await user.save();

    // In production, send email with reset link
    // For now, just return success message
    console.log(`Password reset token for ${email}: ${resetToken}`);

    ResponseHandler.success(res, 'Şifre sıfırlama linki email adresinize gönderilmiştir');
  } catch (error) {
    ResponseHandler.error(res, 'Şifre sıfırlama hatası', error);
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return ResponseHandler.badRequest(res, 'Geçersiz veya süresi dolmuş token');
    }

    // Update password and clear reset token
    const hashedPassword = await hashPassword(password);
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    user.tokenVersion = (user.tokenVersion || 1) + 1; // Invalidate existing tokens
    await user.save();

    ResponseHandler.success(res, 'Şifre başarıyla sıfırlandı');
  } catch (error) {
    ResponseHandler.error(res, 'Şifre sıfırlama hatası', error);
  }
};

// Şifre Değiştirme
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    // Get user with password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return ResponseHandler.notFound(res, 'Kullanıcı bulunamadı');
    }

    // Check current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return ResponseHandler.badRequest(res, 'Mevcut şifre yanlış');
    }

    // Check if new password is different from current
    const isSamePassword = await comparePassword(newPassword, user.password);
    if (isSamePassword) {
      return ResponseHandler.badRequest(res, 'Yeni şifre mevcut şifreden farklı olmalıdır');
    }

    // Hash and update password
    const hashedNewPassword = await hashPassword(newPassword);
    user.password = hashedNewPassword;
    user.tokenVersion = (user.tokenVersion || 1) + 1; // Invalidate existing tokens
    await user.save();

    ResponseHandler.success(res, 'Şifre başarıyla değiştirildi');
  } catch (error) {
    ResponseHandler.error(res, 'Şifre değiştirme hatası', error);
  }
};