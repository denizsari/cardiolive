const express = require('express');
const app = express();

// Test if basic Express setup works
app.get('/test', (req, res) => {
  res.json({ message: 'Test successful' });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
