import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import SvgIcon from '../components/SvgIcon';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshingJob, setRefreshingJob] = useState(false);
  const [jobReport, setJobReport] = useState(null);

  // Price Override Form State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [overridePrice, setOverridePrice] = useState('');
  const [overrideLoading, setOverrideLoading] = useState(false);
  const [overrideMessage, setOverrideMessage] = useState('');

  // Active Admin Tab
  const [adminTab, setAdminTab] = useState('overview');

  const { showToast } = useNotifications();

  const loadAdminData = useCallback(async () => {
    try {
      setLoading(true);
      const [dashRes, usersRes, storesRes, prodsRes] = await Promise.all([
        api.getAdminDashboard(),
        api.getAdminUsers(),
        api.getAdminStores(),
        api.getProducts({ limit: 50 })
      ]);

      if (dashRes?.stats) setStats(dashRes.stats);
      if (usersRes?.users) setUsers(usersRes.users);
      if (storesRes?.stores) setStores(storesRes.stores);
      if (prodsRes?.products) {
        setProducts(prodsRes.products);
        // Pre-select Sony WH-1000XM5 if found
        const sony = prodsRes.products.find(p => p.modelNumber === 'WH1000XM5');
        if (sony) {
          setSelectedProductId(sony._id);
        } else if (prodsRes.products.length > 0) {
          setSelectedProductId(prodsRes.products[0]._id);
        }
      }

      if (storesRes?.stores?.length > 0) {
        // Pre-select Flipkart or first store
        const flipkart = storesRes.stores.find(s => s.storeSlug === 'flipkart');
        setSelectedStoreId(flipkart ? flipkart._id : storesRes.stores[0]._id);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load administrator data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  // Handle Price Override (Acceptance Test Step 10: update price to ₹27,950)
  const handlePriceUpdate = async (e) => {
    e.preventDefault();
    if (!selectedProductId || !selectedStoreId || !overridePrice) {
      setOverrideMessage('Please select product, store and specify the new price.');
      return;
    }

    setOverrideLoading(true);
    setOverrideMessage('');
    try {
      const res = await api.updateStoreListingPrice(selectedProductId, selectedStoreId, Number(overridePrice));
      setOverrideMessage(`Success: ${res.message}`);
      showToast(`Price updated to ₹${Number(overridePrice).toLocaleString('en-IN')}`, 'success');
      loadAdminData();
    } catch (err) {
      setOverrideMessage(`Error: ${err.message}`);
      showToast(err.message || 'Failed to update store price', 'error');
    } finally {
      setOverrideLoading(false);
    }
  };

  // Handle Manual Trigger Price Refresh (Acceptance Test Step 11: Trigger price monitoring process)
  const handleTriggerRefresh = async () => {
    setRefreshingJob(true);
    setJobReport(null);
    try {
      const res = await api.triggerPriceRefresh();
      if (res && res.stats) {
        setJobReport(res.stats);
        showToast(`Price check complete: ${res.stats.notificationsTriggered} notification(s) triggered!`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to trigger price refresh job', 'error');
    } finally {
      setRefreshingJob(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '48px 20px' }}>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '32px 20px 64px' }}>
      {/* Header */}
      <div className="dashboard-header" style={{ marginBottom: '24px' }}>
        <div>
          <div className="badge badge-primary" style={{ marginBottom: '4px' }}>
            System Administrator Control Center
          </div>
          <h2>PriceTrack Operations Portal</h2>
          <p style={{ fontSize: '14px' }}>
            Inspect system collections, manage product feed pricing, and trigger automated price check evaluations.
          </p>
        </div>

        <div className="quick-actions-bar">
          <Link to="/" className="btn btn-secondary btn-sm">
            <SvgIcon name="store" size={14} /> Storefront
          </Link>
          <Link to="/dashboard" className="btn btn-secondary btn-sm">
            <SvgIcon name="user" size={14} /> User Dashboard
          </Link>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleTriggerRefresh}
            disabled={refreshingJob}
          >
            <SvgIcon name="refresh" size={15} />
            {refreshingJob ? 'Running Price Check...' : 'Trigger Price Refresh'}
          </button>
        </div>
      </div>

      {/* Manual Trigger Status Notice if just ran */}
      {jobReport && (
        <div className="alert-box alert-box-success" style={{ marginBottom: '24px' }}>
          <SvgIcon name="check" size={18} />
          <div>
            <strong>Price Monitoring Cycle Completed:</strong> Checked {jobReport.productsChecked} products, evaluated {jobReport.alertsEvaluated} alerts, generated <strong>{jobReport.notificationsTriggered} notification(s)</strong>.
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="metrics-grid" style={{ marginBottom: '32px' }}>
        <div className="metric-card">
          <div className="metric-icon-wrap">
            <SvgIcon name="user" size={20} />
          </div>
          <div>
            <div className="metric-value">{stats?.totalUsers || 0}</div>
            <div className="metric-label">Registered Users</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
            <SvgIcon name="tag" size={20} />
          </div>
          <div>
            <div className="metric-value">{stats?.totalProducts || 0}</div>
            <div className="metric-label">Catalog Products</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
            <SvgIcon name="store" size={20} />
          </div>
          <div>
            <div className="metric-value">{stats?.totalStores || 0}</div>
            <div className="metric-label">Integrated Stores</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
            <SvgIcon name="bell" size={20} />
          </div>
          <div>
            <div className="metric-value">{stats?.activeAlerts || 0}</div>
            <div className="metric-label">Active Price Alerts</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap">
            <SvgIcon name="heart" size={20} />
          </div>
          <div>
            <div className="metric-value">{stats?.totalWatchlistEntries || 0}</div>
            <div className="metric-label">Watchlist Entries</div>
          </div>
        </div>
      </div>

      {/* Admin Test Action: Price Override Box */}
      <div className="admin-override-box" style={{ marginBottom: '32px' }}>
        <div className="admin-override-title">
          <SvgIcon name="sliders" size={18} color="var(--color-primary)" />
          Price Feed Override (Demonstration Control)
        </div>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '18px' }}>
          Simulate a market price change for testing price drop evaluations. For example, change Sony WH-1000XM5 on Flipkart to ₹27,950 to trigger the ₹28,000 user alert.
        </p>

        <form onSubmit={handlePriceUpdate}>
          <div className="admin-form-grid">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="adminProductSelect">Select Product</label>
              <select
                id="adminProductSelect"
                className="form-select"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                required
              >
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.brand})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="adminStoreSelect">Select Store</label>
              <select
                id="adminStoreSelect"
                className="form-select"
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
                required
              >
                {stores.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.storeName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="adminPriceInput">New Price (₹)</label>
              <input
                id="adminPriceInput"
                type="number"
                className="form-input"
                placeholder="e.g. 27950"
                value={overridePrice}
                onChange={(e) => setOverridePrice(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setOverridePrice('27950')}
                title="Quick fill demonstration scenario price"
              >
                Set ₹27,950
              </button>
              <button type="submit" className="btn btn-primary" disabled={overrideLoading}>
                {overrideLoading ? 'Updating...' : 'Update Listing Price'}
              </button>
            </div>
          </div>
        </form>

        {overrideMessage && (
          <div style={{ marginTop: '14px', fontSize: '13px', fontWeight: 600, color: overrideMessage.startsWith('Success') ? 'var(--color-success)' : 'var(--color-danger)' }}>
            {overrideMessage}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2" style={{ marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px', flexWrap: 'wrap' }}>
        <button
          className={`btn btn-sm ${adminTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setAdminTab('overview')}
        >
          Recent Store Updates
        </button>
        <button
          className={`btn btn-sm ${adminTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setAdminTab('products')}
        >
          Catalog Products ({products.length})
        </button>
        <button
          className={`btn btn-sm ${adminTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setAdminTab('users')}
        >
          User Accounts ({users.length})
        </button>
        <button
          className={`btn btn-sm ${adminTab === 'stores' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setAdminTab('stores')}
        >
          Integrated Stores ({stores.length})
        </button>
      </div>

      {/* Recent Listings Tab */}
      {adminTab === 'overview' && (
        <div className="data-table-card">
          <div className="data-table-header">
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Recently Updated Store Listings</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Store</th>
                <th>Current Price</th>
                <th>Original Price</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentListings?.map((l) => (
                <tr key={l._id}>
                  <td style={{ fontWeight: 600 }}>
                    <Link to={`/product/${l.product?._id}`} style={{ color: 'var(--color-primary)' }}>
                      {l.product?.name}
                    </Link>
                  </td>
                  <td>{l.store?.storeName}</td>
                  <td style={{ fontWeight: 700, color: 'var(--color-success)' }}>₹{l.currentPrice.toLocaleString('en-IN')}</td>
                  <td>₹{(l.originalPrice || l.currentPrice).toLocaleString('en-IN')}</td>
                  <td style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    {new Date(l.lastUpdated || l.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Products Tab */}
      {adminTab === 'products' && (
        <div className="data-table-card">
          <div className="data-table-header">
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Catalog Products</h3>
            <Link to="/search" className="btn btn-primary btn-sm">
              <SvgIcon name="search" size={13} /> Browse Storefront Catalog
            </Link>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Model</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td style={{ fontWeight: 600 }}>
                    <Link to={`/product/${p._id}`} style={{ color: 'var(--color-text)' }}>
                      {p.name}
                    </Link>
                  </td>
                  <td>{p.brand}</td>
                  <td><span className="badge badge-primary">{p.category}</span></td>
                  <td><code>{p.modelNumber || 'N/A'}</code></td>
                  <td>
                    <div className="flex gap-2">
                      <Link to={`/product/${p._id}`} className="btn btn-secondary btn-sm">
                        View & Compare
                      </Link>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedProductId(p._id);
                          window.scrollTo({ top: 350, behavior: 'smooth' });
                        }}
                      >
                        Override Price
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Users Tab */}
      {adminTab === 'users' && (
        <div className="data-table-card">
          <div className="data-table-header">
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>User Accounts</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Registered Date</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-demo'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stores Tab */}
      {adminTab === 'stores' && (
        <div className="data-table-card">
          <div className="data-table-header">
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Registered Retail Store Feeds</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Store Name</th>
                <th>Slug</th>
                <th>Website</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((s) => (
                <tr key={s._id}>
                  <td style={{ fontWeight: 600 }}>{s.storeName}</td>
                  <td><code>{s.storeSlug}</code></td>
                  <td>
                    <a href={s.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>
                      {s.website}
                    </a>
                  </td>
                  <td>
                    <span className="badge badge-success">Active Feed</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
