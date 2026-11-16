const { ObjectId } = require('mongodb');
const Alerts = require('../models/alerts');
const Products = require('../models/products');

const alertController = {
  async getAlerts(req, res, next) {
    try {
      const alerts = await Alerts.findByUserId(req.user._id);
      return res.json({
        success: true,
        count: alerts.length,
        alerts
      });
    } catch (err) {
      next(err);
    }
  },

  async createAlert(req, res, next) {
    try {
      const { productId, targetPrice } = req.body;

      if (!productId || !ObjectId.isValid(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid product ID is required.'
        });
      }

      if (targetPrice === undefined || isNaN(targetPrice) || Number(targetPrice) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Target price must be a valid positive number.'
        });
      }

      const product = await Products.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.'
        });
      }

      const alert = await Alerts.createOrUpdate({
        userId: req.user._id,
        productId,
        targetPrice: Number(targetPrice)
      });

      return res.status(201).json({
        success: true,
        message: `Price drop alert configured for ₹${Number(targetPrice).toLocaleString('en-IN')}`,
        alert
      });
    } catch (err) {
      next(err);
    }
  },

  async updateAlert(req, res, next) {
    try {
      const { id } = req.params;
      const { targetPrice, alertStatus } = req.body;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid alert ID.'
        });
      }

      const updated = await Alerts.update(id, req.user._id, { targetPrice, alertStatus });
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found.'
        });
      }

      return res.json({
        success: true,
        message: 'Price alert updated successfully.',
        alert: updated
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteAlert(req, res, next) {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid alert ID.'
        });
      }

      const success = await Alerts.delete(id, req.user._id);
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found.'
        });
      }

      return res.json({
        success: true,
        message: 'Price alert removed successfully.'
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = alertController;
