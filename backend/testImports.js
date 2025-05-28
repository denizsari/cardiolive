require('dotenv').config();
console.log('Testing imports...');

try {
  const userController = require('./src/controllers/userController');
  console.log('User controller exports:', Object.keys(userController));
  
  const authMiddleware = require('./src/middlewares/authMiddleware');
  console.log('Auth middleware exports:', Object.keys(authMiddleware));
  
  console.log('getMe function:', typeof userController.getMe);
  console.log('protect function:', typeof authMiddleware.protect);
  console.log('authorize function:', typeof authMiddleware.authorize);
  
} catch (error) {
  console.error('Import error:', error.message);
  console.error('Stack:', error.stack);
}
