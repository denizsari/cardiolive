const mongoose = require('mongoose');
require('dotenv').config();

console.log('Starting script...');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not set');

async function addSampleProduct() {
  try {
    console.log('Attempting MongoDB connection...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB successfully');

    // Use existing Product model
    const Product = require('./src/models/productModel');
    
    // Check if a product with this slug already exists
    console.log('Checking for existing product...');
    const existingProduct = await Product.findOne({ slug: 'cardio-alpha' });
    if (existingProduct) {
      console.log('Sample product already exists:', existingProduct.name);
      return;
    }

    console.log('Creating new sample product...');
    const sampleProduct = new Product({
      name: 'Cardio Alpha Naturel Sızma Zeytinyağı',
      slug: 'cardio-alpha',
      description: 'Erken hasat zeytinlerden elde edilen, soğuk sıkım naturel sızma zeytinyağı. Kendine has meyvemsi aroması ve düşük asit oranı ile sofranızın vazgeçilmezi olacak.',
      price: 349.90,
      images: ['/products/product1.jpg'],
      category: 'Sızma Zeytinyağı',
      stock: 50,
      size: '500ml',
      isActive: true,
      featured: true
    });

    await sampleProduct.save();
    console.log('Sample product added successfully!');
    console.log('Product ID:', sampleProduct._id);
    console.log('Product Slug:', sampleProduct.slug);

  } catch (error) {
    console.error('Error in script:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

addSampleProduct()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
