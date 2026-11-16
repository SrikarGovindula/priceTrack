const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

const Sessions = {
  col() {
    return getDB().collection('sessions');
  },

  async create(userId, role, token, daysValid = 7) {
    const expiresAt = new Date(Date.now() + daysValid * 24 * 60 * 60 * 1000);
    const doc = {
      userId: new ObjectId(userId),
      role,
      token,
      createdAt: new Date(),
      expiresAt
    };
    await this.col().insertOne(doc);
    return doc;
  },

  async findByToken(token) {
    if (!token) return null;
    return this.col().findOne({
      token,
      expiresAt: { $gt: new Date() }
    });
  },

  async deleteByToken(token) {
    if (!token) return null;
    return this.col().deleteOne({ token });
  },

  async deleteByUserId(userId) {
    if (!ObjectId.isValid(userId)) return null;
    return this.col().deleteMany({ userId: new ObjectId(userId) });
  }
};

module.exports = Sessions;
