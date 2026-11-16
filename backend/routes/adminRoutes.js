const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/adminAuth');

router.use(requireAuth, requireAdmin);

router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', adminController.getUsers);
router.get('/stores', adminController.getStores);
router.put('/store-listings/price', adminController.updateStoreListingPrice);
router.post('/price-jobs/refresh', adminController.triggerPriceRefresh);
router.get('/price-jobs', adminController.getPriceJobs);

module.exports = router;
