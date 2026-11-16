const { ObjectId } = require('mongodb');
const StoreListings = require('../models/storeListings');
const PriceHistory = require('../models/priceHistory');
const Products = require('../models/products');

const priceController = {
  async getPriceComparison(req, res, next) {
    try {
      const { productId } = req.params;
      if (!ObjectId.isValid(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID.'
        });
      }

      const product = await Products.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.'
        });
      }

      const listings = await StoreListings.findByProductId(productId);
      if (!listings || listings.length === 0) {
        return res.json({
          success: true,
          product,
          listings: [],
          bestOption: null,
          stats: null
        });
      }

      const prices = listings.map(l => l.currentPrice);
      const lowestPrice = Math.min(...prices);
      const highestPrice = Math.max(...prices);
      const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
      const priceDifference = highestPrice - lowestPrice;

      const bestOption = listings.find(l => l.currentPrice === lowestPrice) || listings[0];

      return res.json({
        success: true,
        product,
        listings,
        bestOption,
        stats: {
          lowestPrice,
          highestPrice,
          avgPrice,
          priceDifference,
          storeCount: listings.length,
          lastChecked: bestOption.lastUpdated || new Date()
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async getPriceHistory(req, res, next) {
    try {
      const { productId } = req.params;
      const { days = '30' } = req.query;

      if (!ObjectId.isValid(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID.'
        });
      }

      const history = await PriceHistory.getHistory(productId, days);
      const summary = await PriceHistory.getSummary(productId);

      return res.json({
        success: true,
        range: days,
        pointsCount: history.length,
        summary,
        history
      });
    } catch (err) {
      next(err);
    }
  },

  async getBestPrice(req, res, next) {
    try {
      const { productId } = req.params;
      if (!ObjectId.isValid(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID.'
        });
      }

      const best = await StoreListings.getBestPrice(productId);
      if (!best) {
        return res.status(404).json({
          success: false,
          message: 'No store listings found for this product.'
        });
      }

      return res.json({
        success: true,
        bestPrice: best
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = priceController;
