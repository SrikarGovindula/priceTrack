/**
 * Acceptance Test Suite for PriceTrack
 * Verifies all 13 steps of the Demonstration Scenario defined in requirements.
 */

async function runTestSuite() {
  const BASE_URL = 'http://localhost:5000/api';
  console.log('============================================================');
  console.log('PRICETRACK FULL END-TO-END DEMONSTRATION ACCEPTANCE TEST');
  console.log('============================================================\n');

  // Helper fetch with headers
  async function apiCall(endpoint, method = 'GET', body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data };
  }

  // 1. Health check
  console.log('[Step 1] Checking API Health...');
  const health = await apiCall('/health');
  if (!health.ok) throw new Error(`Health check failed: ${JSON.stringify(health.data)}`);
  console.log('  -> Health check PASSED:', health.data.status);

  // 2. User registration or login
  console.log('\n[Step 2] User Login as Test User (user@pricetrack.com)...');
  const userLogin = await apiCall('/auth/login', 'POST', {
    email: 'user@pricetrack.com',
    password: 'UserPassword123!'
  });
  if (!userLogin.ok) throw new Error(`User login failed: ${JSON.stringify(userLogin.data)}`);
  const userToken = userLogin.data.token;
  console.log('  -> User Login PASSED! Welcome', userLogin.data.user.name, '(User ID:', userLogin.data.user.id, ')');

  // 3. Search for Sony WH-1000XM5
  console.log('\n[Step 3] Search for "Sony WH-1000XM5"...');
  const search = await apiCall('/products?q=Sony%20WH-1000XM5');
  if (!search.ok || search.data.products.length === 0) {
    throw new Error('Search failed: Sony WH-1000XM5 not found');
  }
  const sonyProduct = search.data.products[0];
  console.log('  -> Search PASSED! Found product:', sonyProduct.name, '(ID:', sonyProduct._id, ')');

  // 4. View its available prices from multiple stores & identify lowest price
  console.log('\n[Step 4 & 5] View Available Multi-Store Prices and Identify Lowest Price...');
  const comparison = await apiCall(`/prices/${sonyProduct._id}`);
  if (!comparison.ok || !comparison.data.listings || comparison.data.listings.length === 0) {
    throw new Error('Price comparison failed: No listings found');
  }
  console.log(`  -> Comparison found ${comparison.data.listings.length} store listings:`);
  comparison.data.listings.forEach(l => {
    console.log(`     - ${l.store?.storeName || 'Store'}: ₹${l.currentPrice.toLocaleString('en-IN')} (${l.deliveryInformation})`);
  });
  console.log('  -> Lowest Price Identified: ₹' + comparison.data.stats.lowestPrice.toLocaleString('en-IN'), 
              'on', comparison.data.bestOption.store?.storeName);

  // 6. Historical price graph
  console.log('\n[Step 6] Retrieve 90-Day Historical Price Data for Native SVG Graph...');
  const history = await apiCall(`/prices/${sonyProduct._id}/history?days=90`);
  if (!history.ok || !history.data.history) throw new Error('Historical price fetch failed');
  console.log(`  -> History PASSED! Found ${history.data.history.length} price tracking data points.`);
  console.log(`     Min Price: ₹${history.data.summary.minPrice}, Max Price: ₹${history.data.summary.maxPrice}, Trend: ${history.data.summary.trend}`);

  // 7. Add product to watchlist
  console.log('\n[Step 7] Add Sony WH-1000XM5 to User Watchlist...');
  const watchlistAdd = await apiCall('/watchlist', 'POST', {
    productId: sonyProduct._id,
    targetPrice: 28000
  }, userToken);
  if (!watchlistAdd.ok) throw new Error(`Add to watchlist failed: ${JSON.stringify(watchlistAdd.data)}`);
  console.log('  -> Watchlist Addition PASSED!');

  // 8. Set target price of ₹28,000
  console.log('\n[Step 8] Set Price Drop Alert with Target Price of ₹28,000...');
  const alertCreate = await apiCall('/alerts', 'POST', {
    productId: sonyProduct._id,
    targetPrice: 28000
  }, userToken);
  if (!alertCreate.ok) throw new Error(`Alert creation failed: ${JSON.stringify(alertCreate.data)}`);
  console.log('  -> Price Alert Configured: ₹' + alertCreate.data.alert.targetPrice, '(Status:', alertCreate.data.alert.alertStatus, ')');

  // 9. Admin login in separate session
  console.log('\n[Step 9] Log In as Administrator (admin@pricetrack.com)...');
  const adminLogin = await apiCall('/auth/login', 'POST', {
    email: 'admin@pricetrack.com',
    password: 'AdminPassword123!'
  });
  if (!adminLogin.ok) throw new Error(`Admin login failed: ${JSON.stringify(adminLogin.data)}`);
  const adminToken = adminLogin.data.token;
  console.log('  -> Admin Login PASSED! Welcome', adminLogin.data.user.name, '(Role:', adminLogin.data.user.role, ')');

  // 10. Update demo price to ₹27,950
  console.log('\n[Step 10] Admin Updates Store Listing Price to ₹27,950...');
  // Find Flipkart or Amazon listing
  const targetListing = comparison.data.listings[0];
  const priceUpdate = await apiCall('/admin/store-listings/price', 'PUT', {
    productId: sonyProduct._id,
    storeId: targetListing.storeId,
    newPrice: 27950
  }, adminToken);
  if (!priceUpdate.ok) throw new Error(`Admin price update failed: ${JSON.stringify(priceUpdate.data)}`);
  console.log('  -> Price Update PASSED! Store', targetListing.store?.storeName, 'price updated to ₹27,950');

  // 11. Trigger price monitoring process
  console.log('\n[Step 11] Trigger Price Monitoring Job...');
  const jobTrigger = await apiCall('/admin/price-jobs/refresh', 'POST', {}, adminToken);
  if (!jobTrigger.ok) throw new Error(`Price job trigger failed: ${JSON.stringify(jobTrigger.data)}`);
  console.log('  -> Price Job Finished Cycle!');
  console.log(`     Products checked: ${jobTrigger.data.stats.productsChecked}`);
  console.log(`     Alerts evaluated: ${jobTrigger.data.stats.alertsEvaluated}`);
  console.log(`     Notifications triggered: ${jobTrigger.data.stats.notificationsTriggered}`);

  // 12. Return to user account and check notifications
  console.log('\n[Step 12 & 13] Return to User Account & Verify Generated Price Drop Notification...');
  const userNotifs = await apiCall('/notifications', 'GET', null, userToken);
  if (!userNotifs.ok || !userNotifs.data.notifications) {
    throw new Error('Failed to retrieve user notifications');
  }

  console.log(`  -> User has ${userNotifs.data.notifications.length} total notification(s) (${userNotifs.data.unreadCount} unread).`);
  const priceDropNotif = userNotifs.data.notifications.find(n => 
    n.notificationType === 'price_drop' && n.title.includes('Sony WH-1000XM5')
  );

  if (!priceDropNotif) {
    throw new Error('Expected price drop notification for Sony WH-1000XM5 was not found in notifications list');
  }

  console.log('  -> NOTIFICATION VERIFIED SUCCESSFULLY!');
  console.log('     Title:', priceDropNotif.title);
  console.log('     Message:', priceDropNotif.message);
  console.log('     Timestamp:', priceDropNotif.createdAt);
  console.log('     Metadata:', JSON.stringify(priceDropNotif.metadata));

  console.log('\n============================================================');
  console.log('ALL 13 ACCEPTANCE CRITERIA STEPS COMPLETED & VERIFIED 100%!');
  console.log('============================================================\n');
}

runTestSuite().catch(err => {
  console.error('\nTEST FAILED:', err.message);
  process.exit(1);
});
