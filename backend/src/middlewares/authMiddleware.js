const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.protect = async (req, res, next) => {
  try {
    console.log('=== AUTH MIDDLEWARE CALLED ===');
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token found:', token ? token.substring(0, 20) + '...' : 'None');
    }

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({
        success: false,
        message: 'Bu işlem için giriş yapmanız gerekmektedir'
      });
    }

    console.log('Attempting to verify token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', decoded);

    const user = await User.findById(decoded.id);
    console.log('User found:', user ? user.email : 'No user');

    if (!user) {
      console.log('User not found in database');
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Set consistent user object
    req.user = {
      id: user._id,
      userId: user._id, // Keep for backward compatibility
      name: user.name,
      email: user.email,
      role: user.role
    };

    console.log('Authentication successful, calling next()');
    next();
  } catch (error) {
    console.log('Auth middleware error:', error.message);
    res.status(401).json({
      success: false,
      message: 'Yetkilendirme hatası'
    });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için yetkiniz bulunmamaktadır'
      });
    }
    next();
  };
};
