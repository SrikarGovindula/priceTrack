// test-exact-product-redirection.js
// Strict Test Suite for Exact Product Page Redirection Only (Zero Search Query URLs)
// Tests Amazon, Flipkart, Myntra, Croma, and Reliance Digital across multiple products

const http = require('http');
const https = require('https');
const { validateStoreProductUrl } = require('./backend/utils/urlValidator');

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
      res.on('data', chunk => { data += chunk; });
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

function getRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: endpoint,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runAudit() {
  console.log('========================================================================================');
  console.log('       PRICETRACK STRICT EXACT PRODUCT PAGE REDIRECTION AUDIT REPORT                   ');
  console.log('       ZERO SEARCH REDIRECTION • ZERO HOMEPAGE REDIRECTION • EXACT LINKS ONLY          ');
  console.log('========================================================================================\n');

  let passed = 0;
  let failed = 0;
  const auditReport = [];

  function recordResult(store, product, urlType, expectedDest, destination, status, pass) {
    if (pass) {
      passed++;
      console.log(`[PASS] ${store.padEnd(16)} | ${product.padEnd(30)} | ${urlType.padEnd(14)} -> ${status}`);
    } else {
      failed++;
      console.error(`[FAIL] ${store.padEnd(16)} | ${product.padEnd(30)} | ${urlType.padEnd(14)} -> ${status}`);
    }
    auditReport.push({
      Store: store,
      Product: product,
      'URL Type': urlType,
      'Expected Destination': expectedDest,
      'Actual Destination': destination,
      Status: status,
      Result: pass ? 'PASS' : 'FAIL'
    });
  }

  // 1. Audit Sony WH-1000XM5 across all 5 stores
  console.log('--- 1. Testing Sony WH-1000XM5 Comparison Across Stores ---');
  const resSony = await postRequest('/api/products/compare-url', {
    url: 'https://www.amazon.in/dp/B09XS7JWHH'
  });

  const sonyListings = resSony.body?.listings || [];
  for (const l of sonyListings) {
    const sName = l.store.storeName;
    const sSlug = l.store.storeSlug;
    const url = l.productUrl;
    const isExact = l.isExactProductUrl;

    if (isExact && url) {
      const v = validateStoreProductUrl(sSlug, url);
      const isSearch = url.includes('/search') || url.includes('/s?k=') || url.includes('dsearch') || url.includes('searchB');
      const isHome = url === 'https://www.amazon.in' || url === 'https://www.flipkart.com' || url === 'https://www.croma.com' || url === 'https://www.reliancedigital.in' || url === 'https://www.myntra.com';

      if (!isSearch && !isHome && v.isValid && v.isExactProductUrl) {
        recordResult(sName, 'Sony WH-1000XM5', 'Exact detail', 'Exact product details', url, 'Exact Product Page', true);
      } else {
        recordResult(sName, 'Sony WH-1000XM5', 'Exact detail', 'Exact product details', url, isSearch ? 'Search Results (FORBIDDEN)' : 'Invalid', false);
      }
    } else {
      recordResult(sName, 'Sony WH-1000XM5', 'Unavailable', 'Disabled button', 'null', 'Exact product link unavailable', true);
    }
  }

  // 2. Audit Apple iPhone 15 (128GB, Black)
  console.log('\n--- 2. Testing Apple iPhone 15 Across Stores ---');
  const resIphone = await postRequest('/api/products/compare-url', {
    url: 'https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485515ae4'
  });

  const iphoneListings = resIphone.body?.listings || [];
  for (const l of iphoneListings) {
    const sName = l.store.storeName;
    const sSlug = l.store.storeSlug;
    const url = l.productUrl;
    const isExact = l.isExactProductUrl;

    if (isExact && url) {
      const v = validateStoreProductUrl(sSlug, url);
      const isSearch = url.includes('/search') || url.includes('/s?k=') || url.includes('dsearch') || url.includes('searchB');
      if (!isSearch && v.isValid && v.isExactProductUrl) {
        recordResult(sName, 'Apple iPhone 15 128GB', 'Exact detail', 'Exact product details', url, 'Exact Product Page', true);
      } else {
        recordResult(sName, 'Apple iPhone 15 128GB', 'Exact detail', 'Exact product details', url, 'Failed', false);
      }
    } else {
      recordResult(sName, 'Apple iPhone 15 128GB', 'Unavailable', 'Disabled button', 'null', 'Exact product link unavailable', true);
    }
  }

  // 3. Audit Samsung Galaxy S24 Ultra 5G (256GB)
  console.log('\n--- 3. Testing Samsung Galaxy S24 Ultra Across Stores ---');
  const resS24 = await postRequest('/api/products/compare-url', {
    url: 'https://www.croma.com/samsung-galaxy-s24-ultra-5g-256gb-12gb-ram-titanium-gray-/p/304445'
  });

  const s24Listings = resS24.body?.listings || [];
  for (const l of s24Listings) {
    const sName = l.store.storeName;
    const sSlug = l.store.storeSlug;
    const url = l.productUrl;
    const isExact = l.isExactProductUrl;

    if (isExact && url) {
      const v = validateStoreProductUrl(sSlug, url);
      const isSearch = url.includes('/search') || url.includes('/s?k=') || url.includes('dsearch') || url.includes('searchB');
      if (!isSearch && v.isValid && v.isExactProductUrl) {
        recordResult(sName, 'Samsung Galaxy S24 Ultra', 'Exact detail', 'Exact product details', url, 'Exact Product Page', true);
      } else {
        recordResult(sName, 'Samsung Galaxy S24 Ultra', 'Exact detail', 'Exact product details', url, 'Failed', false);
      }
    } else {
      recordResult(sName, 'Samsung Galaxy S24 Ultra', 'Unavailable', 'Disabled button', 'null', 'Exact product link unavailable', true);
    }
  }

  // 4. Audit Apple Watch Series 9 GPS 45mm
  console.log('\n--- 4. Testing Apple Watch Series 9 Across Stores ---');
  const resWatch = await postRequest('/api/products/compare-url', {
    url: 'https://www.reliancedigital.in/apple-watch-series-9-gps-45mm-midnight-aluminium-case-with-midnight-sport-band/p/493839841'
  });

  const watchListings = resWatch.body?.listings || [];
  for (const l of watchListings) {
    const sName = l.store.storeName;
    const sSlug = l.store.storeSlug;
    const url = l.productUrl;
    const isExact = l.isExactProductUrl;

    if (isExact && url) {
      const v = validateStoreProductUrl(sSlug, url);
      const isSearch = url.includes('/search') || url.includes('/s?k=') || url.includes('dsearch') || url.includes('searchB');
      if (!isSearch && v.isValid && v.isExactProductUrl) {
        recordResult(sName, 'Apple Watch Series 9', 'Exact detail', 'Exact product details', url, 'Exact Product Page', true);
      } else {
        recordResult(sName, 'Apple Watch Series 9', 'Exact detail', 'Exact product details', url, 'Failed', false);
      }
    } else {
      recordResult(sName, 'Apple Watch Series 9', 'Unavailable', 'Disabled button', 'null', 'Exact product link unavailable', true);
    }
  }

  // 5. Audit Search URL Rejection
  console.log('\n--- 5. Testing Immediate Rejection of Search Query URLs ---');
  const searchTestUrls = [
    'https://www.amazon.in/s?k=sony+headphones',
    'https://www.flipkart.com/search?q=iphone+15',
    'https://www.croma.com/searchB?q=macbook',
    'https://www.reliancedigital.in/search?q=galaxy:relevance',
    'https://www.myntra.com/dsearch?rawQuery=apple+watch'
  ];

  for (const surl of searchTestUrls) {
    const res = await postRequest('/api/products/compare-url', { url: surl });
    const isRejected = res.status === 400 && res.body?.message?.includes('Search-results URLs are not supported');
    if (isRejected) {
      passed++;
      console.log(`[PASS] Search URL rejected: ${surl}`);
    } else {
      failed++;
      console.error(`[FAIL] Search URL was NOT rejected: ${surl} -> Status: ${res.status}`);
    }
  }

  // 6. Audit Catalog Single Product Page API Endpoint
  console.log('\n--- 6. Testing Catalog Product Detail API Redirection Compliance ---');
  const sampleRes = await getRequest('/api/products');
  const sampleId = sampleRes.body?.products?.[0]?._id;
  if (sampleId) {
    const prodDetailRes = await getRequest(`/api/products/${sampleId}`);
    const listings = prodDetailRes.body?.product?.listings || [];
    let hasAnySearchUrl = false;
    listings.forEach(l => {
      if (l.productUrl && (l.productUrl.includes('/search') || l.productUrl.includes('/s?k=') || l.productUrl.includes('dsearch'))) {
        hasAnySearchUrl = true;
      }
    });

    if (!hasAnySearchUrl && listings.length > 0) {
      passed++;
      console.log(`[PASS] Catalog Product API listings strictly free of search URLs (${listings.length} stores checked)`);
    } else {
      failed++;
      console.error('[FAIL] Catalog Product API contained search URLs!');
    }
  }

  console.log('\n========================================================================================');
  console.log(`AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================================\n');

  console.log('Summary Table:');
  console.table(auditReport);

  process.exit(failed > 0 ? 1 : 0);
}

runAudit();
