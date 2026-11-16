const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

const Stores = {
  col() {
    return getDB().collection('stores');
  },

  async findById(id) {
    if (!ObjectId.isValid(id)) return null;
    return this.col().findOne({ _id: new ObjectId(id) });
  },

  async findBySlug(storeSlug) {
    return this.col().findOne({ storeSlug });
  },

  async listAll(activeOnly = false) {
    const query = activeOnly ? { isActive: true } : {};
    return this.col().find(query).sort({ storeName: 1 }).toArray();
  },

  async create({ storeName, storeSlug, storeLogo, website, isActive = true }) {
    const doc = {
      storeName,
      storeSlug: storeSlug || storeName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      storeLogo,
      website,
      isActive,
      createdAt: new Date()
    };
    const result = await this.col().insertOne(doc);
    return { ...doc, _id: result.insertedId };
  },

  async update(id, updates) {
    if (!ObjectId.isValid(id)) return null;
    await this.col().updateOne({ _id: new ObjectId(id) }, { $set: updates });
    return this.findById(id);
  },

  async count() {
    return this.col().countDocuments();
  }
};

module.exports = Stores;
