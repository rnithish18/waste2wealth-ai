const express = require('express');
const { body } = require('express-validator');
const wasteController = require('../controllers/wasteController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Public marketplace search (no auth required to browse)
router.get('/marketplace', wasteController.getMarketplace);

router.use(protect);

router.post(
  '/',
  restrictTo('generator', 'admin'),
  [
    body('wasteName').trim().notEmpty(),
    body('category').notEmpty(),
    body('materialType').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('quantity').isFloat({ min: 0 }),
    body('unit').notEmpty(),
    body('price').isFloat({ min: 0 }),
  ],
  validate,
  wasteController.createWaste
);

router.get('/', restrictTo('generator', 'admin'), wasteController.getMyWaste);
router.get('/:id', wasteController.getWasteById);
router.put('/:id', restrictTo('generator', 'admin'), wasteController.updateWaste);
router.delete('/:id', restrictTo('generator', 'admin'), wasteController.deleteWaste);

module.exports = router;
