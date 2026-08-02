const express = require('express');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/nearby', protect, userController.getNearbyIndustries);
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);
router.get('/:id', userController.getPublicProfile);

module.exports = router;
