const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');

// Get all QR codes
router.get('/', qrController.getAllQRCodes);

// Get active QR codes
router.get('/active', qrController.getActiveQRCodes);

// Create QR code
router.post('/', qrController.createQRCode);

// Update QR code
router.put('/:id', qrController.updateQRCode);

// Reset daily counts
router.post('/reset-counts', qrController.resetDailyCounts);

module.exports = router;