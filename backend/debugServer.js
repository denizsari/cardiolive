const express = require('express');
const app = express();

// Test basic middleware first
app.use(express.json());

console.log('Testing userRoutes import...');
try {
  const userRoutes = require('./src/routes/userRoutes');
  console.log('UserRoutes imported successfully');
  
  console.log('Testing userRoutes mounting...');
  app.use('/api/users', userRoutes);
  console.log('UserRoutes mounted successfully');
  
  const PORT = 3002;
  app.listen(PORT, () => {
    console.log(`Debug server running on port ${PORT}`);
  });
} catch(e) {
  console.error('Error:', e.message);
  console.error('Stack:', e.stack);
}
