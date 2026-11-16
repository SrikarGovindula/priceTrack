const { ObjectId } = require('mongodb');
const Watchlists = require('../models/watchlists');
const Products = require('../models/products');

const watchlistController = {
  async getWatchlist(req, res, next) {
    try {
      const items = await Watchlists.findByUserId(req.user._id);
      return res.json({
        success: true,
        count: items.length,
        watchlist: items
      });
    } catch (err) {
      next(err);
    }
  },

  async addToWatchlist(req, res, next) {
    try {
      const { productId, targetPrice } = req.body;

      if (!productId || !ObjectId.isValid(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid product ID is required.'
        });
      }

      const product = await Products.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.'
        });
      }

      const item = await Watchlists.add({
        userId: req.user._id,
        productId,
        targetPrice: targetPrice ? Number(targetPrice) : null
      });

      return res.status(201).json({
        success: true,
        message: 'Product added to watchlist.',
        item
      });
    } catch (err) {
      next(err);
    }
  },

  async updateWatchlistItem(req, res, next) {
    try {
      const { id } = req.params;
      const { targetPrice, isActive } = req.body;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid watchlist item ID.'
        });
      }

      const updated = await Watchlists.update(id, req.user._id, { targetPrice, isActive });
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Watchlist entry not found.'
        });
      }

      return res.json({
        success: true,
        message: 'Watchlist item updated successfully.',
        item: updated
      });
    } catch (err) {
      next(err);
    }
  },

  async removeFromWatchlist(req, res, next) {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ID.'
        });
      }

      // Check if ID is product ID or watchlist entry ID
      let deleted = await Watchlists.remove(id, req.user._id);
      if (!deleted) {
        deleted = await Watchlists.removeByProduct(req.user._id, id);
      }

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Watchlist entry not found.'
        });
      }

      return res.json({
        success: true,
        message: 'Product removed from watchlist.'
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = watchlistController;
