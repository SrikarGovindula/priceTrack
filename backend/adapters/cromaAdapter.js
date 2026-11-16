const StoreAdapterBase = require('./storeAdapterBase');

class CromaAdapter extends StoreAdapterBase {
  constructor() {
    super(
      'Croma',
      'croma',
      'https://www.croma.com',
      '/images/stores/croma.svg'
    );
  }

  async fetchPrice(product, existingListing = null) {
    const basePrice = existingListing ? existingListing.currentPrice : 30490;
    return {
      storeName: this.storeName,
      storeSlug: this.storeSlug,
      currentPrice: basePrice,
      originalPrice: existingListing ? existingListing.originalPrice : Math.round(basePrice * 1.12),
      availability: 'In Stock',
      deliveryInformation: 'Standard delivery in 2-4 days / Store pickup available',
      sourceType: 'demo_feed',
      productUrl: existingListing?.productUrl || product?.verifiedUrls?.croma || null
    };
  }
}

module.exports = new CromaAdapter();
