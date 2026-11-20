const { MongoClient } = require('mongodb');
const { MONGO_URI, DB_NAME } = require('./env');

let client = null;
let db = null;

async function connectDB() {
  if (db) return db;

  try {
    client = new MongoClient(MONGO_URI, {
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 15000,
    });

    await client.connect();
    db = client.db(DB_NAME);
    console.log(`[Database] Successfully connected to MongoDB database: "${DB_NAME}"`);

    // Initialize required indexes
    await initIndexes(db);

    return db;
  } catch (err) {
    console.error('[Database] MongoDB connection error:', err.message);
    throw err;
  }
}

async function initIndexes(database) {
  try {
    // Users collection indexes
    await database.collection('users').createIndex({ email: 1 }, { unique: true });

    // Sessions collection indexes (with TTL for expiration)
    await database.collection('sessions').createIndex({ token: 1 }, { unique: true });
    await database.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

    // Password resets index
    await database.collection('passwordResets').createIndex({ tokenHash: 1 }, { unique: true });
    await database.collection('passwordResets').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

    // Products collection indexes
    await database.collection('products').createIndex({ name: 'text', brand: 'text', category: 'text', modelNumber: 'text' });
    await database.collection('products').createIndex({ category: 1 });
    await database.collection('products').createIndex({ brand: 1 });
    await database.collection('products').createIndex({ createdAt: -1 });

    // Stores collection indexes
    await database.collection('stores').createIndex({ storeName: 1 }, { unique: true });

    // Store listings indexes
    await database.collection('storeListings').createIndex({ productId: 1, storeId: 1 }, { unique: true });
    await database.collection('storeListings').createIndex({ productId: 1 });
    await database.collection('storeListings').createIndex({ currentPrice: 1 });

    // Price history indexes
    await database.collection('priceHistory').createIndex({ productId: 1, storeId: 1, recordedAt: -1 });
    await database.collection('priceHistory').createIndex({ productId: 1, recordedAt: -1 });

    // Watchlists indexes
    await database.collection('watchlists').createIndex({ userId: 1, productId: 1 }, { unique: true });
    await database.collection('watchlists').createIndex({ userId: 1 });

    // Price alerts indexes
    await database.collection('priceAlerts').createIndex({ userId: 1, productId: 1 });
    await database.collection('priceAlerts').createIndex({ alertStatus: 1, productId: 1 });

    // Notifications indexes
    await database.collection('notifications').createIndex({ userId: 1, createdAt: -1 });
    await database.collection('notifications').createIndex({ userId: 1, isRead: 1 });

    console.log('[Database] MongoDB indexes ensured successfully');
  } catch (indexError) {
    console.warn('[Database] Warning while creating indexes:', indexError.message);
  }
}

function getDB() {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  return db;
}

async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('[Database] MongoDB connection closed');
  }
}

module.exports = {
  connectDB,
  getDB,
  closeDB
};
