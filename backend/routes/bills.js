const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');

// Create a bill
router.post('/', billController.createBill);

// Get all bills
router.get('/', billController.getAllBills);

// Get today's bills
router.get('/today', billController.getTodayBills);

// Get bill by number
router.get('/number/:billNumber', billController.getBillByNumber);

// Get bills by date range
router.get('/date-range', billController.getBillsByDateRange);

// Update bill status
router.put('/:id', billController.updateBill);

// Reprint bill
router.get('/reprint/:billNumber', billController.reprintBill);

module.exports = router;