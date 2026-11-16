const Products = require('../models/products');
const StoreListings = require('../models/storeListings');
const PriceHistory = require('../models/priceHistory');
const Alerts = require('../models/alerts');
const Notifications = require('../models/notifications');

class PriceMonitorService {
  constructor() {
    this.isJobRunning = false;
    this.lastRunStats = {
      lastRunAt: null,
      productsChecked: 0,
      alertsEvaluated: 0,
      notificationsTriggered: 0,
      status: 'idle'
    };
  }

  /**
   * Core price check and alert evaluation routine
   */
  async runPriceCheck(options = {}) {
    if (this.isJobRunning) {
      console.log('[PriceMonitorService] A price check job is already in progress. Skipping.');
      return this.lastRunStats;
    }

    this.isJobRunning = true;
    console.log('[PriceMonitorService] Starting price check cycle at', new Date().toISOString());

    let productsChecked = 0;
    let alertsEvaluated = 0;
    let notificationsTriggered = 0;

    try {
      // 1. Get all products
      const products = await Products.col().find({}).toArray();
      productsChecked = products.length;

      // 2. For each product, evaluate current lowest price
      for (const product of products) {
        const listings = await StoreListings.findByProductId(product._id);
        if (!listings || listings.length === 0) continue;

        // Current lowest price across all stores for this product
        const lowestListing = listings[0];
        const lowestPrice = lowestListing.currentPrice;

        // 3. Find any active alerts for this product
        const alerts = await Alerts.col().find({
          productId: product._id,
          alertStatus: 'active'
        }).toArray();

        for (const alert of alerts) {
          alertsEvaluated++;

          // Check if condition met: current lowest price <= user's target price
          if (lowestPrice <= alert.targetPrice) {
            // Avoid duplicate spam notifications if price hasn't dropped further
            if (alert.lastNotifiedPrice === lowestPrice) {
              continue;
            }

            // Notification title and message
            const storeName = lowestListing.store ? lowestListing.store.storeName : 'Available Store';
            const priceDifference = alert.targetPrice - lowestPrice;
            const diffText = priceDifference > 0 
              ? `₹${priceDifference.toLocaleString('en-IN')} below your target!` 
              : 'matching your target price!';

            const title = `Price Drop Alert: ${product.name}`;
            const message = `Great news! ${product.name} is now available at ₹${lowestPrice.toLocaleString('en-IN')} on ${storeName} (${diffText}).`;

            // Create in-app notification
            await Notifications.create({
              userId: alert.userId,
              productId: product._id,
              title,
              message,
              notificationType: 'price_drop',
              metadata: {
                currentPrice: lowestPrice,
                targetPrice: alert.targetPrice,
                storeName,
                productUrl: lowestListing.productUrl
              }
            });

            // Mark alert as triggered
            await Alerts.markTriggered(alert._id, lowestPrice);

            // Log mock email dispatch
            console.log(`[Email Dispatch Simulation] Alert sent to User ID: ${alert.userId} for "${product.name}" at ₹${lowestPrice}`);

            notificationsTriggered++;
          }
        }
      }

      this.lastRunStats = {
        lastRunAt: new Date(),
        productsChecked,
        alertsEvaluated,
        notificationsTriggered,
        status: 'success'
      };

      console.log(`[PriceMonitorService] Completed cycle: Checked ${productsChecked} products, evaluated ${alertsEvaluated} alerts, triggered ${notificationsTriggered} notifications.`);
      return this.lastRunStats;
    } catch (err) {
      console.error('[PriceMonitorService] Error during price check cycle:', err);
      this.lastRunStats.status = 'error';
      this.lastRunStats.lastError = err.message;
      return this.lastRunStats;
    } finally {
      this.isJobRunning = false;
    }
  }

  getLastRunStats() {
    return this.lastRunStats;
  }
}

module.exports = new PriceMonitorService();
