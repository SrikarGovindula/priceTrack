import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import PriceComparisonTable from '../components/PriceComparisonTable';
import PriceHistoryChart from '../components/PriceHistoryChart';
import SetAlertModal from '../components/SetAlertModal';
import SvgIcon from '../components/SvgIcon';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [historySummary, setHistorySummary] = useState(null);
  const [historyRange, setHistoryRange] = useState('30');
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProductData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getProductById(id);
      if (res && res.product) {
        setProduct(res.product);
      } else {
        setError('Product not found.');
      }
    } catch (err) {
      setError(err.message || 'Failed to load product details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadHistoryData = useCallback(async (range) => {
    try {
      const res = await api.getPriceHistory(id, range);
      if (res && res.history) {
        setHistory(res.history);
        setHistorySummary(res.summary);
      }
    } catch (err) {
      console.warn('Failed to load history:', err.message);
    }
  }, [id]);

  // Check if product is in user's watchlist
  const checkWatchlistStatus = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.getWatchlist();
      if (res && res.watchlist) {
        const found = res.watchlist.some(w => w.productId === id || w.product?._id === id);
        setIsWatched(found);
      }
    } catch (err) {
      // Non-blocking
    }
  }, [user, id]);

  useEffect(() => {
    loadProductData();
    loadHistoryData(historyRange);
    checkWatchlistStatus();
  }, [loadProductData, loadHistoryData, checkWatchlistStatus, historyRange]);

  const handleRangeChange = (newRange) => {
    setHistoryRange(newRange);
    loadHistoryData(newRange);
  };

  const handleToggleWatchlist = async () => {
    if (!user) {
      showToast('Please log in to add products to your watchlist.', 'info');
      return;
    }

    try {
      if (isWatched) {
        await api.removeFromWatchlist(id);
        setIsWatched(false);
        showToast('Product removed from watchlist.', 'info');
      } else {
        await api.addToWatchlist(id);
        setIsWatched(true);
        showToast('Product added to watchlist.', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update watchlist.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '48px 20px' }}>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container" style={{ padding: '64px 20px', textAlign: 'center' }}>
        <div className="card empty-state">
          <SvgIcon name="alert" size={36} color="var(--color-danger)" />
          <div className="empty-state-title">Product Error</div>
          <div className="empty-state-desc">{error || 'Unable to locate this product.'}</div>
          <Link to="/search" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  const lowestPrice = product.lowestPrice || 0;
  const highestPrice = product.highestPrice || lowestPrice;
  const originalPrice = product.originalPrice || lowestPrice;
  const priceDifference = highestPrice - lowestPrice;
  const discountPercent = originalPrice > lowestPrice
    ? Math.round(((originalPrice - lowestPrice) / originalPrice) * 100)
    : 0;

  return (
    <div className="container" style={{ padding: '32px 20px 64px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '24px', flexWrap: 'wrap' }}>
        <Link to="/">Home</Link>
        <SvgIcon name="chevron-right" size={12} />
        <Link to={`/search?category=${encodeURIComponent(product.category)}`}>{product.category}</Link>
        <SvgIcon name="chevron-right" size={12} />
        <Link to={`/search?brand=${encodeURIComponent(product.brand)}`} style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
          {product.brand}
        </Link>
        <SvgIcon name="chevron-right" size={12} />
        <span style={{ color: 'var(--color-text)' }}>{product.name}</span>
      </div>

      {/* Product Hero Grid */}
      <div className="card" style={{ padding: '32px', marginBottom: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
          {/* Image Column */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <img
              src={product.image}
              alt={product.name}
              style={{ maxWidth: '100%', maxHeight: '360px', objectFit: 'contain' }}
            />
          </div>

          {/* Details Column */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '8px' }}>
              <span className="badge badge-primary">{product.category}</span>
              <span className="badge badge-demo">Simulated Feed</span>
            </div>

            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-primary)', marginBottom: '4px' }}>
              {product.brand} {product.modelNumber && `&bull; Model: ${product.modelNumber}`}
            </div>

            <h1 style={{ fontSize: '24px', lineHeight: '1.3', marginBottom: '16px' }}>
              {product.name}
            </h1>

            <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
              {product.description}
            </p>

            {/* Pricing Summary Block */}
            <div style={{ backgroundColor: 'var(--color-bg-alt)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '18px 20px', marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                CURRENT LOWEST AVAILABLE PRICE
              </div>
              <div className="flex items-baseline gap-3" style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-success)' }}>
                  ₹{lowestPrice.toLocaleString('en-IN')}
                </span>
                {originalPrice > lowestPrice && (
                  <>
                    <span style={{ fontSize: '16px', color: 'var(--color-text-light)', textDecoration: 'line-through' }}>
                      ₹{originalPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="badge badge-success">{discountPercent}% OFF</span>
                  </>
                )}
              </div>

              {priceDifference > 0 && (
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  Price difference across stores: <strong>₹{priceDifference.toLocaleString('en-IN')}</strong> (highest ₹{highestPrice.toLocaleString('en-IN')})
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3" style={{ flexWrap: 'wrap', marginTop: 'auto' }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (!user) {
                    showToast('Please log in to set target price alerts.', 'info');
                    navigate('/login', { state: { from: location } });
                  } else {
                    setIsAlertModalOpen(true);
                  }
                }}
              >
                <SvgIcon name="bell" size={16} />
                Set Price Alert
              </button>

              <button
                className={`btn ${isWatched ? 'btn-danger' : 'btn-secondary'}`}
                onClick={handleToggleWatchlist}
              >
                <SvgIcon name={isWatched ? 'heart-filled' : 'heart'} size={16} />
                {isWatched ? 'In Watchlist' : 'Add to Watchlist'}
              </button>

              <Link to={`/history?product=${product._id}`} className="btn btn-secondary">
                <SvgIcon name="chart" size={15} />
                Price History
              </Link>

              <Link to="/search" className="btn btn-secondary">
                <SvgIcon name="search" size={15} />
                Compare More
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Store Price Comparison Table */}
      <PriceComparisonTable listings={product.listings || []} productName={product.name} />

      {/* Historical Price Tracking Native SVG Chart */}
      <PriceHistoryChart
        history={history}
        summary={historySummary}
        currentRange={historyRange}
        onRangeChange={handleRangeChange}
      />

      {/* Specifications Table */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <div className="card" style={{ padding: '24px', marginTop: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
            Product Specifications
          </h3>
          <table className="comparison-table">
            <tbody>
              {Object.entries(product.specifications).map(([key, val]) => (
                <tr key={key}>
                  <td style={{ width: '35%', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '13px' }}>
                    {key}
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--color-text)' }}>
                    {val}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Set Alert Modal */}
      <SetAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        product={product}
        onAlertSaved={() => {
          showToast('Price drop alert configured successfully!', 'success');
        }}
      />
    </div>
  );
}
