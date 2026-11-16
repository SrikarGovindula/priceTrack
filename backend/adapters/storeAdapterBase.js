/**
 * Base Store Adapter Interface
 * All store adapters implement this common contract.
 */
class StoreAdapterBase {
  constructor(storeName, storeSlug, website, logoUrl) {
    this.storeName = storeName;
    this.storeSlug = storeSlug;
    this.website = website;
    this.logoUrl = logoUrl;
  }

  getStoreInfo() {
    return {
      storeName: this.storeName,
      storeSlug: this.storeSlug,
      website: this.website,
      logoUrl: this.logoUrl
    };
  }

  /**
   * Fetch current price details for a product listing.
   * Returns: { currentPrice, originalPrice, availability, deliveryInformation, sourceType }
   */
  async fetchPrice(product, existingListing = null) {
    throw new Error('fetchPrice must be implemented by store adapter');
  }

  /**
   * Returns exact product detail URL if verified, or null if unavailable.
   * Search URLs are strictly prohibited.
   */
  generateProductUrl(product) {
    if (product && product.verifiedUrls && product.verifiedUrls[this.storeSlug]) {
      return product.verifiedUrls[this.storeSlug];
    }
    return null;
  }
}

module.exports = StoreAdapterBase;
