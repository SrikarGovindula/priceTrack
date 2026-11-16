const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

const Watchlists = {
  col() {
    return getDB().collection('watchlists');
  },

  async findByUserId(userId) {
    if (!ObjectId.isValid(userId)) return [];

    return this.col().aggregate([
      { $match: { userId: new ObjectId(userId) } },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'storeListings',
          localField: 'productId',
          foreignField: 'productId',
          as: 'listings'
        }
      },
      {
        $addFields: {
          currentLowestPrice: { $min: '$listings.currentPrice' },
          originalPrice: { $max: '$listings.originalPrice' },
          storeCount: { $size: '$listings' }
        }
      },
      {
        $project: {
          listings: 0
        }
      },
      { $sort: { createdAt: -1 } }
    ]).toArray();
  },

  async findOne(userId, productId) {
    if (!ObjectId.isValid(userId) || !ObjectId.isValid(productId)) return null;
    return this.col().findOne({
      userId: new ObjectId(userId),
      productId: new ObjectId(productId)
    });
  },

  async add({ userId, productId, targetPrice = null }) {
    if (!ObjectId.isValid(userId) || !ObjectId.isValid(productId)) {
      throw new Error('Invalid user or product ID');
    }

    const doc = {
      userId: new ObjectId(userId),
      productId: new ObjectId(productId),
      targetPrice: targetPrice !== null && targetPrice !== undefined ? Number(targetPrice) : null,
      isActive: true,
      createdAt: new Date()
    };

    // Upsert to prevent duplicate entry for same user and product
    await this.col().updateOne(
      { userId: new ObjectId(userId), productId: new ObjectId(productId) },
      { $set: doc },
      { upsert: true }
    );

    return this.findOne(userId, productId);
  },

  async update(id, userId, updates) {
    if (!ObjectId.isValid(id) || !ObjectId.isValid(userId)) return null;
    const cleanUpdates = {};
    if (updates.targetPrice !== undefined) cleanUpdates.targetPrice = Number(updates.targetPrice);
    if (updates.isActive !== undefined) cleanUpdates.isActive = Boolean(updates.isActive);

    await this.col().updateOne(
      { _id: new ObjectId(id), userId: new ObjectId(userId) },
      { $set: cleanUpdates }
    );
    return this.col().findOne({ _id: new ObjectId(id) });
  },

  async remove(id, userId) {
    if (!ObjectId.isValid(id) || !ObjectId.isValid(userId)) return false;
    const res = await this.col().deleteOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId)
    });
    return res.deletedCount > 0;
  },

  async removeByProduct(userId, productId) {
    if (!ObjectId.isValid(userId) || !ObjectId.isValid(productId)) return false;
    const res = await this.col().deleteOne({
      userId: new ObjectId(userId),
      productId: new ObjectId(productId)
    });
    return res.deletedCount > 0;
  },

  async countByUserId(userId) {
    if (!ObjectId.isValid(userId)) return 0;
    return this.col().countDocuments({ userId: new ObjectId(userId) });
  },

  async count() {
    return this.col().countDocuments();
  }
};

module.exports = Watchlists;
