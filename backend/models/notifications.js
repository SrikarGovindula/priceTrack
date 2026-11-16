const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

const Notifications = {
  col() {
    return getDB().collection('notifications');
  },

  async create({ userId, productId = null, title, message, notificationType = 'price_drop', metadata = {} }) {
    if (!ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }

    const doc = {
      userId: new ObjectId(userId),
      productId: productId && ObjectId.isValid(productId) ? new ObjectId(productId) : null,
      title: title.trim(),
      message: message.trim(),
      notificationType,
      metadata: metadata || {},
      isRead: false,
      createdAt: new Date()
    };

    const res = await this.col().insertOne(doc);
    return { ...doc, _id: res.insertedId };
  },

  async findByUserId(userId, limit = 50) {
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
      {
        $unwind: {
          path: '$product',
          preserveNullAndEmptyArrays: true
        }
      },
      { $sort: { createdAt: -1 } },
      { $limit: limit }
    ]).toArray();
  },

  async countUnread(userId) {
    if (!ObjectId.isValid(userId)) return 0;
    return this.col().countDocuments({
      userId: new ObjectId(userId),
      isRead: false
    });
  },

  async markAsRead(id, userId) {
    if (!ObjectId.isValid(id) || !ObjectId.isValid(userId)) return false;
    const res = await this.col().updateOne(
      { _id: new ObjectId(id), userId: new ObjectId(userId) },
      { $set: { isRead: true } }
    );
    return res.modifiedCount > 0;
  },

  async markAllAsRead(userId) {
    if (!ObjectId.isValid(userId)) return false;
    const res = await this.col().updateMany(
      { userId: new ObjectId(userId), isRead: false },
      { $set: { isRead: true } }
    );
    return res.modifiedCount > 0;
  },

  async delete(id, userId) {
    if (!ObjectId.isValid(id) || !ObjectId.isValid(userId)) return false;
    const res = await this.col().deleteOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId)
    });
    return res.deletedCount > 0;
  },

  async clearAll(userId) {
    if (!ObjectId.isValid(userId)) return false;
    const res = await this.col().deleteMany({
      userId: new ObjectId(userId)
    });
    return res.deletedCount > 0;
  }
};

module.exports = Notifications;
