const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const ResponseHandler = require('../utils/responseHandler');

// JWT Configuration
const JWT_CONFIG = {
  access: {
    secret: process.env.JWT_SECRET || 'your-super-secret-access-key',
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m'
  },
  refresh: {
    secret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key',
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  }
};

// Token blacklist (in production, use Redis or database)
const tokenBlacklist = new Set();

// Generate access token
const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_CONFIG.access.secret, {
    expiresIn: JWT_CONFIG.access.expiresIn,
    issuer: 'cardiolive-api',
    audience: 'cardiolive-app'
  });
};

// Generate refresh token
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_CONFIG.refresh.secret, {
    expiresIn: JWT_CONFIG.refresh.expiresIn,
    issuer: 'cardiolive-api',
    audience: 'cardiolive-app'
  });
};

// Generate token pair
const generateTokenPair = (user) => {
  const payload = {
    userId: user.id || user._id,
    email: user.email,
    role: user.role || 'user',
    tokenVersion: user.tokenVersion || 1
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return { accessToken, refreshToken };
};

// Verify access token
const verifyAccessToken = (token) => {
  try {
    if (tokenBlacklist.has(token)) {
      throw new Error('Token has been revoked');
    }
    
    return jwt.verify(token, JWT_CONFIG.access.secret, {
      issuer: 'cardiolive-api',
      audience: 'cardiolive-app'
    });
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    if (tokenBlacklist.has(token)) {
      throw new Error('Token has been revoked');
    }
    
    return jwt.verify(token, JWT_CONFIG.refresh.secret, {
      issuer: 'cardiolive-api',
      audience: 'cardiolive-app'
    });
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

// Revoke token (add to blacklist)
const revokeToken = (token) => {
  tokenBlacklist.add(token);
};

// Clear expired tokens from blacklist (should be run periodically)
const clearExpiredTokens = () => {
  // In production, this should be handled by Redis TTL or database cleanup
  // For now, we'll keep it simple
  tokenBlacklist.clear();
};

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    console.log('🔍 AUTH - Authentication middleware called');
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      console.log('❌ AUTH - No token provided');
      return ResponseHandler.unauthorized(res, 'Access token required');
    }

    console.log('✅ AUTH - Token found, verifying...');
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    req.token = token;
    console.log('✅ AUTH - Token verified, user:', decoded.email);
    next();
  } catch (error) {
    console.log('❌ AUTH - Token verification failed:', error.message);
    return ResponseHandler.unauthorized(res, error.message);
  }
};

// Authorization middleware factory
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ResponseHandler.unauthorized(res, 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      return ResponseHandler.forbidden(res, 'Insufficient permissions');
    }

    next();
  };
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
      req.token = token;
    }
    
    next();
  } catch (error) {
    // Don't fail, just continue without user context
    next();
  }
};

// Password hashing utilities
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Generate secure random token
const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Token refresh endpoint logic
const refreshTokens = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return ResponseHandler.badRequest(res, 'Refresh token required');
    }

    const decoded = verifyRefreshToken(refreshToken);
    
    // Here you would typically fetch the user from database to verify token version
    // For now, we'll assume the token is valid
    
    // Generate new token pair
    const tokens = generateTokenPair({
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      tokenVersion: decoded.tokenVersion
    });

    // Revoke old refresh token
    revokeToken(refreshToken);

    ResponseHandler.success(res, 'Tokens refreshed successfully', tokens);
  } catch (error) {
    ResponseHandler.unauthorized(res, error.message);
  }
};

// Logout endpoint logic
const logout = async (req, res) => {
  try {
    const token = req.token;
    const { refreshToken } = req.body;

    // Revoke both tokens
    if (token) revokeToken(token);
    if (refreshToken) revokeToken(refreshToken);

    ResponseHandler.success(res, 'Logged out successfully');
  } catch (error) {
    ResponseHandler.error(res, 'Logout failed', error);
  }
};

module.exports = {
  generateTokenPair,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  revokeToken,
  clearExpiredTokens,
  authenticateToken,
  authorizeRoles,
  optionalAuth,
  hashPassword,
  comparePassword,
  generateSecureToken,
  refreshTokens,
  logout,
  JWT_CONFIG,
  // Aliases for backward compatibility
  protect: authenticateToken,
  authorize: authorizeRoles,
  requireAuth: authenticateToken,
  requireAdmin: authorizeRoles('admin')
};
