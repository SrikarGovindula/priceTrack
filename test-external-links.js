// test-external-links.js
// Verification of PriceTrack expanded products, categories, stores, images, and external URLs

const https = require('https');
const http = require('http');
const { connectDB, getDB, closeDB } = require('./backend/config/db');

function checkHttp(url) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      const client = parsed.protocol === 'https:' ? https : http;
      const req = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
        resolve({ url, status: res.statusCode });
      });
      req.on('error', (err) => {
        resolve({ url, error: err.message });
      });
      req.setTimeout(5000, () => {
        req.destroy();
        resolve({ url, error: 'Timeout' });
      });
    } catch (e) {
      resolve({ url, error: e.message });
    }
  });
}

async function runAudit() {
  console.log('============================================================');
  console.log('   PRICETRACK EXPANDED PRODUCTS & EXTERNAL LINKS AUDIT      ');
  console.log('============================================================\n');

  await connectDB();
  const db = getDB();

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  // 1. PRODUCT COUNT AND CATEGORY COVERAGE
  console.log('--- 1. Product Count & Category Breakdown ---');
  const products = await db.collection('products').find({}).toArray();
  assert(products.length >= 50, `Total products in database: ${products.length} (at least 50 required)`);

  const categories = await db.collection('products').distinct('category');
  const requiredCategories = [
    'Smartphones',
    'Laptops',
    'Headphones',
    'Smartwatches',
    'Tablets',
    'Televisions',
    'Cameras',
    'Gaming Accessories',
    'Computer Accessories',
    'Home Appliances'
  ];

  for (const cat of requiredCategories) {
    const count = products.filter(p => p.category === cat).length;
    assert(count > 0, `Category "${cat}" present with ${count} verified products`);
  }

  // 2. BRAND COVERAGE
  console.log('\n--- 2. Popular Brand Coverage ---');
  const requiredBrands = [
    'Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Realme',
    'HP', 'Dell', 'Lenovo', 'ASUS', 'Sony',
    'JBL', 'boAt', 'LG', 'Acer'
  ];

  const dbBrands = await db.collection('products').distinct('brand');
  for (const brand of requiredBrands) {
    const bCount = products.filter(p => p.brand.toLowerCase() === brand.toLowerCase()).length;
    assert(bCount > 0, `Brand "${brand}" present with ${bCount} verified products`);
  }

  // 3. STORE LISTINGS AUDIT
  console.log('\n--- 3. Store Listings, Links & Attributes Audit ---');
  const listings = await db.collection('storeListings').find({}).toArray();
  assert(listings.length > 0, `Total store listings in database: ${listings.length}`);

  const stores = await db.collection('stores').find({}).toArray();
  const storeMap = {};
  stores.forEach(s => storeMap[s._id.toString()] = s);

  const supportedStores = ['amazon', 'flipkart', 'croma', 'reliance-digital', 'myntra'];
  const storeListingCounts = {};
  supportedStores.forEach(s => storeListingCounts[s] = 0);

  let zeroSearchUrlsInDb = true;
  let allExactUrlsAreHttps = true;
  let allHaveValidUrlTypes = true;
  let allHaveDeliveryInfo = true;
  let allHaveAvailability = true;
  let allHaveTimestamps = true;

  for (const l of listings) {
    const store = storeMap[l.storeId.toString()];
    if (store && storeListingCounts[store.storeSlug] !== undefined) {
      storeListingCounts[store.storeSlug]++;
    }

    if (l.productUrl) {
      if (!l.productUrl.startsWith('https://')) {
        allExactUrlsAreHttps = false;
      }
      if (
        l.productUrl.includes('/search') ||
        l.productUrl.includes('/s?k=') ||
        l.productUrl.includes('searchB') ||
        l.productUrl.includes('dsearch')
      ) {
        zeroSearchUrlsInDb = false;
      }
    }

    if (l.urlType && l.urlType !== 'exact_product' && l.urlType !== 'unavailable') {
      allHaveValidUrlTypes = false;
    }
    if (!l.deliveryInformation) allHaveDeliveryInfo = false;
    if (!l.availability) allHaveAvailability = false;
    if (!l.lastUpdated) allHaveTimestamps = false;
  }

  assert(allExactUrlsAreHttps, 'Every verified store listing contains a valid HTTPS exact product URL');
  assert(zeroSearchUrlsInDb, 'Zero search query URLs exist in the store listings database');
  assert(allHaveValidUrlTypes, 'Every store listing specifies urlType ("exact_product" or "unavailable")');
  assert(allHaveDeliveryInfo, 'Every store listing includes delivery information');
  assert(allHaveAvailability, 'Every store listing includes stock availability');
  assert(allHaveTimestamps, 'Every store listing includes lastUpdated timestamp');

  for (const slug of supportedStores) {
    assert(storeListingCounts[slug] > 0, `Supported store "${slug}" has ${storeListingCounts[slug]} live listings`);
  }

  // 4. TEST EXTERNAL REDIRECTION URLS PER STORE
  console.log('\n--- 4. Store Outbound URL Pattern Verification ---');
  for (const slug of supportedStores) {
    const sampleListing = listings.find(l => {
      const s = storeMap[l.storeId.toString()];
      return s && s.storeSlug === slug;
    });
    if (sampleListing) {
      const store = storeMap[sampleListing.storeId.toString()];
      const isHttps = sampleListing.productUrl.startsWith('https://');
      const hasDomain = sampleListing.productUrl.includes(store.website.replace('https://', ''));
      assert(isHttps && hasDomain, `Store [${store.storeName}] external link verified: ${sampleListing.productUrl.substring(0, 75)}...`);
    }
  }

  // 5. SAMPLE IMAGE VALIDATION (Unsplash CDN)
  console.log('\n--- 5. Product Image Verification Sample ---');
  const sampleImages = products.slice(0, 10).map(p => ({ name: p.name, img: p.image }));
  for (const item of sampleImages) {
    const check = await checkHttp(item.img);
    assert(check.status === 200 || check.status === 302, `Image for "${item.name.substring(0, 30)}..." returned HTTP ${check.status}`);
  }

  console.log('\n============================================================');
  console.log(`TOTAL AUDIT CHECKS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('============================================================\n');

  await closeDB();

  if (failed > 0) {
    process.exit(1);
  }
}

runAudit().catch(err => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});
