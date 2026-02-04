const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/items/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'item-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Get all items
router.get('/', itemController.getItems);

// Get item by ID
router.get('/:id', itemController.getItemById);

// Create item with image upload
router.post('/', upload.single('image'), itemController.createItem);

// Update item with optional image upload
router.put('/:id', upload.single('image'), itemController.updateItem);

// Delete item
router.delete('/:id', itemController.deleteItem);

module.exports = router;