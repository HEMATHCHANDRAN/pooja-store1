const express = require('express');
const router = express.Router();
const dailyClosingController = require('../controllers/dailyClosingController');

// Get daily closing data
router.get('/', dailyClosingController.getDailyClosing);

// Close the day
router.post('/close', dailyClosingController.closeDay);

// Get closed days list
router.get('/closed-days', dailyClosingController.getClosedDays);

// Get closing details for specific date
router.get('/details/:date', dailyClosingController.getClosingDetails);

module.exports = router;