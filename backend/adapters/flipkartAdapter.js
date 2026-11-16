const StoreAdapterBase = require('./storeAdapterBase');

class FlipkartAdapter extends StoreAdapterBase {
  constructor() {
    super(
      'Flipkart',
      'flipkart',
      'https://www.flipkart.com',
      '/images/stores/flipkart.svg'
    );
  }

  async fetchPrice(product, existingListing = null) {
    const basePrice = existingListing ? existingListing.currentPrice : 28999;
    return {
      storeName: this.storeName,
      storeSlug: this.storeSlug,
      currentPrice: basePrice,
      originalPrice: existingListing ? existingListing.originalPrice : Math.round(basePrice * 1.18),
      availability: 'In Stock',
      deliveryInformation: 'Plus delivery in 2-3 days',
      sourceType: 'demo_feed',
      productUrl: existingListing?.productUrl || product?.verifiedUrls?.flipkart || null
    };
  }
}

module.exports = new FlipkartAdapter();
