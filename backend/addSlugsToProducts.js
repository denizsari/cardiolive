require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/productModel');

// Slug oluşturma fonksiyonu
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function addSlugsToProducts() {
  try {
    console.log('MongoDB URI:', process.env.MONGO_URI ? 'Found' : 'Not found');
    
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB\'ye bağlandı');

    // Tüm ürünleri bul
    const allProducts = await Product.find({});
    console.log(`Toplam ${allProducts.length} ürün bulundu`);

    // Slug'ı olmayan ürünleri bul
    const products = await Product.find({ $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }] });
    console.log(`Slug'ı olmayan ${products.length} ürün bulundu`);

    // Her ürün için slug oluştur ve güncelle
    for (const product of products) {
      const slug = createSlug(product.name);
      console.log(`Updating ${product.name} -> ${slug}`);
      
      await Product.updateOne(
        { _id: product._id },
        { $set: { slug: slug } }
      );
      console.log(`Updated: ${product.name} -> ${slug}`);
    }

    console.log('Tüm ürünlere slug eklendi');

    // Güncellenmiş ürünleri kontrol et
    const updatedProducts = await Product.find({});
    console.log('Güncellenmiş ürünler:');
    updatedProducts.forEach(p => console.log(`- ${p.name}: ${p.slug}`));

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
  addSlugsToProducts();
}
