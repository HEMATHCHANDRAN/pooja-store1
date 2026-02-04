const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Log static file requests
app.use('/uploads', (req, res, next) => {
  console.log('Static file request:', req.url);
  next();
});

// Import routes
const reportsRouter = require('./routes/reports');
const dailyClosingRouter = require('./routes/dailyClosing');
const itemsRouter = require('./routes/items');
const billsRouter = require('./routes/bills');

// Use routes

app.use('/api/items', itemsRouter);
app.use('/api/bills', billsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/daily-closing', dailyClosingRouter);
// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Pooja Store Backend API is running!' });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pooja-store', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
const itemsUploadDir = path.join(__dirname, 'uploads', 'items');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory:', uploadsDir);
}
if (!fs.existsSync(itemsUploadDir)) {
  fs.mkdirSync(itemsUploadDir, { recursive: true });
  console.log('📁 Created items upload directory:', itemsUploadDir);
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Static files served from: ${path.join(__dirname, 'uploads')}`);
  console.log(`🔗 Backend URL: http://localhost:${PORT}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log('Available routes:');
  console.log('  GET  /api/items - Get all items');
  console.log('  POST /api/items - Create item (with image upload)');
  console.log('  PUT  /api/items/:id - Update item');
  console.log('  POST /api/bills - Create bill');
  console.log('  GET  /api/bills - Get all bills');
  console.log('  PUT  /api/bills/:id - Update bill status');
});