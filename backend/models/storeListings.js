const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

const StoreListings = {
  col() {
    return getDB().collection('storeListings');
  },

  async findByProductId(productId) {
    if (!ObjectId.isValid(productId)) return [];
    return this.col().aggregate([
      { $match: { productId: new ObjectId(productId) } },
      {
        $lookup: {
          from: 'stores',
          localField: 'storeId',
          foreignField: '_id',
          as: 'store'
        }
      },
      { $unwind: '$store' },
      { $sort: { currentPrice: 1 } }
    ]).toArray();
  },

  async findOneByProductAndStore(productId, storeId) {
    if (!ObjectId.isValid(productId) || !ObjectId.isValid(storeId)) return null;
    return this.col().findOne({
      productId: new ObjectId(productId),
      storeId: new ObjectId(storeId)
    });
  },

  async upsertListing({
    productId,
    storeId,
    productUrl = null,
    storeProductId = null,
    isExactProductUrl = false,
    urlType = 'unavailable',
    urlVerifiedAt = null,
    currentPrice,
    originalPrice,
    availability = 'In Stock',
    deliveryInformation = '2-4 days delivery',
    sourceType = 'demo_feed'
  }) {
    const filter = {
      productId: new ObjectId(productId),
      storeId: new ObjectId(storeId)
    };

    const updateDoc = {
      $set: {
        productUrl,
        storeProductId,
        isExactProductUrl: Boolean(isExactProductUrl),
        urlType: urlType || (isExactProductUrl ? 'exact_product' : 'unavailable'),
        urlVerifiedAt: urlVerifiedAt || (isExactProductUrl ? new Date() : null),
        currentPrice: Number(currentPrice),
        originalPrice: originalPrice ? Number(originalPrice) : Number(currentPrice),
        availability,
        deliveryInformation,
        sourceType,
        lastUpdated: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    };

    return this.col().updateOne(filter, updateDoc, { upsert: true });
  },

  async updatePrice(productId, storeId, newPrice) {
    if (!ObjectId.isValid(productId) || !ObjectId.isValid(storeId)) return null;
    return this.col().updateOne(
      { productId: new ObjectId(productId), storeId: new ObjectId(storeId) },
      {
        $set: {
          currentPrice: Number(newPrice),
          lastUpdated: new Date()
        }
      }
    );
  },

  async getBestPrice(productId) {
    if (!ObjectId.isValid(productId)) return null;
    const listings = await this.findByProductId(productId);
    if (!listings || listings.length === 0) return null;
    return listings[0]; // Already sorted by currentPrice: 1
  },

  async count() {
    return this.col().countDocuments();
  }
};

module.exports = StoreListings;
