const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Item-wise sales report
router.get('/item-wise', reportController.getItemWiseReport);

// Daily report
router.get('/daily', reportController.getDailyReport);

// Weekly report
router.get('/weekly', reportController.getWeeklyReport);

// Monthly report
router.get('/monthly', reportController.getMonthlyReport);

// Payment method report
router.get('/payment-method', reportController.getPaymentMethodReport);

// Export report
router.get('/export/excel', reportController.exportToExcel);

module.exports = router;