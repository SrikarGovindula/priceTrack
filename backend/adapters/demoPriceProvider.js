const amazonAdapter = require('./amazonAdapter');
const flipkartAdapter = require('./flipkartAdapter');
const cromaAdapter = require('./cromaAdapter');
const relianceAdapter = require('./relianceAdapter');
const myntraAdapter = require('./myntraAdapter');

class DemoPriceProvider {
  constructor() {
    this.adapters = {
      amazon: amazonAdapter,
      flipkart: flipkartAdapter,
      croma: cromaAdapter,
      'reliance-digital': relianceAdapter,
      myntra: myntraAdapter
    };
  }

  getRegisteredAdapters() {
    return Object.values(this.adapters);
  }

  getAdapter(storeSlug) {
    return this.adapters[storeSlug] || null;
  }
}

module.exports = new DemoPriceProvider();
