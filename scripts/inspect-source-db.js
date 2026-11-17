const path = require('path');
const { MongoClient } = require(path.join(__dirname, '../backend/node_modules/mongodb'));
const { MONGO_URI, DB_NAME } = require(path.join(__dirname, '../backend/config/env'));

async function inspectSource() {
  console.log('Connecting to Source MongoDB at:', MONGO_URI, 'DB:', DB_NAME);
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const admin = client.db().admin();
    const dbs = await admin.listDatabases();
    console.log('\n--- All Databases on MongoDB Instance ---');
    dbs.databases.forEach(d => console.log(` - ${d.name} (${(d.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`));

    const db = client.db(DB_NAME);
    const collections = await db.listCollections().toArray();
    console.log(`\n--- Collections in "${DB_NAME}" (${collections.length} total) ---`);
    
    let totalDocs = 0;
    const summary = [];

    for (const col of collections) {
      const c = db.collection(col.name);
      const count = await c.countDocuments();
      totalDocs += count;
      const indexes = await c.indexes();
      summary.push({
        collection: col.name,
        documents: count,
        indexes: indexes.map(idx => idx.name).join(', ')
      });
    }

    console.table(summary);
    console.log(`Total Documents in "${DB_NAME}": ${totalDocs}`);

  } catch (err) {
    console.error('Error inspecting source database:', err.message);
  } finally {
    await client.close();
  }
}

inspectSource();
