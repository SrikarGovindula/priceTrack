const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

const PriceHistory = {
  col() {
    return getDB().collection('priceHistory');
  },

  async insertRecord(productId, storeId, price, recordedAt = new Date()) {
    return this.col().insertOne({
      productId: new ObjectId(productId),
      storeId: new ObjectId(storeId),
      price: Number(price),
      recordedAt: new Date(recordedAt)
    });
  },

  async insertMany(records) {
    if (!records || records.length === 0) return;
    const formatted = records.map(r => ({
      productId: new ObjectId(r.productId),
      storeId: new ObjectId(r.storeId),
      price: Number(r.price),
      recordedAt: new Date(r.recordedAt)
    }));
    return this.col().insertMany(formatted);
  },

  async getHistory(productId, rangeDays = 30) {
    if (!ObjectId.isValid(productId)) return [];

    const query = { productId: new ObjectId(productId) };
    if (rangeDays && rangeDays !== 'all') {
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - parseInt(rangeDays, 10));
      query.recordedAt = { $gte: sinceDate };
    }

    return this.col().aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'stores',
          localField: 'storeId',
          foreignField: '_id',
          as: 'store'
        }
      },
      { $unwind: '$store' },
      { $sort: { recordedAt: 1 } }
    ]).toArray();
  },

  async getSummary(productId) {
    if (!ObjectId.isValid(productId)) return null;

    const pipeline = [
      { $match: { productId: new ObjectId(productId) } },
      {
        $group: {
          _id: '$productId',
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          avgPrice: { $avg: '$price' },
          firstRecorded: { $min: '$recordedAt' },
          lastRecorded: { $max: '$recordedAt' },
          totalPoints: { $sum: 1 }
        }
      }
    ];

    const result = await this.col().aggregate(pipeline).toArray();
    if (!result || result.length === 0) {
      return {
        minPrice: 0,
        maxPrice: 0,
        avgPrice: 0,
        priceDifference: 0,
        trend: 'stable'
      };
    }

    const stat = result[0];
    const avgRounded = Math.round(stat.avgPrice);
    const diff = stat.maxPrice - stat.minPrice;

    // Get the most recent two points to determine short-term trend
    const recent = await this.col().find({ productId: new ObjectId(productId) })
      .sort({ recordedAt: -1 })
      .limit(5)
      .toArray();

    let trend = 'stable';
    if (recent.length >= 2) {
      const latest = recent[0].price;
      const prior = recent[recent.length - 1].price;
      if (latest < prior) trend = 'falling';
      else if (latest > prior) trend = 'rising';
    }

    return {
      minPrice: stat.minPrice,
      maxPrice: stat.maxPrice,
      avgPrice: avgRounded,
      priceDifference: diff,
      totalPoints: stat.totalPoints,
      trend,
      lastRecorded: stat.lastRecorded
    };
  }
};

module.exports = PriceHistory;
