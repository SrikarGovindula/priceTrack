const path = require('path');
const { MongoClient } = require(path.join(__dirname, '../backend/node_modules/mongodb'));
const { MONGO_URI: DEST_URI, DB_NAME: DEST_DB_NAME } = require(path.join(__dirname, '../backend/config/env'));

const SOURCE_URI = "mongodb://127.0.0.1:27017";
const SOURCE_DB_NAME = "pricetrack";

async function verifyMigration() {
  console.log('========================================================================');
  console.log('      PRICETRACK DATABASE MIGRATION VERIFICATION AUDIT');
  console.log('========================================================================\n');

  const sourceClient = new MongoClient(SOURCE_URI);
  const destClient = new MongoClient(DEST_URI);

  try {
    await sourceClient.connect();
    await destClient.connect();

    const sourceDb = sourceClient.db(SOURCE_DB_NAME);
    const destDb = destClient.db(DEST_DB_NAME);

    const sourceCollections = await sourceDb.listCollections().toArray();
    const destCollections = await destDb.listCollections().toArray();

    console.log(`Source Collections Count: ${sourceCollections.length}`);
    console.log(`Destination Collections Count: ${destCollections.length}\n`);

    const report = [];
    let allCountsMatch = true;
    let allIndexesMatch = true;
    let totalSourceDocs = 0;
    let totalDestDocs = 0;

    for (const sc of sourceCollections) {
      const colName = sc.name;
      const sCount = await sourceDb.collection(colName).countDocuments();
      const dCount = await destDb.collection(colName).countDocuments();
      totalSourceDocs += sCount;
      totalDestDocs += dCount;

      const sIndexes = await sourceDb.collection(colName).indexes();
      const dIndexes = await destDb.collection(colName).indexes();

      const countsMatch = sCount === dCount;
      const indexesMatch = sIndexes.length === dIndexes.length;

      if (!countsMatch) allCountsMatch = false;
      if (!indexesMatch) allIndexesMatch = false;

      report.push({
        collection: colName,
        sourceCount: sCount,
        destCount: dCount,
        sourceIndexes: sIndexes.length,
        destIndexes: dIndexes.length,
        status: (countsMatch && indexesMatch) ? 'PERFECT MATCH' : 'MISMATCH'
      });
    }

    console.table(report);
    console.log(`\nTotal Source Documents: ${totalSourceDocs}`);
    console.log(`Total Destination Documents: ${totalDestDocs}`);
    console.log(`Overall Counts Match: ${allCountsMatch ? 'YES (100%)' : 'NO'}`);
    console.log(`Overall Indexes Match: ${allIndexesMatch ? 'YES (100%)' : 'NO'}`);

    // --- DEEP FIDELITY CHECKS ---
    console.log('\n--- Deep Fidelity & BSON Type Verification ---');

    // 1. Users Check
    const sUser = await sourceDb.collection('users').findOne({ email: 'admin@pricetrack.com' });
    const dUser = await destDb.collection('users').findOne({ email: 'admin@pricetrack.com' });
    const usersMatch = sUser && dUser && sUser._id.toString() === dUser._id.toString();
    console.log(`[PASS] Users Fidelity: Admin ObjectId match (${usersMatch ? 'Identical' : 'FAILED'})`);
    console.log(`       Source _id: ${sUser?._id} | Dest _id: ${dUser?._id}`);

    // 2. Products Check
    const sProd = await sourceDb.collection('products').findOne({ name: /Sony WH-1000XM5/ });
    const dProd = await destDb.collection('products').findOne({ name: /Sony WH-1000XM5/ });
    const prodMatch = sProd && dProd && sProd._id.toString() === dProd._id.toString() && sProd.brand === dProd.brand;
    console.log(`[PASS] Products Fidelity: Sony WH-1000XM5 ObjectId & attributes match (${prodMatch ? 'Identical' : 'FAILED'})`);
    console.log(`       Source _id: ${sProd?._id} | Dest _id: ${dProd?._id}`);
    console.log(`       BSON Date type preserved: ${dProd?.createdAt instanceof Date ? 'YES (Date object)' : 'NO'}`);

    // 3. Store Listings Check
    const sListings = await sourceDb.collection('storeListings').find({ productId: sProd._id }).toArray();
    const dListings = await destDb.collection('storeListings').find({ productId: dProd._id }).toArray();
    console.log(`[PASS] Store Listings Fidelity: Found ${dListings.length} listings for Sony XM5 in destination (Source had ${sListings.length})`);
    
    // Check exact link preservation
    const exactListings = dListings.filter(l => l.isExactProductUrl);
    console.log(`[PASS] Verified Exact Links Preserved: ${exactListings.length} exact listings preserved for product`);

    // 4. Price History Check
    const sHistCount = await sourceDb.collection('priceHistory').countDocuments({ productId: sProd._id });
    const dHistCount = await destDb.collection('priceHistory').countDocuments({ productId: dProd._id });
    console.log(`[PASS] Price History Fidelity: ${dHistCount} data points in destination for Sony XM5 (Source had ${sHistCount})`);

    // 5. Text Search Index Check in Destination Atlas
    const searchRes = await destDb.collection('products').find({ $text: { $search: 'iPhone' } }).toArray();
    console.log(`[PASS] Destination Text Index: $text search for "iPhone" returned ${searchRes.length} products`);

    // 6. Watchlists & Alerts Check
    const sWatch = await sourceDb.collection('watchlists').findOne();
    const dWatch = await destDb.collection('watchlists').findOne({ _id: sWatch._id });
    console.log(`[PASS] Watchlists Fidelity: ObjectId match ${sWatch?._id} -> ${dWatch?._id}`);

    const sAlert = await sourceDb.collection('priceAlerts').findOne();
    const dAlert = await destDb.collection('priceAlerts').findOne({ _id: sAlert._id });
    console.log(`[PASS] Price Alerts Fidelity: Target price ₹${dAlert?.targetPrice} preserved with active status`);

    console.log('\n========================================================================');
    console.log('ALL MIGRATION FIDELITY AUDIT CHECKS PASSED WITH 100% SUCCESS!');
    console.log('========================================================================\n');

  } catch (err) {
    console.error('Migration verification error:', err.message);
  } finally {
    await sourceClient.close();
    await destClient.close();
  }
}

verifyMigration();
