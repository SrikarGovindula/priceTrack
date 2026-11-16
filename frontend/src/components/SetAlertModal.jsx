import React, { useState } from 'react';
import { api } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import SvgIcon from './SvgIcon';

export default function SetAlertModal({ product, isOpen, onClose, onAlertSaved, initialTargetPrice = null }) {
  const currentLowest = product?.lowestPrice || product?.currentLowestPrice || product?.price || 0;
  const defaultTarget = initialTargetPrice || Math.round((currentLowest * 0.95) / 10) * 10;
  
  const [targetPrice, setTargetPrice] = useState(defaultTarget);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useNotifications();

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const priceNum = Number(targetPrice);
    if (!priceNum || isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid positive target price.');
      return;
    }

    setLoading(true);
    try {
      await api.createAlert(product._id, priceNum);
      showToast(`Price drop alert set for ₹${priceNum.toLocaleString('en-IN')}`, 'success');
      if (onAlertSaved) onAlertSaved(priceNum);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to configure price alert.');
    } finally {
      setLoading(false);
    }
  };

  const setSuggestedTarget = (percent) => {
    const suggested = Math.round((currentLowest * (1 - percent / 100)) / 10) * 10;
    setTargetPrice(suggested);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <SvgIcon name="bell" size={17} color="var(--color-primary)" />
            Set Target Price Alert
          </h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <SvgIcon name="close" size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '4px' }}>
                {product.name}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                Current lowest price: <strong style={{ color: 'var(--color-success)' }}>₹{currentLowest.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            {error && (
              <div className="alert-box alert-box-error">
                <SvgIcon name="alert" size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="targetPriceInput">
                Target Price (₹)
              </label>
              <input
                id="targetPriceInput"
                type="number"
                className="form-input"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                min="1"
                step="1"
                required
              />
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                You will be notified immediately whenever any store listing drops to or below this price.
              </p>
            </div>

            {/* Quick Presets */}
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                Quick Presets:
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSuggestedTarget(5)}
                >
                  5% Drop (₹{Math.round((currentLowest * 0.95) / 10) * 10})
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSuggestedTarget(10)}
                >
                  10% Drop (₹{Math.round((currentLowest * 0.90) / 10) * 10})
                </button>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Set Price Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
