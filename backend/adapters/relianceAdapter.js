const StoreAdapterBase = require('./storeAdapterBase');

class RelianceAdapter extends StoreAdapterBase {
  constructor() {
    super(
      'Reliance Digital',
      'reliance-digital',
      'https://www.reliancedigital.in',
      '/images/stores/reliance.svg'
    );
  }

  async fetchPrice(product, existingListing = null) {
    const basePrice = existingListing ? existingListing.currentPrice : 30990;
    return {
      storeName: this.storeName,
      storeSlug: this.storeSlug,
      currentPrice: basePrice,
      originalPrice: existingListing ? existingListing.originalPrice : Math.round(basePrice * 1.10),
      availability: 'In Stock',
      deliveryInformation: 'Express delivery in 2-4 days',
      sourceType: 'demo_feed',
      productUrl: existingListing?.productUrl || product?.verifiedUrls?.['reliance-digital'] || null
    };
  }
}

module.exports = new RelianceAdapter();
