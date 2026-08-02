const express = require('express');
const { body } = require('express-validator');
const transactionController = require('../controllers/transactionController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  restrictTo('buyer', 'admin'),
  [body('wasteId').notEmpty(), body('quantity').isFloat({ min: 0.01 })],
  validate,
  transactionController.createTransaction
);

router.get('/', transactionController.getMyTransactions);
router.get('/:id', transactionController.getTransactionById);
router.patch('/:id/status', transactionController.updateTransactionStatus);

module.exports = router;
