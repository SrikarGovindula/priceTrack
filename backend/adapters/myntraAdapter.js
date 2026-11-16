const StoreAdapterBase = require('./storeAdapterBase');

class MyntraAdapter extends StoreAdapterBase {
  constructor() {
    super(
      'Myntra',
      'myntra',
      'https://www.myntra.com',
      '/images/stores/myntra.svg'
    );
  }

  async fetchPrice(product, existingListing = null) {
    const basePrice = existingListing ? existingListing.currentPrice : 29490;
    return {
      storeName: this.storeName,
      storeSlug: this.storeSlug,
      currentPrice: basePrice,
      originalPrice: existingListing ? existingListing.originalPrice : Math.round(basePrice * 1.20),
      availability: 'In Stock',
      deliveryInformation: 'Delivered in 3-5 days',
      sourceType: 'demo_feed',
      productUrl: existingListing?.productUrl || product?.verifiedUrls?.myntra || null
    };
  }
}

module.exports = new MyntraAdapter();
