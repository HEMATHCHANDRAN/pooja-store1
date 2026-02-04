const Item = require('../models/Item');
const fs = require('fs');
const path = require('path');

// Get all items
exports.getItems = async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: items,
      count: items.length
    });
  } catch (error) {
    console.error('Error getting items:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get item by ID
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }
    
    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error getting item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create item with image upload
exports.createItem = async (req, res) => {
  try {
    const { itemCode, name, price, costPrice, currentStock, minStockAlert, category, description } = req.body;
    
    let imagePath = '';
    
    // Handle image upload
    if (req.file) {
      // Store relative path
      imagePath = `/uploads/items/${req.file.filename}`;
      console.log('Image saved at:', imagePath);
    }
    
    // Create new item
    const item = new Item({
      itemCode,
      name,
      price,
      costPrice,
      currentStock: parseInt(currentStock),
      minStockAlert: parseInt(minStockAlert),
      category,
      description,
      image: imagePath // Store relative path
    });
    
    await item.save();
    
    res.status(201).json({
      success: true,
      data: item,
      message: 'Item created successfully'
    });
    
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Update item
exports.updateItem = async (req, res) => {
  try {
    const { itemCode, name, price, costPrice, currentStock, minStockAlert, category, description } = req.body;
    
    const updateData = {
      itemCode,
      name,
      price,
      costPrice,
      currentStock: parseInt(currentStock),
      minStockAlert: parseInt(minStockAlert),
      category,
      description
    };
    
    // Handle image upload if new image provided
    if (req.file) {
      // Store relative path
      updateData.image = `/uploads/items/${req.file.filename}`;
      console.log('Updated image saved at:', updateData.image);
      
      // Delete old image if exists
      const oldItem = await Item.findById(req.params.id);
      if (oldItem && oldItem.image && oldItem.image.startsWith('/uploads/')) {
        const oldImagePath = path.join(__dirname, '..', oldItem.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log('Deleted old image:', oldImagePath);
        }
      }
    }
    
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }
    
    res.json({
      success: true,
      data: item,
      message: 'Item updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Delete item
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }
    
    // Delete image if exists
    if (item.image && item.image.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '..', item.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log('Deleted image:', imagePath);
      }
    }
    
    await item.deleteOne();
    
    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};