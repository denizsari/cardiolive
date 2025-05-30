require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/productModel');

async function updateFeaturedProducts() {
  try {
    console.log('MongoDB URI:', process.env.MONGO_URI ? 'Found' : 'Not found');
    
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB\'ye bağlandı');

    // Önce mevcut ürünleri kontrol et
    const products = await Product.find({});
    console.log(`Toplam ${products.length} ürün bulundu`);

    // Tüm ürünleri featured olarak işaretle (sadece test için)
    const result = await Product.updateMany(
      {},
      { $set: { featured: true } }
    );

    console.log(`${result.modifiedCount} ürün featured olarak güncellendi`);

    // Güncellenmiş ürünleri kontrol et
    const updatedProducts = await Product.find({ featured: true });
    console.log(`Featured ürün sayısı: ${updatedProducts.length}`);

    // Bağlantıyı kapat
    await mongoose.connection.close();
    console.log('MongoDB bağlantısı kapatıldı');

  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
}

// Script'i çalıştır
if (require.main === module) {
  updateFeaturedProducts();
}

module.exports = updateFeaturedProducts;
