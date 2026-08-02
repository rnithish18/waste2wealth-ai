const express = require('express');
const { body } = require('express-validator');
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/user/:userId', reviewController.getUserReviews);
router.post(
  '/',
  protect,
  [body('transactionId').notEmpty(), body('rating').isInt({ min: 1, max: 5 })],
  validate,
  reviewController.createReview
);

module.exports = router;
