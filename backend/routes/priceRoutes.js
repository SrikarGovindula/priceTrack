const express = require('express');
const router = express.Router();
const priceController = require('../controllers/priceController');

router.get('/:productId', priceController.getPriceComparison);
router.get('/:productId/history', priceController.getPriceHistory);
router.get('/:productId/best-price', priceController.getBestPrice);

module.exports = router;
