const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', protect, analyticsController.getDashboardAnalytics);

module.exports = router;
