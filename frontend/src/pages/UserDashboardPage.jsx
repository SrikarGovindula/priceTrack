import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { api } from '../services/api';
import SvgIcon from '../components/SvgIcon';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function UserDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';

  const { user, updateProfile } = useAuth();
  const { notifications, unreadCount, markAsRead, clearAll, showToast } = useNotifications();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [watchlist, setWatchlist] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync tab with URL search parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'watchlist', 'alerts', 'notifications', 'profile'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Profile form
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      const [wlRes, alRes] = await Promise.all([
        api.getWatchlist(),
        api.getAlerts()
      ]);
      if (wlRes?.watchlist) setWatchlist(wlRes.watchlist);
      if (alRes?.alerts) setAlerts(alRes.alerts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    setSavingProfile(true);
    try {
      await updateProfile(nameInput.trim());
      showToast('Profile updated successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const activeAlertsCount = alerts.filter(a => a.alertStatus === 'active').length;
  const triggeredAlertsCount = alerts.filter(a => a.alertStatus === 'triggered').length;

  return (
    <div className="container">
      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="dashboard-user-card">
            <div className="dashboard-user-name">{user?.name}</div>
            <div className="dashboard-user-email">{user?.email}</div>
            <span className="badge badge-primary" style={{ marginTop: '8px' }}>
              {user?.role === 'admin' ? 'Administrator' : 'Standard Account'}
            </span>
          </div>

          <ul className="dashboard-nav-list">
            <li
              className={`dashboard-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => switchTab('overview')}
            >
              <SvgIcon name="chart" size={16} /> Overview
            </li>
            <li
              className={`dashboard-nav-item ${activeTab === 'watchlist' ? 'active' : ''}`}
              onClick={() => switchTab('watchlist')}
            >
              <SvgIcon name="heart" size={16} /> My Watchlist ({watchlist.length})
            </li>
            <li
              className={`dashboard-nav-item ${activeTab === 'alerts' ? 'active' : ''}`}
              onClick={() => switchTab('alerts')}
            >
              <SvgIcon name="bell" size={16} /> Price Alerts ({alerts.length})
            </li>
            <li
              className={`dashboard-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => switchTab('notifications')}
            >
              <SvgIcon name="tag" size={16} /> Notifications ({unreadCount})
            </li>
            <li
              className={`dashboard-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => switchTab('profile')}
            >
              <SvgIcon name="user" size={16} /> Profile Settings
            </li>
          </ul>
        </aside>

        {/* Content Area */}
        <main className="dashboard-content">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              <div className="dashboard-header">
                <div>
                  <h2>Welcome back, {user?.name.split(' ')[0]}</h2>
                  <p style={{ fontSize: '14px' }}>
                    Real-time monitoring summary of your watched electronics and price drop alerts.
                  </p>
                </div>
                <div className="quick-actions-bar">
                  <Link to="/search" className="btn btn-primary btn-sm">
                    <SvgIcon name="search" size={14} /> Search Products
                  </Link>
                  <Link to="/search" className="btn btn-secondary btn-sm">
                    <SvgIcon name="store" size={14} /> Compare Prices
                  </Link>
                  <button className="btn btn-secondary btn-sm" onClick={() => switchTab('watchlist')}>
                    <SvgIcon name="heart" size={14} /> My Watchlist
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => switchTab('alerts')}>
                    <SvgIcon name="bell" size={14} /> Price Alerts
                  </button>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="metrics-grid">
                <div
                  className="metric-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => switchTab('watchlist')}
                  title="View watched products"
                >
                  <div className="metric-icon-wrap">
                    <SvgIcon name="heart" size={20} />
                  </div>
                  <div>
                    <div className="metric-value">{watchlist.length}</div>
                    <div className="metric-label">Watched Products</div>
                  </div>
                </div>

                <div
                  className="metric-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => switchTab('alerts')}
                  title="View active alerts"
                >
                  <div className="metric-icon-wrap">
                    <SvgIcon name="bell" size={20} />
                  </div>
                  <div>
                    <div className="metric-value">{activeAlertsCount}</div>
                    <div className="metric-label">Active Price Alerts</div>
                  </div>
                </div>

                <div
                  className="metric-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => switchTab('alerts')}
                  title="View triggered alerts"
                >
                  <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                    <SvgIcon name="trending" size={20} />
                  </div>
                  <div>
                    <div className="metric-value">{triggeredAlertsCount}</div>
                    <div className="metric-label">Target Drops Reached</div>
                  </div>
                </div>

                <div
                  className="metric-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => switchTab('notifications')}
                  title="View notifications"
                >
                  <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
                    <SvgIcon name="tag" size={20} />
                  </div>
                  <div>
                    <div className="metric-value">{notifications.length}</div>
                    <div className="metric-label">Notifications Logged</div>
                  </div>
                </div>
              </div>

              {/* Recent Watchlist Preview */}
              <div className="data-table-card">
                <div className="data-table-header">
                  <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Recent Watchlist Items</h3>
                  <button className="btn btn-secondary btn-sm" onClick={() => switchTab('watchlist')}>
                    View All
                  </button>
                </div>

                {watchlist.length === 0 ? (
                  <div className="empty-state" style={{ padding: '32px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>No products in your watchlist yet.</div>
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Current Lowest</th>
                        <th>Target Price</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {watchlist.slice(0, 4).map((item) => (
                        <tr key={item._id}>
                          <td>
                            <Link to={`/product/${item.product?._id}`} style={{ fontWeight: 600 }}>
                              {item.product?.name}
                            </Link>
                          </td>
                          <td style={{ fontWeight: 700 }}>
                            ₹{(item.currentLowestPrice || item.product?.lowestPrice || 0).toLocaleString('en-IN')}
                          </td>
                          <td>
                            {item.targetPrice ? `₹${item.targetPrice.toLocaleString('en-IN')}` : 'Not set'}
                          </td>
                          <td>
                            <Link to={`/product/${item.product?._id}`} className="btn btn-secondary btn-sm">
                              Compare
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* Watchlist Tab */}
          {activeTab === 'watchlist' && (
            <div className="data-table-card">
              <div className="data-table-header">
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>My Watched Products</h3>
                <Link to="/search" className="btn btn-primary btn-sm">
                  Add More
                </Link>
              </div>

              {watchlist.length === 0 ? (
                <div className="empty-state">
                  <SvgIcon name="heart" size={28} />
                  <div className="empty-state-title">No watched products</div>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Current Lowest</th>
                      <th>Target Price</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {watchlist.map((item) => (
                      <tr key={item._id}>
                        <td>
                          <Link to={`/product/${item.product?._id}`} style={{ fontWeight: 600 }}>
                            {item.product?.name}
                          </Link>
                        </td>
                        <td style={{ fontWeight: 700 }}>
                          ₹{(item.currentLowestPrice || item.product?.lowestPrice || 0).toLocaleString('en-IN')}
                        </td>
                        <td>
                          {item.targetPrice ? `₹${item.targetPrice.toLocaleString('en-IN')}` : 'None'}
                        </td>
                        <td>
                          <Link to={`/product/${item.product?._id}`} className="btn btn-secondary btn-sm">
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="data-table-card">
              <div className="data-table-header">
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>My Configured Price Alerts</h3>
              </div>

              {alerts.length === 0 ? (
                <div className="empty-state">
                  <SvgIcon name="bell" size={28} />
                  <div className="empty-state-title">No price alerts set</div>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Target Budget</th>
                      <th>Current Lowest</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map((a) => (
                      <tr key={a._id}>
                        <td>
                          <Link to={`/product/${a.product?._id}`} style={{ fontWeight: 600 }}>
                            {a.product?.name}
                          </Link>
                        </td>
                        <td style={{ fontWeight: 700 }}>₹{a.targetPrice.toLocaleString('en-IN')}</td>
                        <td>₹{(a.currentLowestPrice || a.product?.lowestPrice || 0).toLocaleString('en-IN')}</td>
                        <td>
                          <span className={`badge ${a.alertStatus === 'triggered' ? 'badge-success' : 'badge-primary'}`}>
                            {a.alertStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="data-table-card">
              <div className="data-table-header">
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Notification History</h3>
                {notifications.length > 0 && (
                  <button className="btn btn-secondary btn-sm" onClick={clearAll}>
                    Clear All
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="empty-state">
                  <SvgIcon name="tag" size={28} />
                  <div className="empty-state-title">No notifications recorded</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {notifications.map((n) => (
                    <div
                      key={n._id}
                      style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid var(--color-border-subtle)',
                        backgroundColor: !n.isRead ? 'var(--color-primary-light)' : 'transparent',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '16px'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '2px' }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                          {n.message}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                          {new Date(n.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {n.productId && (
                          <Link to={`/product/${n.productId}`} className="btn btn-secondary btn-sm">
                            View Deal
                          </Link>
                        )}
                        {!n.isRead && (
                          <button className="btn btn-secondary btn-sm" onClick={() => markAsRead(n._id)}>
                            Mark Read
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="card" style={{ padding: '24px', maxWidth: '520px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
                Account Settings
              </h3>
              <form onSubmit={handleProfileSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="userNameInput">Full Name</label>
                  <input
                    id="userNameInput"
                    type="text"
                    className="form-input"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={user?.email || ''}
                    disabled
                    style={{ backgroundColor: 'var(--color-bg-subtle)', cursor: 'not-allowed' }}
                  />
                  <p style={{ fontSize: '11px', color: 'var(--color-text-light)', marginTop: '4px' }}>
                    Email is associated with your session identity and cannot be changed directly.
                  </p>
                </div>

                <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                  {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
