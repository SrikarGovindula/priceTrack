const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

const Alerts = {
  col() {
    return getDB().collection('priceAlerts');
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

  async findActiveAlerts() {
    return this.col().aggregate([
      { $match: { alertStatus: 'active' } },
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
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' }
    ]).toArray();
  },

  async createOrUpdate({ userId, productId, targetPrice }) {
    if (!ObjectId.isValid(userId) || !ObjectId.isValid(productId)) {
      throw new Error('Invalid user or product ID');
    }

    const price = Number(targetPrice);
    if (isNaN(price) || price <= 0) {
      throw new Error('Target price must be a positive number');
    }

    const filter = {
      userId: new ObjectId(userId),
      productId: new ObjectId(productId)
    };

    const updateDoc = {
      $set: {
        targetPrice: price,
        alertStatus: 'active',
        updatedAt: new Date()
      },
      $setOnInsert: {
        lastNotifiedPrice: null,
        lastNotifiedAt: null,
        createdAt: new Date()
      }
    };

    await this.col().updateOne(filter, updateDoc, { upsert: true });
    return this.col().findOne(filter);
  },

  async markTriggered(alertId, lowestPrice) {
    if (!ObjectId.isValid(alertId)) return null;
    return this.col().updateOne(
      { _id: new ObjectId(alertId) },
      {
        $set: {
          alertStatus: 'triggered',
          lastNotifiedPrice: Number(lowestPrice),
          lastNotifiedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );
  },

  async update(id, userId, updates) {
    if (!ObjectId.isValid(id) || !ObjectId.isValid(userId)) return null;
    const cleanUpdates = { updatedAt: new Date() };
    if (updates.targetPrice !== undefined) cleanUpdates.targetPrice = Number(updates.targetPrice);
    if (updates.alertStatus) cleanUpdates.alertStatus = updates.alertStatus;

    await this.col().updateOne(
      { _id: new ObjectId(id), userId: new ObjectId(userId) },
      { $set: cleanUpdates }
    );
    return this.col().findOne({ _id: new ObjectId(id) });
  },

  async delete(id, userId) {
    if (!ObjectId.isValid(id) || !ObjectId.isValid(userId)) return false;
    const res = await this.col().deleteOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId)
    });
    return res.deletedCount > 0;
  },

  async countByUserId(userId) {
    if (!ObjectId.isValid(userId)) return 0;
    return this.col().countDocuments({ userId: new ObjectId(userId), alertStatus: 'active' });
  },

  async count() {
    return this.col().countDocuments();
  }
};

module.exports = Alerts;
