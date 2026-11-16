const { ObjectId } = require('mongodb');
const Users = require('../models/users');
const Products = require('../models/products');
const Stores = require('../models/stores');
const StoreListings = require('../models/storeListings');
const PriceHistory = require('../models/priceHistory');
const Alerts = require('../models/alerts');
const Watchlists = require('../models/watchlists');
const priceMonitorService = require('../services/priceMonitorService');

const adminController = {
  async getDashboardStats(req, res, next) {
    try {
      const [
        totalUsers,
        totalProducts,
        totalStores,
        activeAlerts,
        totalWatchlistEntries,
        recentListings
      ] = await Promise.all([
        Users.count(),
        Products.count(),
        Stores.count(),
        Alerts.count(),
        Watchlists.count(),
        StoreListings.col().aggregate([
          { $sort: { lastUpdated: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: 'products',
              localField: 'productId',
              foreignField: '_id',
              as: 'product'
            }
          },
          { $unwind: '$product' },
          {
            $lookup: {
              from: 'stores',
              localField: 'storeId',
              foreignField: '_id',
              as: 'store'
            }
          },
          { $unwind: '$store' }
        ]).toArray()
      ]);

      const jobStats = priceMonitorService.getLastRunStats();

      return res.json({
        success: true,
        stats: {
          totalUsers,
          totalProducts,
          totalStores,
          activeAlerts,
          totalWatchlistEntries,
          recentListings,
          jobStats
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async getUsers(req, res, next) {
    try {
      const users = await Users.listAll(100);
      return res.json({
        success: true,
        users
      });
    } catch (err) {
      next(err);
    }
  },

  async getStores(req, res, next) {
    try {
      const stores = await Stores.listAll(false);
      return res.json({
        success: true,
        stores
      });
    } catch (err) {
      next(err);
    }
  },

  async updateStoreListingPrice(req, res, next) {
    try {
      const { productId, storeId, newPrice } = req.body;

      if (!productId || !storeId || newPrice === undefined) {
        return res.status(400).json({
          success: false,
          message: 'productId, storeId, and newPrice are required.'
        });
      }

      if (isNaN(newPrice) || Number(newPrice) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'newPrice must be a positive number.'
        });
      }

      // 1. Update store listing
      await StoreListings.updatePrice(productId, storeId, Number(newPrice));

      // 2. Append to price history
      await PriceHistory.insertRecord(productId, storeId, Number(newPrice), new Date());

      // 3. Return updated listing
      const updatedListing = await StoreListings.findOneByProductAndStore(productId, storeId);

      return res.json({
        success: true,
        message: `Price updated to ₹${Number(newPrice).toLocaleString('en-IN')}`,
        listing: updatedListing
      });
    } catch (err) {
      next(err);
    }
  },

  async triggerPriceRefresh(req, res, next) {
    try {
      console.log('[Admin] Manual price refresh triggered by admin:', req.user.email);
      const stats = await priceMonitorService.runPriceCheck({ manual: true });

      return res.json({
        success: true,
        message: 'Price monitoring check executed successfully.',
        stats
      });
    } catch (err) {
      next(err);
    }
  },

  async getPriceJobs(req, res, next) {
    try {
      const stats = priceMonitorService.getLastRunStats();
      return res.json({
        success: true,
        job: {
          name: 'Scheduled Price Monitoring',
          intervalMs: 300000,
          ...stats
        }
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = adminController;
