const express = require('express');
const buyerRequestController = require('../controllers/buyerRequestController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.get('/open', buyerRequestController.getOpenRequests);

router.use(protect, restrictTo('buyer', 'admin'));
router.post('/', buyerRequestController.createBuyerRequest);
router.get('/', buyerRequestController.getMyBuyerRequests);
router.put('/:id', buyerRequestController.updateBuyerRequest);
router.delete('/:id', buyerRequestController.deleteBuyerRequest);

module.exports = router;
