#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test users for orders
const testUsers = [
  {
    email: 'admin@cardiolive.com',
    password: 'admin123'
  },
  {
    email: 'user@cardiolive.com', 
    password: 'user123'
  }
];

// Sample order data templates
const sampleOrderTemplates = [
  {
    paymentMethod: 'credit_card',
    notes: 'Düzenli müşteri siparişi',
    status: 'delivered'
  },
  {
    paymentMethod: 'cash_on_delivery',
    notes: 'Kapıda ödeme tercihi',
    status: 'shipped'
  },
  {
    paymentMethod: 'bank_transfer',
    notes: 'Hediye paketi isteniyor',
    status: 'processing'
  },
  {
    paymentMethod: 'credit_card',
    notes: 'Acil teslimat',
    status: 'pending'
  }
];

async function loginUser(credentials) {
  try {
    const response = await axios.post(`${BASE_URL}/users/login`, credentials);
    return {
      success: true,
      token: response.data.data?.accessToken || response.data.data?.token || response.data.token,
      user: response.data.data?.user || response.data.user
    };
  } catch (error) {
    console.log(`❌ Login failed for ${credentials.email}:`, error.response?.data?.message || error.message);
    return { success: false, error: error.message };
  }
}

async function getProducts() {
  try {
    const response = await axios.get(`${BASE_URL}/products`);
    const products = response.data.data?.products || response.data.products || response.data;
    return { success: true, products };
  } catch (error) {
    console.log('❌ Failed to get products:', error.message);
    return { success: false, error: error.message };
  }
}

async function createSampleOrder(authToken, product, template, orderNumber) {
  const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 items
  const total = product.price * quantity;
  
  const orderData = {
    items: [{
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.images?.[0] || '/products/default.jpg'
    }],
    total: total,
    shippingAddress: {
      fullName: `Test Customer ${orderNumber}`,
      email: `customer${orderNumber}@example.com`,
      phone: `+90 555 ${String(Math.floor(Math.random() * 1000000)).padStart(7, '0')}`,
      address: `Test Address ${orderNumber}, Test Apartment ${orderNumber}`,
      city: orderNumber % 2 === 0 ? 'Istanbul' : 'Ankara',
      district: orderNumber % 2 === 0 ? 'Kadikoy' : 'Cankaya',
      postalCode: orderNumber % 2 === 0 ? '34710' : '06420'
    },
    paymentMethod: template.paymentMethod,
    notes: template.notes
  };

  try {
    const response = await axios.post(`${BASE_URL}/orders`, orderData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      const order = response.data.data?.order || response.data.order;
      
      // Update order status if needed (simulate different order states)
      if (template.status !== 'pending') {
        try {
          await axios.patch(`${BASE_URL}/orders/admin/${order._id}/status`, {
            status: template.status,
            trackingNumber: template.status === 'shipped' || template.status === 'delivered' 
              ? `TRK${Date.now().toString().slice(-8)}` 
              : undefined
          }, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (statusError) {
          console.log(`⚠️ Failed to update order status for ${order.orderNumber}:`, statusError.response?.data?.message);
        }
      }

      return {
        success: true,
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          status: template.status,
          total: total,
          items: order.items.length
        }
      };
    }
    
    return { success: false, error: 'Order creation failed' };
  } catch (error) {
    console.log(`❌ Failed to create order:`, error.response?.data?.message || error.message);
    return { success: false, error: error.message };
  }
}

async function createSampleOrders() {
  console.log('🛍️ Creating Sample Orders for Testing');
  console.log('=====================================\n');

  try {
    // Step 1: Get products
    console.log('1️⃣ Getting available products...');
    const productsResult = await getProducts();
    
    if (!productsResult.success || !productsResult.products.length) {
      throw new Error('No products available');
    }
    
    console.log(`✅ Found ${productsResult.products.length} products`);

    // Step 2: Login users and create orders
    let totalOrdersCreated = 0;
    
    for (const userCredentials of testUsers) {
      console.log(`\n2️⃣ Creating orders for ${userCredentials.email}...`);
      
      const authResult = await loginUser(userCredentials);
      if (!authResult.success) {
        console.log(`⚠️ Skipping ${userCredentials.email} - login failed`);
        continue;
      }
      
      console.log(`✅ Logged in as ${authResult.user.name} (${authResult.user.role})`);
      
      // Create 2-4 orders per user
      const ordersToCreate = Math.floor(Math.random() * 3) + 2;
      
      for (let i = 0; i < ordersToCreate; i++) {
        const product = productsResult.products[Math.floor(Math.random() * productsResult.products.length)];
        const template = sampleOrderTemplates[Math.floor(Math.random() * sampleOrderTemplates.length)];
        const orderNumber = totalOrdersCreated + 1;
        
        const orderResult = await createSampleOrder(authResult.token, product, template, orderNumber);
        
        if (orderResult.success) {
          console.log(`   ✅ Order ${orderResult.order.orderNumber} created - ${orderResult.order.status} - ${orderResult.order.total.toFixed(2)} TL`);
          totalOrdersCreated++;
        } else {
          console.log(`   ❌ Failed to create order ${orderNumber}`);
        }
        
        // Small delay between orders
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`\n🎉 Sample orders creation completed!`);
    console.log(`📊 Total orders created: ${totalOrdersCreated}`);
    console.log(`\n💡 You can now test the account dashboard at: http://localhost:3001/account`);
    
  } catch (error) {
    console.log(`\n❌ Failed to create sample orders:`, error.message);
    process.exit(1);
  }
}

// Run the script
createSampleOrders();
