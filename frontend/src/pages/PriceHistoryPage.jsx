import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import PriceHistoryChart from '../components/PriceHistoryChart';
import SvgIcon from '../components/SvgIcon';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function PriceHistoryPage() {
  const { id: paramId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryProductId = searchParams.get('product') || paramId || '';

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [range, setRange] = useState('30');
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Load products list for the selector
  useEffect(() => {
    async function fetchProductsList() {
      try {
        setLoading(true);
        const res = await api.getProducts({ limit: 50 });
        if (res?.products && res.products.length > 0) {
          setProducts(res.products);
          // Determine initial product
          let initial = null;
          if (queryProductId) {
            initial = res.products.find(p => p._id === queryProductId) || null;
          }
          if (!initial) {
            // Default to Sony WH-1000XM5 if present, or first product
            initial = res.products.find(p => p.modelNumber === 'WH1000XM5') || res.products[0];
          }
          setSelectedProduct(initial);
        }
      } catch (err) {
        console.error('Failed to load products for history:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProductsList();
  }, [queryProductId]);

  // Load history data whenever selected product or range changes
  const loadHistory = useCallback(async (prodId, selectedRange) => {
    if (!prodId) return;
    setHistoryLoading(true);
    try {
      const res = await api.getPriceHistory(prodId, selectedRange);
      if (res) {
        setHistory(res.history || []);
        setSummary(res.summary || null);
      }
    } catch (err) {
      console.warn('Failed to fetch history:', err.message);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      loadHistory(selectedProduct._id, range);
    }
  }, [selectedProduct, range, loadHistory]);

  const handleProductChange = (productId) => {
    const prod = products.find(p => p._id === productId);
    if (prod) {
      setSelectedProduct(prod);
      setSearchParams({ product: prod._id });
    }
  };

  const handleRangeChange = (newRange) => {
    setRange(newRange);
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
      {/* Header & Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
        <Link to="/">Home</Link>
        <SvgIcon name="chevron-right" size={12} />
        <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>Price History</span>
      </div>

      <div className="dashboard-header" style={{ marginBottom: '24px' }}>
        <div>
          <h2>Historical Price Analytics</h2>
          <p style={{ fontSize: '14px' }}>
            Interactive 90-day time-series price records across major e-commerce platforms.
          </p>
        </div>

        {selectedProduct && (
          <div className="quick-actions-bar">
            <Link to={`/product/${selectedProduct._id}`} className="btn btn-primary btn-sm">
              <SvgIcon name="store" size={14} />
              Compare Stores
            </Link>
          </div>
        )}
      </div>

      {/* Product Selector Dropdown */}
      <div className="card" style={{ padding: '20px', marginBottom: '28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', alignItems: 'center' }}>
          <div>
            <label className="form-label" htmlFor="historyProductSelect" style={{ fontSize: '13px' }}>
              Select Tracked Product:
            </label>
            <select
              id="historyProductSelect"
              className="form-select"
              value={selectedProduct?._id || ''}
              onChange={(e) => handleProductChange(e.target.value)}
            >
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.brand})
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                style={{ width: '48px', height: '48px', objectFit: 'contain', background: '#fff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
              />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase' }}>
                  {selectedProduct.brand} &bull; {selectedProduct.category}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>
                  Current Lowest: <span style={{ color: 'var(--color-success)' }}>₹{(selectedProduct.lowestPrice || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Historical Chart */}
      {selectedProduct && (
        <>
          {historyLoading ? (
            <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
              <p>Loading historical price records...</p>
            </div>
          ) : (
            <PriceHistoryChart
              history={history}
              summary={summary}
              currentRange={range}
              onRangeChange={handleRangeChange}
            />
          )}

          {/* Quick Navigation to Store Comparison & Watchlist */}
          <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '2px' }}>
                Compare current store listings for {selectedProduct.name}
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                View available offers on Amazon, Flipkart, Croma, Reliance Digital and Myntra.
              </p>
            </div>
            <div className="flex gap-2">
              <Link to={`/product/${selectedProduct._id}`} className="btn btn-primary">
                View Comparison Table
                <SvgIcon name="arrow-right" size={14} />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
