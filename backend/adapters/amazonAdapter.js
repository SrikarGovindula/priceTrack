const StoreAdapterBase = require('./storeAdapterBase');

class AmazonAdapter extends StoreAdapterBase {
  constructor() {
    super(
      'Amazon India',
      'amazon',
      'https://www.amazon.in',
      '/images/stores/amazon.svg'
    );
  }

  async fetchPrice(product, existingListing = null) {
    // In demo mode, simulate reliable realistic store pricing
    // Note: Production integrations would authenticate with official Partner API
    const basePrice = existingListing ? existingListing.currentPrice : 29990;
    return {
      storeName: this.storeName,
      storeSlug: this.storeSlug,
      currentPrice: basePrice,
      originalPrice: existingListing ? existingListing.originalPrice : Math.round(basePrice * 1.15),
      availability: 'In Stock',
      deliveryInformation: 'FREE Prime delivery in 1-2 days',
      sourceType: 'demo_feed',
      productUrl: existingListing?.productUrl || product?.verifiedUrls?.amazon || null
    };
  }
}

module.exports = new AmazonAdapter();
