const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect, restrictTo('admin'));

router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/status', adminController.updateUserStatus);

router.get('/waste', adminController.getAllListingsAdmin);
router.patch('/waste/:id/approve', adminController.approveListing);

router.get('/compliance-documents', adminController.getComplianceDocuments);
router.patch('/compliance-documents/:id', adminController.reviewComplianceDocument);

router.get('/platform-stats', adminController.getPlatformStats);

module.exports = router;
