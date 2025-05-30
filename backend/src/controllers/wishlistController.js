const WishlistItem = require('../models/wishlistModel');
const Product = require('../models/productModel');
const ResponseHandler = require('../utils/responseHandler');
const mongoose = require('mongoose');

// Get user's wishlist
exports.getUserWishlist = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'addedAt', order = 'desc' } = req.query;
    const userId = req.user.userId;

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build sort
    const sortObj = { [sort]: order === 'asc' ? 1 : -1 };

    const wishlistItems = await WishlistItem.find({ user: userId })
      .populate({
        path: 'product',
        select: 'name slug price discountedPrice images category brand inStock averageRating totalReviews'
      })
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    const totalItems = await WishlistItem.countDocuments({ user: userId });

    // Filter out items with deleted products
    const wishlist = wishlistItems
      .filter(item => item.product)
      .map(item => ({
        id: item._id,
        product: item.product,
        addedAt: item.addedAt,
        notes: item.notes
      }));

    const pagination = {
      currentPage: Number(page),
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
      hasNext: page < Math.ceil(totalItems / limit),
      hasPrev: page > 1
    };

    ResponseHandler.success(res, 'Favori listesi başarıyla getirildi', {
      wishlist,
      pagination,
      count: wishlist.length
    });
  } catch (error) {
    ResponseHandler.error(res, 'Favori listesi getirme hatası', error);
  }
};

// Add product to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { productId, notes } = req.body;
    const userId = req.user.userId;

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return ResponseHandler.badRequest(res, 'Geçersiz ürün ID');
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return ResponseHandler.notFound(res, 'Ürün bulunamadı');
    }

    // Check if already in wishlist
    const existingItem = await WishlistItem.findOne({
      user: userId,
      product: productId
    });

    if (existingItem) {
      return ResponseHandler.badRequest(res, 'Ürün zaten favori listenizde');
    }

    // Add to wishlist
    const wishlistItem = new WishlistItem({
      user: userId,
      product: productId,
      notes: notes || ''
    });

    await wishlistItem.save();
    await wishlistItem.populate('product', 'name slug price discountedPrice images');

    ResponseHandler.created(res, 'Ürün favori listesine eklendi', { wishlistItem });
  } catch (error) {
    ResponseHandler.error(res, 'Favori listesine ekleme hatası', error);
  }
};

// Remove product from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.userId;

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return ResponseHandler.badRequest(res, 'Geçersiz ürün ID');
    }

    // Find and remove the wishlist item
    const wishlistItem = await WishlistItem.findOneAndDelete({
      user: userId,
      product: productId
    });

    if (!wishlistItem) {
      return ResponseHandler.notFound(res, 'Ürün favori listenizde bulunamadı');
    }

    ResponseHandler.success(res, 'Ürün favori listesinden kaldırıldı');
  } catch (error) {
    ResponseHandler.error(res, 'Favori listesinden kaldırma hatası', error);
  }
};

// Check if product is in wishlist
exports.checkWishlistStatus = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.userId;

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return ResponseHandler.badRequest(res, 'Geçersiz ürün ID');
    }

    const wishlistItem = await WishlistItem.findOne({
      user: userId,
      product: productId
    });

    ResponseHandler.success(res, 'Favori listesi durumu getirildi', {
      inWishlist: !!wishlistItem,
      addedAt: wishlistItem?.addedAt || null
    });
  } catch (error) {
    ResponseHandler.error(res, 'Favori listesi kontrolü hatası', error);
  }
};

// Get wishlist count for user
exports.getWishlistCount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const count = await WishlistItem.countDocuments({ user: userId });

    ResponseHandler.success(res, 'Favori listesi sayısı getirildi', { count });
  } catch (error) {
    ResponseHandler.error(res, 'Favori listesi sayısı alma hatası', error);
  }
};

// Clear entire wishlist
exports.clearWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await WishlistItem.deleteMany({ user: userId });

    ResponseHandler.success(res, 'Favori listesi temizlendi', { 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    ResponseHandler.error(res, 'Favori listesi temizleme hatası', error);
  }
};

// Add multiple products to wishlist (bulk operation)
exports.addMultipleToWishlist = async (req, res) => {
  try {
    const { productIds } = req.body;
    const userId = req.user.userId;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return ResponseHandler.badRequest(res, 'Geçerli ürün ID listesi gerekli');
    }

    // Validate all product IDs
    for (const productId of productIds) {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return ResponseHandler.badRequest(res, `Geçersiz ürün ID: ${productId}`);
      }
    }

    // Check which products exist
    const existingProducts = await Product.find({
      _id: { $in: productIds }
    }).select('_id');

    const existingProductIds = existingProducts.map(p => p._id.toString());
    const nonExistentProducts = productIds.filter(id => !existingProductIds.includes(id));

    if (nonExistentProducts.length > 0) {
      return ResponseHandler.badRequest(res, `Şu ürünler bulunamadı: ${nonExistentProducts.join(', ')}`);
    }

    // Check which items are already in wishlist
    const existingWishlistItems = await WishlistItem.find({
      user: userId,
      product: { $in: productIds }
    }).select('product');

    const existingWishlistProductIds = existingWishlistItems.map(item => item.product.toString());
    const newProductIds = productIds.filter(id => !existingWishlistProductIds.includes(id));

    if (newProductIds.length === 0) {
      return ResponseHandler.badRequest(res, 'Tüm ürünler zaten favori listenizde');
    }

    // Add new items to wishlist
    const wishlistItems = newProductIds.map(productId => ({
      user: userId,
      product: productId
    }));

    const result = await WishlistItem.insertMany(wishlistItems);

    ResponseHandler.success(res, `${result.length} ürün favori listesine eklendi`, {
      addedCount: result.length,
      skippedCount: existingWishlistProductIds.length
    });
  } catch (error) {
    ResponseHandler.error(res, 'Toplu favori listesine ekleme hatası', error);
  }
};

// Remove multiple products from wishlist (bulk operation)
exports.removeMultipleFromWishlist = async (req, res) => {
  try {
    const { productIds } = req.body;
    const userId = req.user.userId;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return ResponseHandler.badRequest(res, 'Geçerli ürün ID listesi gerekli');
    }

    // Validate all product IDs
    for (const productId of productIds) {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return ResponseHandler.badRequest(res, `Geçersiz ürün ID: ${productId}`);
      }
    }

    const result = await WishlistItem.deleteMany({
      user: userId,
      product: { $in: productIds }
    });

    ResponseHandler.success(res, `${result.deletedCount} ürün favori listesinden kaldırıldı`, {
      deletedCount: result.deletedCount
    });
  } catch (error) {
    ResponseHandler.error(res, 'Toplu favori listesinden kaldırma hatası', error);
  }
};

// Update wishlist item notes
exports.updateWishlistItemNotes = async (req, res) => {
  try {
    const { productId } = req.params;
    const { notes } = req.body;
    const userId = req.user.userId;

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return ResponseHandler.badRequest(res, 'Geçersiz ürün ID');
    }

    const wishlistItem = await WishlistItem.findOneAndUpdate(
      { user: userId, product: productId },
      { notes: notes || '' },
      { new: true }
    ).populate('product', 'name slug price discountedPrice images');

    if (!wishlistItem) {
      return ResponseHandler.notFound(res, 'Ürün favori listenizde bulunamadı');
    }

    ResponseHandler.success(res, 'Favori listesi notu güncellendi', { wishlistItem });
  } catch (error) {
    ResponseHandler.error(res, 'Favori listesi notu güncelleme hatası', error);
  }
};
