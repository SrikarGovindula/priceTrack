const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

const Users = {
  col() {
    return getDB().collection('users');
  },

  async findById(id) {
    if (!ObjectId.isValid(id)) return null;
    return this.col().findOne({ _id: new ObjectId(id) }, { projection: { passwordHash: 0 } });
  },

  async findByEmail(email) {
    if (!email) return null;
    return this.col().findOne({ email: email.toLowerCase().trim() });
  },

  async create({ name, email, passwordHash, role = 'user', profileImage = null }) {
    const doc = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      profileImage,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await this.col().insertOne(doc);
    return { ...doc, _id: result.insertedId };
  },

  async update(id, updates) {
    if (!ObjectId.isValid(id)) return null;
    updates.updatedAt = new Date();
    await this.col().updateOne({ _id: new ObjectId(id) }, { $set: updates });
    return this.findById(id);
  },

  async updatePassword(id, passwordHash) {
    if (!ObjectId.isValid(id)) return null;
    return this.col().updateOne(
      { _id: new ObjectId(id) },
      { $set: { passwordHash, updatedAt: new Date() } }
    );
  },

  async listAll(limit = 100) {
    return this.col().find({}, { projection: { passwordHash: 0 } }).sort({ createdAt: -1 }).limit(limit).toArray();
  },

  async count() {
    return this.col().countDocuments();
  }
};

module.exports = Users;
