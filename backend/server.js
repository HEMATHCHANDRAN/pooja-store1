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

// For Railway - use provided PORT or default
const PORT = process.env.PORT || 5000;

// Health check endpoint (REQUIRED for Railway)
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Pooja Store API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Pooja Store Billing System API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      items: '/api/items',
      bills: '/api/bills',
      reports: '/api/reports'
    }
  });
});

// MongoDB Connection with better error handling
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  // Don't crash - keep retrying
});

// Serve static files from uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
const itemsDir = path.join(uploadsDir, 'items');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

if (!fs.existsSync(itemsDir)) {
  fs.mkdirSync(itemsDir, { recursive: true });
  console.log('Created items upload directory:', itemsDir);
}

// Import routes (make sure these files exist!)
const itemRoutes = require('./routes/items');
const billRoutes = require('./routes/bills');
const reportRoutes = require('./routes/reports');
const qrRoutes = require('./routes/qrcodes');

// Use routes
app.use('/api/items', itemRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/qrcodes', qrRoutes);

// Global error handler (CRITICAL!)
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥', err);
  // Don't exit - keep server running
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥', err);
  // Don't exit - keep server running
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://0.0.0.0:${PORT}/api/health`);
});

// Graceful shutdown for Railway
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Export for testing
module.exports = app;
