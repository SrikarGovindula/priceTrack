const { PRICE_CHECK_INTERVAL_MS } = require('../config/env');
const priceMonitorService = require('../services/priceMonitorService');

let intervalId = null;

function startPriceMonitoring() {
  if (intervalId) return;

  console.log(`[Job] Scheduled Price Monitoring Service initialized. Interval: ${PRICE_CHECK_INTERVAL_MS / 1000}s`);

  // Initial delayed run after 10 seconds of server startup
  setTimeout(() => {
    priceMonitorService.runPriceCheck().catch(err => {
      console.error('[Job] Initial price check encountered an error:', err.message);
    });
  }, 10000);

  // Periodic interval
  intervalId = setInterval(() => {
    priceMonitorService.runPriceCheck().catch(err => {
      console.error('[Job] Periodic price check encountered an error:', err.message);
    });
  }, PRICE_CHECK_INTERVAL_MS);
}

function stopPriceMonitoring() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[Job] Price Monitoring Service stopped');
  }
}

module.exports = {
  startPriceMonitoring,
  stopPriceMonitoring
};
