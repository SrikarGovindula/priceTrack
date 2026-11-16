// test-url-comparison.js
// Automated verification for PriceTrack URL Product Identification and Cross-Store Matching

const http = require('http');

function post(endpoint, data, token = null) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: endpoint,
      method: 'POST',
      headers
    }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(body); } catch (e) { json = null; }
        resolve({ status: res.statusCode, body: json || body });
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function get(endpoint, token = null) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: endpoint,
      method: 'GET',
      headers
    }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(body); } catch (e) { json = null; }
        resolve({ status: res.statusCode, body: json || body });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('============================================================');
  console.log('   PRICETRACK URL COMPARISON & MATCHING TEST SUITE          ');
  console.log('============================================================\n');

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

  let identifiedProductId = null;

  // TEST 1: Amazon India Product URL Identification
  console.log('--- Test 1: Amazon India Product URL Identification ---');
  try {
    const res = await post('/api/products/compare-url', {
      url: 'https://www.amazon.in/dp/B09XS7JWHH'
    });
    const ok = res.status === 200 && res.body.matchFound && res.body.product?.name.includes('Sony WH-1000XM5');
    assert(ok, `Amazon URL identified as "${res.body.product?.name}" (Store: ${res.body.sourceStore?.storeName}, Confidence: ${res.body.confidenceScore}%)`);
    if (ok) identifiedProductId = res.body.product._id;
  } catch (err) {
    assert(false, `Test 1 Error: ${err.message}`);
  }

  // TEST 2: Flipkart Product URL Identification
  console.log('\n--- Test 2: Flipkart Product URL Identification ---');
  try {
    const res = await post('/api/products/compare-url', {
      url: 'https://www.flipkart.com/samsung-galaxy-s24-ultra-5g-titanium-gray-256-gb/p/itm0b21a8a30d507'
    });
    const ok = res.status === 200 && res.body.matchFound && res.body.product?.name.includes('Samsung Galaxy S24 Ultra');
    assert(ok, `Flipkart URL identified as "${res.body.product?.name}" (Store: ${res.body.sourceStore?.storeName}, Confidence: ${res.body.confidenceScore}%)`);
  } catch (err) {
    assert(false, `Test 2 Error: ${err.message}`);
  }

  // TEST 3: Myntra Product URL Identification
  console.log('\n--- Test 3: Myntra Product URL Identification ---');
  try {
    const res = await post('/api/products/compare-url', {
      url: 'https://www.myntra.com/headphones/sony/sony-wh-1000xm5-wireless-headphones/23491024/buy'
    });
    const ok = res.status === 200 && res.body.matchFound && res.body.product?.name.includes('Sony WH-1000XM5');
    assert(ok, `Myntra URL identified as "${res.body.product?.name}" (Store: ${res.body.sourceStore?.storeName}, Confidence: ${res.body.confidenceScore}%)`);
  } catch (err) {
    assert(false, `Test 3 Error: ${err.message}`);
  }

  // TEST 4: Croma Product URL Identification
  console.log('\n--- Test 4: Croma Product URL Identification ---');
  try {
    const res = await post('/api/products/compare-url', {
      url: 'https://www.croma.com/apple-iphone-15-128gb-black-/p/300762'
    });
    const ok = res.status === 200 && res.body.matchFound && res.body.product?.name.includes('iPhone 15');
    assert(ok, `Croma URL identified as "${res.body.product?.name}" (Store: ${res.body.sourceStore?.storeName}, Confidence: ${res.body.confidenceScore}%)`);
  } catch (err) {
    assert(false, `Test 4 Error: ${err.message}`);
  }

  // TEST 5: Reliance Digital Product URL Identification
  console.log('\n--- Test 5: Reliance Digital Product URL Identification ---');
  try {
    const res = await post('/api/products/compare-url', {
      url: 'https://www.reliancedigital.in/samsung-galaxy-s24-ultra-5g-256-gb-titanium-gray-mobile-phone/p/494352125'
    });
    const ok = res.status === 200 && res.body.matchFound && res.body.product?.name.includes('Samsung Galaxy S24 Ultra');
    assert(ok, `Reliance Digital URL identified as "${res.body.product?.name}" (Store: ${res.body.sourceStore?.storeName}, Confidence: ${res.body.confidenceScore}%)`);
  } catch (err) {
    assert(false, `Test 5 Error: ${err.message}`);
  }

  // TEST 6: Cross-Store Comparison & Multi-Store Price Aggregation
  console.log('\n--- Test 6: Cross-Store Price Comparison & Metrics ---');
  try {
    const res = await post('/api/products/compare-url', {
      url: 'https://www.amazon.in/dp/B09XS7JWHH'
    });
    const listings = res.body.listings || [];
    const stats = res.body.stats || {};
    const hasMultipleStores = listings.length >= 3;
    const hasLowestPrice = stats.lowestPrice > 0;
    const hasPriceDiff = stats.priceDifference >= 0;

    assert(hasMultipleStores, `Identified product compared across ${listings.length} store listings`);
    assert(hasLowestPrice, `Identified lowest price: ₹${stats.lowestPrice?.toLocaleString('en-IN')}`);
    assert(hasPriceDiff, `Price difference between stores computed: ₹${stats.priceDifference?.toLocaleString('en-IN')}`);
  } catch (err) {
    assert(false, `Test 6 Error: ${err.message}`);
  }

  // TEST 7: Invalid & Unsupported URL Handling + SSRF Guard
  console.log('\n--- Test 7: Invalid URL & SSRF Security Rejection ---');
  try {
    // 7a: Unsupported domain
    const resUnsupported = await post('/api/products/compare-url', {
      url: 'https://www.ebay.com/itm/123456789'
    });
    assert(resUnsupported.status === 400 && resUnsupported.body.message.includes('Unsupported shopping website'), 'Unsupported store correctly rejected with 400 Bad Request');

    // 7b: SSRF attempt to internal IP
    const resSSRF = await post('/api/products/compare-url', {
      url: 'http://127.0.0.1:5000/api/users'
    });
    assert(resSSRF.status === 400 && resSSRF.body.message.includes('Security Error'), 'SSRF attempt to localhost rejected with Security Error');

    // 7c: Malformed URL
    const resMalformed = await post('/api/products/compare-url', {
      url: 'just-some-random-text-not-a-url'
    });
    assert(resMalformed.status === 400 && resMalformed.body.message.includes('Invalid URL'), 'Malformed URL string correctly rejected');
  } catch (err) {
    assert(false, `Test 7 Error: ${err.message}`);
  }

  // TEST 8: Unmatched Product Fallback Handling
  console.log('\n--- Test 8: Unmatched Product Fallback Handling ---');
  try {
    const res = await post('/api/products/compare-url', {
      url: 'https://www.amazon.in/dp/B000000000'
    });
    assert(res.status === 200 && res.body.matchFound === false, 'Non-existent item cleanly returns matchFound: false');
    assert(Boolean(res.body.message) && Boolean(res.body.sourceStore), 'Fallback returns clear explanation and detected store');
  } catch (err) {
    assert(false, `Test 8 Error: ${err.message}`);
  }

  // TEST 9: Variant Isolation (Do NOT match different storage variants)
  console.log('\n--- Test 9: Product Variant Isolation ---');
  try {
    // Input specifies S24 Ultra 128GB, but database only has 256GB!
    const res = await post('/api/products/compare-url', {
      url: 'https://www.flipkart.com/samsung-galaxy-s24-ultra-5g-128-gb/p/itm12345678'
    });
    assert(res.body.matchFound === false, 'Different storage variant (128GB vs 256GB) strictly rejected from false match');
  } catch (err) {
    assert(false, `Test 9 Error: ${err.message}`);
  }

  // TEST 10: Watchlist & Alert on URL-Identified Product
  console.log('\n--- Test 10: Add to Watchlist & Set Alert on URL-Identified Product ---');
  try {
    // Log in as user
    const loginRes = await post('/api/auth/login', {
      email: 'user@pricetrack.com',
      password: 'UserPassword123!'
    });
    const token = loginRes.body?.token;
    assert(Boolean(token), 'User login succeeded to test user actions');

    if (token && identifiedProductId) {
      // Add to watchlist
      const watchRes = await post('/api/watchlist', {
        productId: identifiedProductId
      }, token);
      assert(watchRes.status === 200 || watchRes.status === 201, `URL-identified product successfully added to Watchlist (Status: ${watchRes.status})`);

      // Set price alert
      const alertRes = await post('/api/alerts', {
        productId: identifiedProductId,
        targetPrice: 28500
      }, token);
      assert(alertRes.status === 200 || alertRes.status === 201, `Target price alert set on URL-identified product (Status: ${alertRes.status})`);
    }
  } catch (err) {
    assert(false, `Test 10 Error: ${err.message}`);
  }

  console.log('\n============================================================');
  console.log(`TOTAL SCENARIO CHECKS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
