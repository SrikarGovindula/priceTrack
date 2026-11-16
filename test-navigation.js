// test-navigation.js
// Automated verification of PriceTrack navigation, redirection, frontend routes, and API endpoints

const http = require('http');
const fs = require('fs');
const path = require('path');

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = null;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data,
          json
        });
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('   PRICETRACK NAVIGATION & REDIRECTION TEST SUITE   ');
  console.log('====================================================\n');

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

  // TEST SUITE 1: FRONTEND ROUTE ACCESSIBILITY (SPA ROUTING & REFRESH)
  console.log('\n--- 1. Testing Frontend Route Serving (Vite SPA Fallback) ---');
  const frontendRoutes = [
    '/',
    '/search',
    '/compare',
    '/history',
    '/deals',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/dashboard',
    '/watchlist',
    '/alerts',
    '/admin'
  ];

  for (const route of frontendRoutes) {
    try {
      const res = await request(`http://localhost:3000${route}`);
      assert(res.status === 200 && res.data.includes('<div id="root">'), `Route ${route} serves SPA index.html (Status: ${res.status})`);
    } catch (err) {
      assert(false, `Route ${route} failed to load: ${err.message}`);
    }
  }

  // TEST SUITE 2: BACKEND API ENDPOINTS BACKING PAGES
  console.log('\n--- 2. Testing Public Backend Endpoints Backing Pages ---');
  let sampleProductId = null;
  try {
    const health = await request('http://localhost:5000/api/health');
    assert(health.status === 200 && health.json?.status === 'ok', 'GET /api/health returned OK');

    const products = await request('http://localhost:5000/api/products?limit=5');
    assert(products.status === 200 && Array.isArray(products.json?.products), 'GET /api/products returns product array');
    if (products.json?.products?.length > 0) {
      sampleProductId = products.json.products[0]._id;
    }

    const categories = await request('http://localhost:5000/api/products/categories');
    assert(categories.status === 200 && Array.isArray(categories.json?.categories), 'GET /api/products/categories returns categories');

    const brands = await request('http://localhost:5000/api/products/brands');
    assert(brands.status === 200 && Array.isArray(brands.json?.brands), 'GET /api/products/brands returns brands');

    const deals = await request('http://localhost:5000/api/products/deals');
    assert(deals.status === 200 && Array.isArray(deals.json?.deals), 'GET /api/products/deals returns deals list');

    const trending = await request('http://localhost:5000/api/products/trending');
    assert(trending.status === 200 && Array.isArray(trending.json?.trending), 'GET /api/products/trending returns trending list');

    if (sampleProductId) {
      const prodRes = await request(`http://localhost:5000/api/products/${sampleProductId}`);
      assert(prodRes.status === 200 && prodRes.json?.product?.name, `GET /api/products/:id returns "${prodRes.json?.product?.name?.substring(0, 30)}..."`);

      const histRes = await request(`http://localhost:5000/api/prices/${sampleProductId}/history?days=30`);
      assert(histRes.status === 200 && Array.isArray(histRes.json?.history), 'GET /api/prices/:id/history returns price history points');

      const compareRes = await request(`http://localhost:5000/api/prices/${sampleProductId}`);
      assert(compareRes.status === 200 && Array.isArray(compareRes.json?.listings), 'GET /api/prices/:id returns multi-store comparison records');
    }
  } catch (err) {
    assert(false, `Public API endpoint testing failed: ${err.message}`);
  }

  // TEST SUITE 3: AUTHENTICATION, PROTECTED ROUTES & REDIRECTION
  console.log('\n--- 3. Testing Auth Guards, Protected Routes & Roles ---');
  let userToken = null;
  let adminToken = null;

  try {
    // 3a. Unauthenticated access blocked
    const unauthWatchlist = await request('http://localhost:5000/api/watchlist');
    assert(unauthWatchlist.status === 401, 'Unauthenticated request to /api/watchlist correctly returns 401 Unauthorized');

    const unauthAdmin = await request('http://localhost:5000/api/admin/dashboard');
    assert(unauthAdmin.status === 401, 'Unauthenticated request to /api/admin/dashboard correctly returns 401 Unauthorized');

    // 3b. Regular User Login (using seeded demo credentials)
    const loginRes = await request('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@pricetrack.com', password: 'UserPassword123!' })
    });
    assert(loginRes.status === 200 && loginRes.json?.token, 'Regular user login succeeded and returned session token');
    userToken = loginRes.json?.token;

    // 3c. Regular User Access Protected User Route
    const userProfile = await request('http://localhost:5000/api/auth/me', {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    assert(userProfile.status === 200 && userProfile.json?.user?.email === 'user@pricetrack.com', 'Authenticated user can access /api/auth/me');

    const userWatchlist = await request('http://localhost:5000/api/watchlist', {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    assert(userWatchlist.status === 200 && Array.isArray(userWatchlist.json?.watchlist), 'Authenticated user can access /api/watchlist');

    const userAlerts = await request('http://localhost:5000/api/alerts', {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    assert(userAlerts.status === 200 && Array.isArray(userAlerts.json?.alerts), 'Authenticated user can access /api/alerts');

    // 3d. Regular User Forbidden From Admin Route
    const userForbiddenAdmin = await request('http://localhost:5000/api/admin/dashboard', {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    assert(userForbiddenAdmin.status === 403, 'Regular user accessing /api/admin/dashboard correctly receives 403 Forbidden');

    // 3e. Admin User Login (using seeded admin credentials)
    const adminLoginRes = await request('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@pricetrack.com', password: 'AdminPassword123!' })
    });
    assert(adminLoginRes.status === 200 && adminLoginRes.json?.user?.role === 'admin', 'Admin login succeeded with role admin');
    adminToken = adminLoginRes.json?.token;

    // 3f. Admin User Access Admin Endpoints
    const adminDashboard = await request('http://localhost:5000/api/admin/dashboard', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(adminDashboard.status === 200 && adminDashboard.json?.stats?.totalProducts > 0, 'Admin can access /api/admin/dashboard');

    const adminUsers = await request('http://localhost:5000/api/admin/users', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(adminUsers.status === 200 && Array.isArray(adminUsers.json?.users), 'Admin can access /api/admin/users table');

  } catch (err) {
    assert(false, `Auth testing failed: ${err.message}`);
  }

  // TEST SUITE 4: EXTERNAL LINKS & SECURE REL SPECIFICATIONS
  console.log('\n--- 4. Codebase Link & Route Architecture Checks ---');
  const footerPath = path.join(__dirname, 'frontend', 'src', 'components', 'Footer.jsx');
  const footerContent = fs.readFileSync(footerPath, 'utf8');
  assert(
    footerContent.includes('target="_blank"') &&
    footerContent.includes('rel="noopener noreferrer"') &&
    footerContent.includes('https://www.amazon.in'),
    'Footer external store links use valid HTTPS and target="_blank" rel="noopener noreferrer"'
  );

  const priceTablePath = path.join(__dirname, 'frontend', 'src', 'components', 'PriceComparisonTable.jsx');
  const priceTableContent = fs.readFileSync(priceTablePath, 'utf8');
  assert(
    priceTableContent.includes('target="_blank"') &&
    priceTableContent.includes('rel="noopener noreferrer"') &&
    priceTableContent.includes('validateStoreProductUrl'),
    'PriceComparisonTable safe external URL sanitizer with target="_blank" rel="noopener noreferrer"'
  );

  const navbarPath = path.join(__dirname, 'frontend', 'src', 'components', 'Navbar.jsx');
  const navbarContent = fs.readFileSync(navbarPath, 'utf8');
  assert(
    navbarContent.includes('to="/history"') &&
    navbarContent.includes('Compare Prices'),
    'Navbar contains Price History and Compare Prices navigation'
  );

  const appPath = path.join(__dirname, 'frontend', 'src', 'App.jsx');
  const appContent = fs.readFileSync(appPath, 'utf8');
  assert(
    appContent.includes('path="/history"') &&
    appContent.includes('path="/history/:id"') &&
    appContent.includes('path="/compare"') &&
    appContent.includes('path="*"'),
    'App.jsx router defines /history, /history/:id, /compare redirect, and catch-all router fallback'
  );

  const cardPath = path.join(__dirname, 'frontend', 'src', 'components', 'ProductCard.jsx');
  const cardContent = fs.readFileSync(cardPath, 'utf8');
  assert(
    cardContent.includes('to={`/product/${product._id}`}') &&
    cardContent.includes('to={`/search?brand='),
    'ProductCard has clickable image wrapper, product title, View Details button, and brand link'
  );

  console.log('\n====================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
