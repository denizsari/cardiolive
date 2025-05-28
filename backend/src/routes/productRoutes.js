const express = require('express');
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getAllProductsAdmin,
  updateProductAdmin,
  deleteProductAdmin,
  getProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect } = require('../middlewares/authMiddleware');

// Admin routes (must come before dynamic routes)
router.get('/admin/all', protect, getAllProductsAdmin);
router.post('/admin', protect, createProduct);
router.put('/admin/:id', protect, updateProductAdmin);
router.delete('/admin/:id', protect, deleteProductAdmin);

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProduct);
router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router; 