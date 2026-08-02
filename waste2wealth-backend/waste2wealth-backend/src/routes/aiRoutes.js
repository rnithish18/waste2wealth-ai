const express = require('express');
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(protect, aiLimiter);

router.post('/classify', aiController.classifyWaste);
router.get('/recommendations/:wasteId', aiController.getBuyerRecommendations);
router.post('/price-predict', aiController.predictPrice);
router.post('/forecast', aiController.forecastWaste);
router.post('/carbon', aiController.calculateCarbon);
router.get('/similar-materials/:wasteId', aiController.findSimilarMaterials);
router.post('/transport-optimize', aiController.optimizeTransport);

module.exports = router;
