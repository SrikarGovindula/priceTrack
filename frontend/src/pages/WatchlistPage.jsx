import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import SvgIcon from '../components/SvgIcon';
import SetAlertModal from '../components/SetAlertModal';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductForAlert, setSelectedProductForAlert] = useState(null);
  const { showToast } = useNotifications();

  const loadWatchlist = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getWatchlist();
      if (res && res.watchlist) {
        setWatchlist(res.watchlist);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load watchlist', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadWatchlist();
  }, [loadWatchlist]);

  const handleRemove = async (id, name) => {
    try {
      await api.removeFromWatchlist(id);
      setWatchlist((prev) => prev.filter((item) => item._id !== id));
      showToast(`Removed "${name}" from watchlist.`, 'info');
    } catch (err) {
      showToast(err.message || 'Failed to remove from watchlist', 'error');
    }
  };

  return (
    <div className="container" style={{ padding: '32px 20px 64px' }}>
      <div className="dashboard-header" style={{ marginBottom: '24px' }}>
        <div>
          <h2>My Personalized Watchlist</h2>
          <p style={{ fontSize: '14px' }}>
            Products you are monitoring across all stores with your custom budget thresholds.
          </p>
        </div>
        <Link to="/search" className="btn btn-primary btn-sm">
          <SvgIcon name="search" size={14} />
          Explore More Products
        </Link>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : watchlist.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">
            <SvgIcon name="heart" size={28} />
          </div>
          <div className="empty-state-title">Your watchlist is currently empty</div>
          <div className="empty-state-desc">
            Save items here while searching to monitor price fluctuations and set automated target price alerts.
          </div>
          <Link to="/search" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Browse Catalog
          </Link>
        </div>
      ) : (
        <div className="data-table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Current Lowest</th>
                <th>Target Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {watchlist.map((item) => {
                const prod = item.product;
                const currentPrice = item.currentLowestPrice || prod?.lowestPrice || 0;
                const targetPrice = item.targetPrice;
                const targetReached = targetPrice && currentPrice <= targetPrice;

                return (
                  <tr key={item._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Link to={`/product/${prod?._id}`}>
                          <img
                            src={prod?.image}
                            alt={prod?.name}
                            style={{ width: '48px', height: '48px', objectFit: 'contain', background: '#fff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                          />
                        </Link>
                        <div>
                          <Link to={`/search?brand=${encodeURIComponent(prod?.brand || '')}`} style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 700, display: 'block' }}>
                            {prod?.brand}
                          </Link>
                          <Link
                            to={`/product/${prod?._id}`}
                            style={{ fontWeight: 600, color: 'var(--color-text)' }}
                          >
                            {prod?.name}
                          </Link>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text)' }}>
                        ₹{currentPrice.toLocaleString('en-IN')}
                      </div>
                    </td>

                    <td>
                      {targetPrice ? (
                        <div style={{ fontSize: '14px', fontWeight: 600, color: targetReached ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                          ₹{targetPrice.toLocaleString('en-IN')}
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--color-text-light)' }}>
                          Not Set
                        </span>
                      )}
                    </td>

                    <td>
                      {targetReached ? (
                        <span className="badge badge-success">Target Reached!</span>
                      ) : targetPrice ? (
                        <span className="badge badge-primary">Monitoring</span>
                      ) : (
                        <span className="badge" style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-muted)' }}>
                          Watching
                        </span>
                      )}
                    </td>

                    <td>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/product/${prod?._id}`}
                          className="btn btn-secondary btn-sm"
                          title="View store comparison table"
                        >
                          <SvgIcon name="store" size={13} />
                          Compare
                        </Link>

                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedProductForAlert(prod)}
                          title="Set or update target price alert"
                        >
                          <SvgIcon name="bell" size={13} />
                          {targetPrice ? 'Edit Alert' : 'Set Alert'}
                        </button>

                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--color-danger)' }}
                          onClick={() => handleRemove(item._id, prod?.name)}
                          title="Remove from watchlist"
                        >
                          <SvgIcon name="trash" size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedProductForAlert && (
        <SetAlertModal
          isOpen={Boolean(selectedProductForAlert)}
          product={selectedProductForAlert}
          onClose={() => setSelectedProductForAlert(null)}
          onAlertSaved={() => {
            loadWatchlist();
            setSelectedProductForAlert(null);
          }}
        />
      )}
    </div>
  );
}
