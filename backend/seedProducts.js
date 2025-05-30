require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/productModel');

async function createSampleProducts() {
  return [
    {
      name: 'Cardiolive Extra Virgin Zeytinyağı',
      slug: 'cardiolive-extra-virgin-zeytinyagi-500ml',
      description: 'Ege\'nin bereketli topraklarında yetişen zeytinlerden soğuk sıkım yöntemiyle elde edilen extra virgin zeytinyağı. Tamamen organik ve doğal.',
      price: 89.99,
      category: 'Organik Zeytinyağı',
      size: '500ml',
      stock: 150,
      images: [
        '/products/zeytinyagi-500ml-1.jpg',
        '/products/zeytinyagi-500ml-2.jpg',
        '/products/zeytinyagi-500ml-3.jpg'
      ],
      isActive: true,
      featured: true
    },
    {
      name: 'Cardiolive Sızma Zeytinyağı',
      slug: 'cardiolive-sizma-zeytinyagi-1l',
      description: 'Geleneksel yöntemlerle üretilen sızma zeytinyağı. Günlük kullanım için ideal ekonomik seçenek.',
      price: 159.99,
      category: 'Sızma Zeytinyağı',
      size: '1L',
      stock: 100,
      images: [
        '/products/zeytinyagi-1l-1.jpg',
        '/products/zeytinyagi-1l-2.jpg'
      ],
      isActive: true,
      featured: true
    },
    {
      name: 'Cardiolive Premium Zeytinyağı',
      slug: 'cardiolive-premium-zeytinyagi-250ml',
      description: 'Özel serimizden premium kalite zeytinyağı. Hediye vermek için ideal boyut.',
      price: 49.99,
      category: 'Özel Seri',
      size: '250ml',
      stock: 75,
      images: [
        '/products/premium-250ml-1.jpg',
        '/products/premium-250ml-2.jpg'
      ],
      isActive: true,
      featured: true
    },
    {
      name: 'Cardiolive Naturel Zeytinyağı',
      slug: 'cardiolive-naturel-zeytinyagi-2l',
      description: 'Büyük aileler için ideal olan 2 litrelik naturel zeytinyağı. Ekonomik aile boyu.',
      price: 289.99,
      category: 'Naturel Zeytinyağı',
      size: '2L',
      stock: 50,
      images: [
        '/products/naturel-2l-1.jpg',
        '/products/naturel-2l-2.jpg'
      ],
      isActive: true,
      featured: false
    }
  ];
}

async function seedProducts() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB\'ye bağlandı');

    // Mevcut ürünleri temizle (isteğe bağlı)
    await Product.deleteMany({});
    console.log('Mevcut ürünler temizlendi');

    // Get sample products
    const sampleProducts = await createSampleProducts();

    // Yeni ürünleri ekle
    const products = await Product.insertMany(sampleProducts);
    console.log(`${products.length} ürün başarıyla eklendi`);

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
  seedProducts();
}

module.exports = seedProducts;
