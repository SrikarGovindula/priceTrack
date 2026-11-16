import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import ProductCard from '../components/ProductCard';
import PriceComparisonTable from '../components/PriceComparisonTable';
import PriceHistoryChart from '../components/PriceHistoryChart';
import SetAlertModal from '../components/SetAlertModal';
import SvgIcon from '../components/SvgIcon';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function HomePage({ defaultUrlMode = false }) {
  const [searchParams] = useSearchParams();
  const initialUrlParam = searchParams.get('url') || '';

  const [searchQuery, setSearchQuery] = useState(initialUrlParam);
  const [suggestions, setSuggestions] = useState([]);
  const [trending, setTrending] = useState([]);
  const [deals, setDeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUrlMode, setIsUrlMode] = useState(defaultUrlMode || Boolean(initialUrlParam));

  // URL Comparison state
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlProgressStep, setUrlProgressStep] = useState('');
  const [urlError, setUrlError] = useState('');
  const [urlComparison, setUrlComparison] = useState(null);
  const [urlHistory, setUrlHistory] = useState([]);
  const [urlHistorySummary, setUrlHistorySummary] = useState(null);
  const [selectedProductForAlert, setSelectedProductForAlert] = useState(null);

  const { user } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        const [trendingRes, dealsRes, catRes] = await Promise.all([
          api.getTrending(4),
          api.getDeals(4),
          api.getCategories()
        ]);
        if (trendingRes?.trending) setTrending(trendingRes.trending);
        if (dealsRes?.deals) setDeals(dealsRes.deals);
        if (catRes?.categories) setCategories(catRes.categories);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  // Automatic comparison if URL param provided on load
  useEffect(() => {
    if (initialUrlParam) {
      handleUrlCompare(initialUrlParam);
    }
  }, [initialUrlParam]);

  // Debounced search suggestions
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2 || isUrlMode) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.getSearchSuggestions(searchQuery);
        if (res?.suggestions) setSuggestions(res.suggestions);
      } catch (err) {
        // Ignore suggestion failures
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, isUrlMode]);

  const handleUrlCompare = async (targetUrl) => {
    const urlToCompare = (targetUrl || searchQuery || '').trim();
    if (!urlToCompare) {
      setUrlError('Please paste a product URL to compare.');
      return;
    }

    setUrlLoading(true);
    setUrlError('');
    setUrlComparison(null);
    setUrlHistory([]);
    setUrlHistorySummary(null);

    setUrlProgressStep('Validating URL & identifying store platform (Amazon / Flipkart / Myntra / Croma / Reliance Digital)...');

    const progressTimer = setTimeout(() => {
      setUrlProgressStep('Extracting product identifier, storage variant, and hardware specifications...');
    }, 350);

    try {
      const res = await api.compareUrl(urlToCompare);
      clearTimeout(progressTimer);

      if (!res.success) {
        setUrlError(res.message || 'Unable to analyze this product URL.');
      } else if (!res.matchFound) {
        setUrlComparison(res);
        setTimeout(() => {
          const el = document.getElementById('url-comparison-fallback');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        setUrlComparison(res);
        // Load price history points for the matched product
        if (res.product?._id) {
          try {
            const histRes = await api.getPriceHistory(res.product._id, '30');
            if (histRes && histRes.history) {
              setUrlHistory(histRes.history);
              setUrlHistorySummary(histRes.summary);
            }
          } catch (e) {
            console.warn('History load failed for URL matched product', e);
          }
        }

        // Smooth scroll to comparison section
        setTimeout(() => {
          const el = document.getElementById('url-comparison-results');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    } catch (err) {
      clearTimeout(progressTimer);
      setUrlError(err.message || 'Failed to compare product URL. Please check the link and try again.');
    } finally {
      setUrlLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (isUrlMode) {
      handleUrlCompare(searchQuery);
    } else {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleClearComparison = () => {
    setUrlComparison(null);
    setUrlError('');
    setUrlHistory([]);
    setSearchQuery('');
  };

  const handleToggleWatchlist = async (productId) => {
    if (!user) {
      showToast('Please log in to add products to your watchlist.', 'info');
      navigate('/login');
      return;
    }
    try {
      await api.addToWatchlist(productId);
      showToast('Product added to your watchlist!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update watchlist.', 'error');
    }
  };

  const handleSetAlert = (product) => {
    if (!user) {
      showToast('Please log in to configure price alerts.', 'info');
      navigate('/login');
      return;
    }
    setSelectedProductForAlert(product);
  };

  const loadUrlProductHistory = async (productId, range) => {
    try {
      const histRes = await api.getPriceHistory(productId, range);
      if (histRes && histRes.history) {
        setUrlHistory(histRes.history);
        setUrlHistorySummary(histRes.summary);
      }
    } catch (err) {
      console.warn('Failed to reload history for range', err);
    }
  };

  const categoryIcons = {
    Headphones: 'tag',
    Smartphones: 'tag',
    Laptops: 'tag',
    Smartwatches: 'bell',
    Tablets: 'tag',
    Televisions: 'store',
    Cameras: 'tag',
    'Gaming Accessories': 'tag',
    'Computer Accessories': 'tag',
    'Home Appliances': 'store',
    Accessories: 'tag'
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{ backgroundColor: 'var(--color-bg-alt)', borderBottom: '1px solid var(--color-border)', padding: '64px 0 72px' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '840px' }}>
          <div className="badge badge-primary" style={{ marginBottom: '16px' }}>
            Multi-Store E-Commerce Price Intelligence
          </div>

          <h1 style={{ marginBottom: '16px', letterSpacing: '-0.5px' }}>
            Stop Overpaying. Start Shopping Smarter.
          </h1>

          <p style={{ fontSize: '17px', lineHeight: '1.6', marginBottom: '32px' }}>
            Compare prices across stores, track price history and get notified when your favorite products reach your target price.
          </p>

          {/* Search / URL Box */}
          <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'left' }}>
            <form onSubmit={handleSearchSubmit}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${!isUrlMode ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => {
                    setIsUrlMode(false);
                    setUrlError('');
                  }}
                >
                  <SvgIcon name="search" size={13} />
                  Product Name or Brand
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${isUrlMode ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => {
                    setIsUrlMode(true);
                    setUrlError('');
                  }}
                >
                  <SvgIcon name="external" size={13} />
                  Paste Product URL
                </button>
              </div>

              <div className="search-input-wrapper">
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '40px', paddingRight: isUrlMode ? '150px' : '120px', height: '48px', fontSize: '14px' }}
                    placeholder={
                      isUrlMode
                        ? 'Paste Amazon India, Flipkart, Myntra, Croma, or Reliance link...'
                        : 'Search Sony WH-1000XM5, iPhone 15, MacBook Air M3...'
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div style={{ position: 'absolute', left: '14px', color: 'var(--color-text-muted)' }}>
                    <SvgIcon name={isUrlMode ? 'external' : 'search'} size={18} />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={urlLoading}
                    style={{ position: 'absolute', right: '6px', height: '36px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    {isUrlMode ? (
                      <>
                        <SvgIcon name="store" size={14} />
                        {urlLoading ? 'Comparing...' : 'Compare Prices'}
                      </>
                    ) : (
                      'Search'
                    )}
                  </button>
                </div>

                {/* Suggestions Dropdown (Name Mode) */}
                {suggestions.length > 0 && !isUrlMode && (
                  <div className="search-suggestions-dropdown">
                    {suggestions.map((item) => (
                      <div
                        key={item._id}
                        className="suggestion-item"
                        onClick={() => navigate(`/product/${item._id}`)}
                      >
                        <img src={item.image} alt={item.name} className="suggestion-thumb" />
                        <div className="suggestion-info">
                          <span className="suggestion-name">{item.name}</span>
                          <span className="suggestion-meta">{item.brand} &bull; {item.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>

            {/* Supported Store Indicators & Quick Links (URL Mode) */}
            {isUrlMode ? (
              <div style={{ marginTop: '14px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600 }}>Supported Stores:</span>
                  <span className="badge badge-primary" style={{ fontSize: '10px' }}>Amazon India</span>
                  <span className="badge badge-primary" style={{ fontSize: '10px' }}>Flipkart</span>
                  <span className="badge badge-primary" style={{ fontSize: '10px' }}>Myntra</span>
                  <span className="badge badge-primary" style={{ fontSize: '10px' }}>Croma</span>
                  <span className="badge badge-primary" style={{ fontSize: '10px' }}>Reliance Digital</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span>Sample URLs:</span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '11px', padding: '2px 8px' }}
                    onClick={() => {
                      const sample = 'https://www.flipkart.com/sony-wh-1000xm5-bluetooth-headset/p/itme91724497e5ea';
                      setSearchQuery(sample);
                      handleUrlCompare(sample);
                    }}
                  >
                    Sony XM5 (Flipkart)
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '11px', padding: '2px 8px' }}
                    onClick={() => {
                      const sample = 'https://www.amazon.in/dp/B0CS5XW939';
                      setSearchQuery(sample);
                      handleUrlCompare(sample);
                    }}
                  >
                    Samsung S24 Ultra 256GB (Amazon)
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '11px', padding: '2px 8px' }}
                    onClick={() => {
                      const sample = 'https://www.croma.com/apple-iphone-15-128gb-black-/p/300762';
                      setSearchQuery(sample);
                      handleUrlCompare(sample);
                    }}
                  >
                    iPhone 15 128GB (Croma)
                  </button>
                </div>
              </div>
            ) : (
              /* Quick search tags in Name Mode */
              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Popular:</span>
                  {['Sony WH-1000XM5', 'Apple AirPods Pro', 'iPhone 15', 'MacBook Air M3'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '12px', padding: '4px 10px' }}
                      onClick={() => navigate(`/search?q=${encodeURIComponent(item)}`)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <Link to="/search" className="btn btn-primary btn-sm">
                  Explore Products
                  <SvgIcon name="arrow-right" size={13} />
                </Link>
              </div>
            )}

            {/* Error Message */}
            {urlError && (
              <div style={{ marginTop: '16px' }}>
                <div className="alert-box alert-box-error">
                  <SvgIcon name="alert" size={16} />
                  <span>{urlError}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* URL Analysis Loading State */}
      {urlLoading && (
        <section style={{ padding: '36px 0', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
          <div className="container" style={{ maxWidth: '640px' }}>
            <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
              <div className="flex justify-center" style={{ marginBottom: '14px' }}>
                <SvgIcon name="trending" size={36} color="var(--color-primary)" />
              </div>
              <h3 style={{ fontSize: '17px', marginBottom: '8px' }}>Processing Product URL...</h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                {urlProgressStep}
              </p>
              <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--color-border)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: '60%', height: '100%', backgroundColor: 'var(--color-primary)' }}></div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* URL Comparison Results Section (When Match Found) */}
      {urlComparison && urlComparison.matchFound && (
        <section id="url-comparison-results" style={{ padding: '40px 0 60px', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
          <div className="container">
            {/* Header Identified Card */}
            <div className="card" style={{ padding: '24px 28px', marginBottom: '24px', backgroundColor: 'var(--color-bg-alt)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span className="badge badge-success" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <SvgIcon name="check" size={12} />
                      Verified Match
                    </span>
                    <span className="badge badge-primary" style={{ fontSize: '11px' }}>
                      {urlComparison.confidenceScore}% Confidence &bull; {urlComparison.matchConfidence}
                    </span>
                    <span className="badge badge-secondary" style={{ fontSize: '11px' }}>
                      Pasted from {urlComparison.sourceStore?.storeName}
                    </span>
                  </div>

                  <h2 style={{ fontSize: '22px', marginBottom: '6px' }}>
                    {urlComparison.product.name}
                  </h2>

                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    <strong>Brand:</strong> {urlComparison.product.brand} &bull;{' '}
                    <strong>Category:</strong> {urlComparison.product.category} &bull;{' '}
                    <strong>Model:</strong> {urlComparison.product.modelNumber || 'Standard'} &bull;{' '}
                    <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{urlComparison.matchReason}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleClearComparison}
                >
                  <SvgIcon name="close" size={13} />
                  Compare Another URL
                </button>
              </div>

              {/* Product preview and pricing summary metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginTop: '20px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <img
                    src={urlComparison.product.image}
                    alt={urlComparison.product.name}
                    style={{ width: '90px', height: '90px', objectFit: 'contain', background: '#fff', padding: '6px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                  />
                  <div>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block' }}>Lowest Verified Price</span>
                    <span style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-success)' }}>
                      ₹{urlComparison.stats.lowestPrice?.toLocaleString('en-IN')}
                    </span>
                    {urlComparison.stats.priceDifference > 0 && (
                      <div style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600 }}>
                        Save up to ₹{urlComparison.stats.priceDifference?.toLocaleString('en-IN')}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '12px', lineHeight: '1.5' }}>
                    {urlComparison.product.description}
                  </p>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleSetAlert(urlComparison.product)}
                    >
                      <SvgIcon name="bell" size={14} />
                      Set Price Alert
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleToggleWatchlist(urlComparison.product._id)}
                    >
                      <SvgIcon name="heart" size={14} />
                      Add to Watchlist
                    </button>
                    <Link
                      to={`/product/${urlComparison.product._id}`}
                      className="btn btn-secondary btn-sm"
                    >
                      <SvgIcon name="store" size={14} />
                      Full Details Page
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Cross-Store Price Comparison Table */}
            <PriceComparisonTable listings={urlComparison.listings} productName={urlComparison.product.name} />

            {/* Price History SVG Chart */}
            {urlHistory.length > 0 && (
              <div style={{ marginTop: '32px' }}>
                <PriceHistoryChart
                  history={urlHistory}
                  summary={urlHistorySummary}
                  currentRange="30"
                  onRangeChange={(range) => loadUrlProductHistory(urlComparison.product._id, range)}
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* URL Comparison Fallback State (When Product Not in Catalog) */}
      {urlComparison && !urlComparison.matchFound && (
        <section id="url-comparison-fallback" style={{ padding: '36px 0', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
          <div className="container" style={{ maxWidth: '680px' }}>
            <div className="card empty-state" style={{ padding: '36px 24px', textAlign: 'center' }}>
              <SvgIcon name="alert" size={38} color="var(--color-warning)" />
              <h3 style={{ fontSize: '18px', marginTop: '12px', marginBottom: '8px' }}>
                Product Not Currently in Catalog
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
                {urlComparison.message}
              </p>
              <div style={{ fontSize: '12px', color: 'var(--color-text-light)', marginBottom: '20px' }}>
                <strong>Detected Store:</strong> {urlComparison.sourceStore} &bull; {urlComparison.reason}
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {urlComparison.suggestedQuery && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate(`/search?q=${encodeURIComponent(urlComparison.suggestedQuery)}`)}
                  >
                    <SvgIcon name="search" size={13} />
                    Search Catalog for &ldquo;{urlComparison.suggestedQuery}&rdquo;
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleClearComparison}
                >
                  Try Another URL
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Modal for setting price alert */}
      {selectedProductForAlert && (
        <SetAlertModal
          isOpen={Boolean(selectedProductForAlert)}
          product={selectedProductForAlert}
          onClose={() => setSelectedProductForAlert(null)}
          onAlertSaved={() => {
            showToast('Price drop alert configured successfully!', 'success');
          }}
        />
      )}

      {/* Popular Categories */}
      <section style={{ padding: '48px 0', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
            <div>
              <h2>Popular Categories</h2>
              <p style={{ fontSize: '14px' }}>Browse products by verified electronics and appliances categories.</p>
            </div>
            <Link to="/search" className="btn btn-secondary btn-sm">
              Explore All Products
              <SvgIcon name="arrow-right" size={14} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px' }}>
            {categories.map((cat) => (
              <Link
                key={cat}
                to={`/search?category=${encodeURIComponent(cat)}`}
                className="card"
                style={{
                  padding: '16px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'border-color 0.15s ease, transform 0.15s ease'
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <SvgIcon name={categoryIcons[cat] || 'tag'} size={18} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>{cat}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section style={{ padding: '48px 0', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
            <div>
              <h2>Trending Products</h2>
              <p style={{ fontSize: '14px' }}>Most compared products tracked by shoppers this week.</p>
            </div>
            <Link to="/search" className="btn btn-secondary btn-sm">
              View Catalog
              <SvgIcon name="arrow-right" size={14} />
            </Link>
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : (
            <div className="product-grid">
              {trending.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Best Deals */}
      <section style={{ padding: '48px 0', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-alt)' }}>
        <div className="container">
          <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
            <div>
              <h2>Best Available Deals</h2>
              <p style={{ fontSize: '14px' }}>Products with the highest current discounts against original retail prices.</p>
            </div>
            <Link to="/deals" className="btn btn-secondary btn-sm">
              All Deals
              <SvgIcon name="arrow-right" size={14} />
            </Link>
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : (
            <div className="product-grid">
              {deals.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How PriceTrack Works (SEARCH -> COMPARE -> TRACK -> WATCHLIST -> ALERT) */}
      <section style={{ padding: '64px 0', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 48px' }}>
            <div className="badge badge-primary" style={{ marginBottom: '12px' }}>
              Core Workflow
            </div>
            <h2>How PriceTrack Works</h2>
            <p style={{ fontSize: '15px' }}>
              Five simple steps to ensure you buy when the price is right.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {[
              { step: '01', title: 'Search', desc: 'Find any product by title, brand, category, or direct URL.', link: '/search' },
              { step: '02', title: 'Compare', desc: 'View live price quotes across Amazon, Flipkart, Croma, and more.', link: '/search' },
              { step: '03', title: 'Track', desc: 'Analyze 90 days of price fluctuation charts to spot real lows.', link: '/history' },
              { step: '04', title: 'Watchlist', desc: 'Save items to your personalized dashboard with customized targets.', link: '/watchlist' },
              { step: '05', title: 'Alert', desc: 'Receive instant notifications when prices drop to your target.', link: '/alerts' }
            ].map((s) => (
              <Link
                key={s.step}
                to={s.link}
                className="card"
                style={{ padding: '24px 20px', position: 'relative', display: 'flex', flexDirection: 'column', transition: 'transform 0.15s ease, border-color 0.15s ease' }}
              >
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '8px' }}>
                  STEP {s.step}
                </div>
                <h3 style={{ fontSize: '16px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {s.title}
                  <SvgIcon name="arrow-right" size={13} color="var(--color-text-muted)" />
                </h3>
                <p style={{ fontSize: '13px', lineHeight: '1.5' }}>{s.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose PriceTrack */}
      <section style={{ padding: '64px 0', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-alt)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 40px' }}>
            <h2>Built For Smart Shoppers</h2>
            <p style={{ fontSize: '15px' }}>
              Unlike affiliate aggregators with sponsored biases, PriceTrack focuses on verified multi-store data and historical analytics.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <Link to="/search" className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <div className="metric-icon-wrap" style={{ marginBottom: '16px' }}>
                <SvgIcon name="shield" size={22} />
              </div>
              <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Objective Multi-Store Data</h3>
              <p style={{ fontSize: '13px', lineHeight: '1.6' }}>
                Clear side-by-side comparison tables. The lowest price is always objectively marked as the best buying option.
              </p>
            </Link>

            <Link to="/history" className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <div className="metric-icon-wrap" style={{ marginBottom: '16px' }}>
                <SvgIcon name="chart" size={22} />
              </div>
              <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>True Price History</h3>
              <p style={{ fontSize: '13px', lineHeight: '1.6' }}>
                Never fall for artificial "festival discount" inflations. Inspect exact 90-day recorded price swings before buying.
              </p>
            </Link>

            <Link to="/alerts" className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <div className="metric-icon-wrap" style={{ marginBottom: '16px' }}>
                <SvgIcon name="bell" size={22} />
              </div>
              <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Target Price Automation</h3>
              <p style={{ fontSize: '13px', lineHeight: '1.6' }}>
                Specify your ideal budget price. Automated background monitoring evaluates prices and alerts you immediately.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section style={{ padding: '64px 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '640px' }}>
          <h2 style={{ marginBottom: '14px' }}>Ready to start tracking?</h2>
          <p style={{ fontSize: '15px', marginBottom: '24px' }}>
            Create a free account to maintain your personalized watchlist and receive price drop alerts.
          </p>
          <div className="flex justify-center gap-3" style={{ justifyContent: 'center' }}>
            <Link to="/register" className="btn btn-primary btn-lg">Create Free Account</Link>
            <Link to="/search" className="btn btn-secondary btn-lg">Browse Products</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
