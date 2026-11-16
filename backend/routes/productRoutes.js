const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/adminAuth');

router.get('/', productController.getProducts);
router.get('/search', productController.getProducts);
router.get('/suggestions', productController.searchSuggestions);
router.get('/categories', productController.getCategories);
router.get('/brands', productController.getBrands);
router.get('/deals', productController.getDeals);
router.get('/trending', productController.getTrending);
router.post('/compare-url', productController.compareUrl);
router.post('/identify-url', productController.identifyUrl);
router.get('/:id/comparison', productController.getProductComparison);
router.get('/:id', productController.getProductById);

// Admin-protected product routes
router.post('/', requireAuth, requireAdmin, productController.createProduct);
router.put('/:id', requireAuth, requireAdmin, productController.updateProduct);
router.delete('/:id', requireAuth, requireAdmin, productController.deleteProduct);

module.exports = router;
