import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import SvgIcon from '../components/SvgIcon';
import SetAlertModal from '../components/SetAlertModal';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState(null);
  const { showToast } = useNotifications();

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getAlerts();
      if (res && res.alerts) {
        setAlerts(res.alerts);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load price alerts', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const handleDelete = async (id, name) => {
    try {
      await api.deleteAlert(id);
      setAlerts((prev) => prev.filter((a) => a._id !== id));
      showToast(`Removed alert for "${name}".`, 'info');
    } catch (err) {
      showToast(err.message || 'Failed to remove alert', 'error');
    }
  };

  return (
    <div className="container" style={{ padding: '32px 20px 64px' }}>
      <div className="dashboard-header" style={{ marginBottom: '24px' }}>
        <div>
          <h2>Target Price Alerts</h2>
          <p style={{ fontSize: '14px' }}>
            Automated alerts monitored by the background price service.
          </p>
        </div>
        <Link to="/search" className="btn btn-primary btn-sm">
          <SvgIcon name="search" size={14} />
          Track New Product
        </Link>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : alerts.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">
            <SvgIcon name="bell" size={28} />
          </div>
          <div className="empty-state-title">No price alerts set</div>
          <div className="empty-state-desc">
            Set your target price on any product page. When any store drops to your budget, PriceTrack will alert you automatically.
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
                <th>Target Budget</th>
                <th>Current Lowest</th>
                <th>Status</th>
                <th>Last Triggered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => {
                const prod = alert.product;
                const currentPrice = alert.currentLowestPrice || prod?.lowestPrice || 0;
                const targetMet = currentPrice <= alert.targetPrice;

                return (
                  <tr key={alert._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Link to={`/product/${prod?._id}`} style={{ display: 'block', flexShrink: 0 }}>
                          <img
                            src={prod?.image}
                            alt={prod?.name}
                            style={{ width: '44px', height: '44px', objectFit: 'contain', background: '#fff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                          />
                        </Link>
                        <div>
                          <div style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 700 }}>
                            <Link to={`/search?brand=${encodeURIComponent(prod?.brand || '')}`} style={{ color: 'inherit' }}>
                              {prod?.brand}
                            </Link>
                          </div>
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
                        ₹{alert.targetPrice.toLocaleString('en-IN')}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: targetMet ? 'var(--color-success)' : 'var(--color-text)' }}>
                        ₹{currentPrice.toLocaleString('en-IN')}
                      </div>
                    </td>

                    <td>
                      {alert.alertStatus === 'triggered' || targetMet ? (
                        <span className="badge badge-success">Target Reached</span>
                      ) : (
                        <span className="badge badge-primary">Active Monitoring</span>
                      )}
                    </td>

                    <td>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {alert.lastNotifiedAt ? (
                          <>
                            {new Date(alert.lastNotifiedAt).toLocaleDateString()} at ₹{alert.lastNotifiedPrice?.toLocaleString('en-IN')}
                          </>
                        ) : (
                          'Awaiting price drop'
                        )}
                      </span>
                    </td>

                    <td>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/product/${prod?._id}`}
                          className="btn btn-secondary btn-sm"
                          title="View multi-store comparison"
                        >
                          <SvgIcon name="store" size={13} />
                          View
                        </Link>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedProductForEdit(prod)}
                          title="Edit target price"
                        >
                          <SvgIcon name="bell" size={13} />
                          Edit
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--color-danger)' }}
                          onClick={() => handleDelete(alert._id, prod?.name)}
                          title="Delete alert"
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

      {selectedProductForEdit && (
        <SetAlertModal
          isOpen={Boolean(selectedProductForEdit)}
          product={selectedProductForEdit}
          onClose={() => setSelectedProductForEdit(null)}
          onAlertSaved={() => {
            loadAlerts();
            setSelectedProductForEdit(null);
          }}
        />
      )}
    </div>
  );
}
