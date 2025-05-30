const mongoose = require('mongoose');
const Product = require('./backend/src/models/productModel');

async function checkProductInDB() {
  try {    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://dnzsrslk:lM7FgL9SZgMaMoMn@discordbot.huv0u.mongodb.net/?retryWrites=true&w=majority&appName=discordBot', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Find the specific product
    const productId = '683958fd3582f4a6e2307efd';
    const product = await Product.findById(productId);
    
    if (!product) {
      console.log('Product not found!');
      return;
    }
    
    console.log('Product from database:');
    console.log('ID:', product._id);
    console.log('Name:', product.name);
    console.log('Price:', product.price);
    console.log('Stock:', product.stock);
    console.log('IsActive:', product.isActive);
    console.log('Type of stock:', typeof product.stock);
    console.log('Type of isActive:', typeof product.isActive);
    
    // Test the exact condition from the controller
    const quantity = 2;
    console.log('\nTesting conditions:');
    console.log('!product.isActive:', !product.isActive);
    console.log('product.stock < item.quantity:', product.stock < quantity);
    console.log('Combined condition:', !product.isActive || product.stock < quantity);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkProductInDB();
