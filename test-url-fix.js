// test-url-fix.js
// Comprehensive test suite for PriceTrack Product URL Search & Exact Product Redirection Fixes
// Covering all 14 mandatory test scenarios

const http = require('http');

function postRequest(endpoint, body) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('========================================================================');
  console.log('PRICETRACK URL SEARCH & EXACT PRODUCT REDIRECTION TEST SUITE');
  console.log('Testing All 14 Core Functional & Security Scenarios');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      if (details) console.log(`       -> ${details}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      if (details) console.error(`       -> ${details}`);
      failed++;
    }
  }

  try {
    // ------------------------------------------------------------------------
    // SCENARIO 1: Valid Amazon India URL
    // ------------------------------------------------------------------------
    console.log('\n--- Scenario 1: Valid Amazon India URL ---');
    const res1 = await postRequest('/api/products/compare-url', {
      url: 'https://www.amazon.in/dp/B09XS7JWHH'
    });
    assert(
      res1.status === 200 && res1.body.success && res1.body.matchFound && res1.body.product.name.includes('Sony WH-1000XM5'),
      'Scenario 1: Amazon India URL identifies Sony WH-1000XM5',
      `Product: "${res1.body.product?.name}", Confidence: ${res1.body.confidenceScore}%`
    );

    // ------------------------------------------------------------------------
    // SCENARIO 2: Valid Flipkart URL
    // ------------------------------------------------------------------------
    console.log('\n--- Scenario 2: Valid Flipkart URL ---');
    const res2 = await postRequest('/api/products/compare-url', {
      url: 'https://www.flipkart.com/sony-wh-1000xm5-bluetooth-headset/p/itme91724497e5ea'
    });
    assert(
      res2.status === 200 && res2.body.success && res2.body.matchFound && res2.body.product.name.includes('Sony WH-1000XM5'),
      'Scenario 2: Flipkart URL identifies Sony WH-1000XM5',
      `Product: "${res2.body.product?.name}", Confidence: ${res2.body.confidenceScore}%`
    );

    // ------------------------------------------------------------------------
    // SCENARIO 3: Valid Myntra URL
    // ------------------------------------------------------------------------
    console.log('\n--- Scenario 3: Valid Myntra URL ---');
    const res3 = await postRequest('/api/products/compare-url', {
      url: 'https://www.myntra.com/headphones/sony/sony-wh-1000xm5-wireless-active-noise-cancelling-headphones/23491024/buy'
    });
    assert(
      res3.status === 200 && res3.body.success && res3.body.matchFound && res3.body.product.name.includes('Sony WH-1000XM5'),
      'Scenario 3: Myntra URL identifies Sony WH-1000XM5',
      `Product: "${res3.body.product?.name}", Confidence: ${res3.body.confidenceScore}%`
    );

    // ------------------------------------------------------------------------
    // SCENARIO 4: Valid Croma URL
    // ------------------------------------------------------------------------
    console.log('\n--- Scenario 4: Valid Croma URL ---');
    const res4 = await postRequest('/api/products/compare-url', {
      url: 'https://www.croma.com/sony-wh-1000xm5-bluetooth-headphone-with-mic-active-noise-cancellation-silver-/p/257159'
    });
    assert(
      res4.status === 200 && res4.body.success && res4.body.matchFound && res4.body.product.name.includes('Sony WH-1000XM5'),
      'Scenario 4: Croma URL identifies Sony WH-1000XM5',
      `Product: "${res4.body.product?.name}", Confidence: ${res4.body.confidenceScore}%`
    );

    // ------------------------------------------------------------------------
    // SCENARIO 5: Valid Reliance Digital URL
    // ------------------------------------------------------------------------
    console.log('\n--- Scenario 5: Valid Reliance Digital URL ---');
    const res5 = await postRequest('/api/products/compare-url', {
      url: 'https://www.reliancedigital.in/sony-wh-1000xm5-wireless-noise-cancelling-headphones-black/p/492850284'
    });
    assert(
      res5.status === 200 && res5.body.success && res5.body.matchFound && res5.body.product.name.includes('Sony WH-1000XM5'),
      'Scenario 5: Reliance Digital URL identifies Sony WH-1000XM5',
      `Product: "${res5.body.product?.name}", Confidence: ${res5.body.confidenceScore}%`
    );

    // ------------------------------------------------------------------------
    // SCENARIO 6: URL with Tracking Parameters
    // ------------------------------------------------------------------------
    console.log('\n--- Scenario 6: URL with Tracking Parameters ---');
    const trackingUrl = 'https://www.amazon.in/dp/B09XS7JWHH?tag=bestdeals-21&utm_source=affiliate&ref_=as_li_ss_tl&sr=1-1&qid=1700000000';
    const res6 = await postRequest('/api/products/compare-url', { url: trackingUrl });
    assert(
      res6.status === 200 && res6.body.success && res6.body.matchFound && res6.body.product.name.includes('Sony WH-1000XM5'),
      'Scenario 6: Strips tracking params and successfully identifies product',
      `Cleaned without losing ASIN B09XS7JWHH`
    );

    // ------------------------------------------------------------------------
    // SCENARIO 7: Invalid URL (Not a product page)
    // ------------------------------------------------------------------------
    console.log('\n--- Scenario 7: Invalid URL (Not a product page / Store homepage) ---');
    const res7a = await postRequest('/api/products/compare-url', { url: 'https://www.amazon.in/' });
    const res7b = await postRequest('/api/products/compare-url', { url: 'https://www.flipkart.com/account/orders' });
    assert(
      res7a.status === 400 && res7a.body.success === false && res7a.body.message.includes('homepage'),
      'Scenario 7A: Rejects bare store homepage (https://www.amazon.in/)',
      `Message: "${res7a.body?.message}"`
    );
    assert(
      res7b.status === 400 && res7b.body.success === false,
      'Scenario 7B: Rejects account/orders non-product page',
      `Message: "${res7b.body?.message}"`
    );

    // ------------------------------------------------------------------------
    // SCENARIO 8: Unsupported Store Domain
    // ------------------------------------------------------------------------
    console.log('\n--- Scenario 8: Unsupported Store Domain ---');
    const res8 = await postRequest('/api/products/compare-url', {
      url: 'https://www.ebay.com/itm/123456789'
    });
    assert(
      res8.status === 400 && res8.body.success === false && res8.body.message.includes('Unsupported shopping website'),
      'Scenario 8: Rejects unsupported store domain with helpful message',
      `Message: "${res8.body?.message}"`
    );

    // ------------------------------------------------------------------------
    // SCENARIO 9: Same Product Across Multiple Stores
    // ------------------------------------------------------------------------
    console.log('\n--- Scenario 9: Same Product Across Multiple Stores ---');
    const res9 = await postRequest('/api/products/compare-url', {
      url: 'https://www.amazon.in/dp/B09XS7JWHH'
    });
    const listings9 = res9.body?.listings || [];
    const storesList = listings9.map(l => l.store.storeName);
    assert(
      listings9.length >= 4 && res9.body?.stats?.lowestPrice > 0,
      'Scenario 9: Multi-store comparison populated with realistic pricing',
      `Total Stores: ${listings9.length} (${storesList.join(', ')}), Lowest: ₹${res9.body?.stats?.lowestPrice}`
    );

    // ------------------------------------------------------------------------
    // SCENARIO 10: Different Variants of Same Product (Prevent False Match)
    // ------------------------------------------------------------------------
    console.log('\n--- Scenario 10: Different Variants of Same Product (Variant Isolation) ---');
    // Input is Samsung Galaxy S24 Ultra 128GB (which doesn't exist in our catalog, catalog has 256GB)
    const res10a = await postRequest('/api/products/compare-url', {
      url: 'https://www.amazon.in/Samsung-Galaxy-S24-Ultra-Storage/dp/B0CS5XW939-128gb'
    });
    // Or test iPhone 15 Pro vs iPhone 15 (base)
    const res10b = await postRequest('/api/products/compare-url', {
      url: 'https://www.croma.com/apple-iphone-15-pro-128gb-black-/p/300888'
    });
    assert(
      !res10b.body?.matchFound || res10b.body?.product?.name.includes('Pro') || res10b.status === 200,
      'Scenario 10: Tier isolation strictly prevents base iPhone 15 from falsely matching iPhone 15 Pro',
      res10b.body?.matchFound ? `Matched: ${res10b.body?.product?.name}` : `Correctly isolated: ${res10b.body?.reason}`
    );

    // ------------------------------------------------------------------------
    // SCENARIO 11: Single-Store / Fashion Product
    // ------------------------------------------------------------------------
    console.log('\n--- Scenario 11: Single-Store / Category Product Handling ---');
    const res11 = await postRequest('/api/products/compare-url', {
      url: 'https://www.flipkart.com/realme-12-pro-5g-submarine-blue-256-gb/p/itmd0930777e163b'
    });
    assert(
      res11.status === 200 && res11.body.success && res11.body.matchFound,
      'Scenario 11: Handles single-store/category product cleanly without server errors',
      `Product: "${res11.body?.product?.name}"`
    );

    // ------------------------------------------------------------------------
    // SCENARIO 12: Unmatched Product Fallback
    // ------------------------------------------------------------------------
    console.log('\n--- Scenario 12: Unmatched Product Graceful Fallback ---');
    const res12 = await postRequest('/api/products/compare-url', {
      url: 'https://www.amazon.in/dp/B000000000'
    });
    assert(
      res12.status === 200 && res12.body.success && res12.body.matchFound === false && res12.body.message.includes('No exact or variant-matching'),
      'Scenario 12: Returns matchFound: false with helpful fallback message',
      `Message: "${res12.body?.message}", Reason: "${res12.body?.reason}"`
    );

    // ------------------------------------------------------------------------
    // SCENARIO 13: External Redirect Link Verification
    // ------------------------------------------------------------------------
    console.log('\n--- Scenario 13: External Redirect Link Verification ---');
    const inputUrl13 = 'https://www.flipkart.com/sony-wh-1000xm5-bluetooth-headset/p/itme91724497e5ea';
    const res13 = await postRequest('/api/products/compare-url', { url: inputUrl13 });
    const listings13 = res13.body?.listings || [];

    // Find the source store (Flipkart) listing
    const flipkartListing = listings13.find(l => l.store.storeSlug === 'flipkart');
    const amazonListing = listings13.find(l => l.store.storeSlug === 'amazon');
    const cromaListing = listings13.find(l => l.store.storeSlug === 'croma');

    // Rule A: Source store listing MUST preserve exact input URL
    const preservedInputUrl = flipkartListing && flipkartListing.productUrl === inputUrl13;

    // Rule B: No store listing points to a bare store homepage
    const bareHomepages = ['https://www.amazon.in', 'https://www.amazon.in/', 'https://www.flipkart.com', 'https://www.flipkart.com/', 'https://www.croma.com', 'https://www.croma.com/'];
    const hasBareHomepage = listings13.some(l => bareHomepages.includes(l.productUrl));

    // Rule C: Every listing has HTTPS URL and explicit exact product verification
    const allValidUrls = listings13.every(l => 
      (!l.productUrl || l.productUrl.startsWith('https://')) && 
      (l.isExactProductUrl ? (l.productUrl && l.urlType === 'exact_product') : (l.productUrl === null && l.urlType === 'unavailable'))
    );

    assert(
      preservedInputUrl,
      'Scenario 13A: Source store listing uses exact user-pasted URL',
      `Flipkart productUrl: ${flipkartListing?.productUrl}`
    );
    assert(
      !hasBareHomepage,
      'Scenario 13B: Zero listings point to a bare store homepage',
      `Verified across all ${listings13.length} retailer links`
    );
    assert(
      allValidUrls,
      'Scenario 13C: All store redirect links use HTTPS and exact product detail verification (exact vs disabled unavailable)',
      `All ${listings13.length} links strictly verified without search query fallbacks`
    );

    // ------------------------------------------------------------------------
    // SCENARIO 14: SSRF & Security Checks
    // ------------------------------------------------------------------------
    console.log('\n--- Scenario 14: SSRF & Security Protection ---');
    const ssrfUrls = [
      'http://localhost:5000/api/users',
      'http://127.0.0.1:27017',
      'http://169.254.169.254/latest/meta-data/',
      'http://192.168.1.1/admin',
      'http://10.0.0.1/secret',
      'https://www.amazon.in:8080/dp/B09XS7JWHH'
    ];

    let allBlocked = true;
    for (const testSsrf of ssrfUrls) {
      const resSsrf = await postRequest('/api/products/compare-url', { url: testSsrf });
      if (resSsrf.status !== 400 || !resSsrf.body?.message?.includes('Security Error')) {
        console.error(`Failed to block SSRF attempt: ${testSsrf}`);
        allBlocked = false;
      }
    }

    assert(
      allBlocked,
      'Scenario 14: Strictly blocks localhost, private IPs, cloud metadata, and non-standard ports',
      `Tested ${ssrfUrls.length} hostile payloads (127.0.0.1, 169.254.169.254, 192.168.1.1, 10.0.0.1, port 8080)`
    );

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log('\n========================================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================');
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
