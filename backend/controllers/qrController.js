const QRCode = require('../models/QRCode');
const path = require('path');
const fs = require('fs');

// Get all QR codes
exports.getAllQRCodes = async (req, res) => {
  try {
    const qrCodes = await QRCode.find().sort({ displayOrder: 1 });
    res.json({ success: true, data: qrCodes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get active QR codes
exports.getActiveQRCodes = async (req, res) => {
  try {
    const qrCodes = await QRCode.find({ isActive: true }).sort({ displayOrder: 1 });
    res.json({ success: true, data: qrCodes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create QR code
exports.createQRCode = async (req, res) => {
  try {
    const { name, displayName, upiId, displayOrder, dailyLimit } = req.body;
    
    // Check if QR code with same name exists
    const existingQR = await QRCode.findOne({ name });
    if (existingQR) {
      return res.status(400).json({ success: false, error: 'QR code with this name already exists' });
    }
    
    // Handle QR image upload
    if (!req.files || !req.files.qrImage) {
      return res.status(400).json({ success: false, error: 'QR image is required' });
    }
    
    const qrImage = req.files.qrImage;
    const uploadDir = path.join(__dirname, '../uploads/qrcodes');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const fileName = `${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}${path.extname(qrImage.name)}`;
    const uploadPath = path.join(uploadDir, fileName);
    
    await qrImage.mv(uploadPath);
    
    const qrCode = new QRCode({
      name,
      displayName,
      upiId,
      qrImage: `/uploads/qrcodes/${fileName}`,
      displayOrder: parseInt(displayOrder),
      dailyLimit: parseInt(dailyLimit) || 20
    });
    
    await qrCode.save();
    res.status(201).json({ success: true, data: qrCode });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update QR code
exports.updateQRCode = async (req, res) => {
  try {
    const { name, displayName, upiId, isActive, displayOrder, dailyLimit } = req.body;
    
    const updateData = {
      displayName,
      upiId,
      isActive: isActive === 'true',
      displayOrder: parseInt(displayOrder),
      dailyLimit: parseInt(dailyLimit) || 20,
      updatedAt: Date.now()
    };
    
    // Handle QR image update
    if (req.files && req.files.qrImage) {
      const qrImage = req.files.qrImage;
      const uploadDir = path.join(__dirname, '../uploads/qrcodes');
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const fileName = `${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}${path.extname(qrImage.name)}`;
      const uploadPath = path.join(uploadDir, fileName);
      
      await qrImage.mv(uploadPath);
      updateData.qrImage = `/uploads/qrcodes/${fileName}`;
    }
    
    const qrCode = await QRCode.findByIdAndUpdate(req.params.id, updateData, { new: true });
    
    if (!qrCode) {
      return res.status(404).json({ success: false, error: 'QR code not found' });
    }
    
    res.json({ success: true, data: qrCode });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Reset daily counts
exports.resetDailyCounts = async (req, res) => {
  try {
    await QRCode.updateMany({}, {
      dailyCount: 0,
      lastResetDate: new Date().toISOString().split('T')[0],
      updatedAt: Date.now()
    });
    
    res.json({ success: true, message: 'Daily counts reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};