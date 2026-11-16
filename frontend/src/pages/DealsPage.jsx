import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';
import SvgIcon from '../components/SvgIcon';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function DealsPage() {
  const [deals, setDeals] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('deals');

  useEffect(() => {
    async function loadDealsData() {
      try {
        setLoading(true);
        const [dealsRes, trendingRes] = await Promise.all([
          api.getDeals(12),
          api.getTrending(12)
        ]);
        if (dealsRes?.deals) setDeals(dealsRes.deals);
        if (trendingRes?.trending) setTrending(trendingRes.trending);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDealsData();
  }, []);

  const displayedProducts = activeTab === 'deals' ? deals : trending;

  return (
    <div className="container" style={{ padding: '32px 20px 64px' }}>
      <div className="dashboard-header" style={{ marginBottom: '24px' }}>
        <div>
          <h2>Deals & Trending Products</h2>
          <p style={{ fontSize: '14px' }}>
            Products with verified historical price drops and high consumer tracking volume.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="chart-filters">
          <button
            className={`chart-filter-btn ${activeTab === 'deals' ? 'active' : ''}`}
            onClick={() => setActiveTab('deals')}
          >
            Highest Discounts
          </button>
          <button
            className={`chart-filter-btn ${activeTab === 'trending' ? 'active' : ''}`}
            onClick={() => setActiveTab('trending')}
          >
            Most Tracked
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : displayedProducts.length === 0 ? (
        <div className="card empty-state">
          <SvgIcon name="tag" size={32} color="var(--color-text-muted)" />
          <div className="empty-state-title">No deals currently listed</div>
        </div>
      ) : (
        <div className="product-grid">
          {displayedProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
