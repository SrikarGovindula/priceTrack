import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { api } from '../services/api';
import SvgIcon from './SvgIcon';

export default function ProductCard({ product, isWatched = false, onWatchlistChange }) {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const [watched, setWatched] = useState(isWatched);
  const [loading, setLoading] = useState(false);

  const handleToggleWatchlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showToast('Please log in to add products to your watchlist.', 'info');
      return;
    }

    setLoading(true);
    try {
      if (watched) {
        await api.removeFromWatchlist(product._id);
        setWatched(false);
        showToast('Removed from watchlist.', 'info');
      } else {
        await api.addToWatchlist(product._id);
        setWatched(true);
        showToast('Added to watchlist.', 'success');
      }
      if (onWatchlistChange) onWatchlistChange(product._id, !watched);
    } catch (err) {
      showToast(err.message || 'Error updating watchlist', 'error');
    } finally {
      setLoading(false);
    }
  };

  const lowestPrice = product.lowestPrice || product.price || 0;
  const originalPrice = product.originalPrice || 0;
  const discountPercent = product.discountPercent || (originalPrice > lowestPrice ? Math.round(((originalPrice - lowestPrice) / originalPrice) * 100) : 0);
  const storeCount = product.storeCount || 4;

  return (
    <div className="product-card">
      <Link to={`/product/${product._id}`} className="product-card-image-wrap" style={{ display: 'flex' }}>
        <img
          src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'}
          alt={product.name}
          className="product-card-image"
          loading="lazy"
        />

        {discountPercent > 0 && (
          <div className="product-card-badge">
            <span className="badge badge-success">{discountPercent}% OFF</span>
          </div>
        )}

        <button
          type="button"
          className={`product-card-watchlist-btn ${watched ? 'active' : ''}`}
          onClick={handleToggleWatchlist}
          title={watched ? 'Remove from watchlist' : 'Add to watchlist'}
          disabled={loading}
          aria-label="Toggle watchlist"
        >
          <SvgIcon name={watched ? 'heart-filled' : 'heart'} size={16} />
        </button>
      </Link>

      <div className="product-card-body">
        <Link to={`/search?brand=${encodeURIComponent(product.brand)}`} className="product-card-brand">
          {product.brand}
        </Link>
        <Link to={`/product/${product._id}`} className="product-card-title" title={product.name}>
          {product.name}
        </Link>

        <div className="product-card-price-row">
          <span className="product-card-price">₹{lowestPrice.toLocaleString('en-IN')}</span>
          {originalPrice > lowestPrice && (
            <span className="product-card-orig-price">₹{originalPrice.toLocaleString('en-IN')}</span>
          )}
        </div>

        <div className="product-card-footer">
          <span className="product-stores-tag">
            <SvgIcon name="store" size={13} />
            {storeCount} stores
          </span>
          <Link to={`/product/${product._id}`} className="btn btn-secondary btn-sm">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
