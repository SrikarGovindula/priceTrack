import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';
import SvgIcon from '../components/SvgIcon';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search filter states initialized from URL params
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'All';
  const initialBrand = searchParams.get('brand') || 'All';
  const initialSort = searchParams.get('sort') || 'popularity';

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [brand, setBrand] = useState(initialBrand);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(1);

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load filter metadata
  useEffect(() => {
    async function loadMeta() {
      try {
        const [catRes, brandRes] = await Promise.all([
          api.getCategories(),
          api.getBrands()
        ]);
        if (catRes?.categories) setCategories(catRes.categories);
        if (brandRes?.brands) setBrands(brandRes.brands);
      } catch (err) {
        console.error(err);
      }
    }
    loadMeta();
  }, []);

  // Sync state with URL params
  useEffect(() => {
    const qParam = searchParams.get('q') || '';
    const catParam = searchParams.get('category') || 'All';
    const brandParam = searchParams.get('brand') || 'All';
    setQuery(qParam);
    setCategory(catParam);
    setBrand(brandParam);
  }, [searchParams]);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getProducts({
        q: query,
        category: category !== 'All' ? category : undefined,
        brand: brand !== 'All' ? brand : undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        sort,
        page,
        limit: 12
      });

      if (res && res.products) {
        setProducts(res.products);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching search results:', err);
    } finally {
      setLoading(false);
    }
  }, [query, category, brand, minPrice, maxPrice, sort, page]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (query.trim()) newParams.set('q', query.trim());
    else newParams.delete('q');
    setSearchParams(newParams);
  };

  const handleCategorySelect = (cat) => {
    setCategory(cat);
    setPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (cat !== 'All') newParams.set('category', cat);
    else newParams.delete('category');
    setSearchParams(newParams);
  };

  const handleBrandSelect = (b) => {
    setBrand(b);
    setPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (b !== 'All') newParams.set('brand', b);
    else newParams.delete('brand');
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setQuery('');
    setCategory('All');
    setBrand('All');
    setMinPrice('');
    setMaxPrice('');
    setSort('popularity');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="container" style={{ padding: '32px 20px 64px' }}>
      {/* Search Header Bar */}
      <div className="search-header-bar">
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Compare Product Prices</h1>
          <div className="search-results-count">
            Found <strong>{total}</strong> verified products
            {query && <span> for &ldquo;{query}&rdquo;</span>}
            {category !== 'All' && <span> in {category}</span>}
          </div>
        </div>

        {/* Sort Select */}
        <div className="sort-select-wrapper">
          <label htmlFor="sortSelect">Sort by:</label>
          <select
            id="sortSelect"
            className="form-select"
            style={{ width: '180px' }}
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
          >
            <option value="popularity">Most Popular</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="discount">Highest Discount</option>
            <option value="newest">Newest Added</option>
          </select>
        </div>
      </div>

      <div className="search-page-layout">
        {/* Filter Sidebar */}
        <aside className="filter-sidebar">
          <div className="filter-title">
            <SvgIcon name="filter" size={16} />
            <span>Filter Catalog</span>
          </div>

          {/* Search Input Filter */}
          <div className="filter-section">
            <form onSubmit={handleSearchSubmit}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingRight: '36px', fontSize: '13px' }}
                  placeholder="Filter by name/model..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button
                  type="submit"
                  style={{ position: 'absolute', right: '8px', top: '9px', color: 'var(--color-text-muted)' }}
                >
                  <SvgIcon name="search" size={15} />
                </button>
              </div>
            </form>
          </div>

          {/* Category Filter */}
          <div className="filter-section">
            <div className="filter-heading">Category</div>
            <div className="filter-options">
              <label className="filter-checkbox-label">
                <input
                  type="radio"
                  name="catFilter"
                  checked={category === 'All'}
                  onChange={() => handleCategorySelect('All')}
                />
                <span>All Categories</span>
              </label>
              {categories.map((cat) => (
                <label key={cat} className="filter-checkbox-label">
                  <input
                    type="radio"
                    name="catFilter"
                    checked={category === cat}
                    onChange={() => handleCategorySelect(cat)}
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div className="filter-section">
            <div className="filter-heading">Brand</div>
            <div className="filter-options">
              <label className="filter-checkbox-label">
                <input
                  type="radio"
                  name="brandFilter"
                  checked={brand === 'All'}
                  onChange={() => handleBrandSelect('All')}
                />
                <span>All Brands</span>
              </label>
              {brands.map((b) => (
                <label key={b} className="filter-checkbox-label">
                  <input
                    type="radio"
                    name="brandFilter"
                    checked={brand === b}
                    onChange={() => handleBrandSelect(b)}
                  />
                  <span>{b}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="filter-section">
            <div className="filter-heading">Price Range (₹)</div>
            <div className="flex gap-2" style={{ marginBottom: '8px' }}>
              <input
                type="number"
                placeholder="Min"
                className="form-input"
                style={{ fontSize: '12px', padding: '6px 8px' }}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <input
                type="number"
                placeholder="Max"
                className="form-input"
                style={{ fontSize: '12px', padding: '6px 8px' }}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
            <button
              className="btn btn-secondary btn-sm w-full"
              onClick={() => { setPage(1); fetchResults(); }}
            >
              Apply Price
            </button>
          </div>

          {/* Reset Filters */}
          <button className="btn btn-outline btn-sm w-full" onClick={handleResetFilters}>
            Reset All Filters
          </button>
        </aside>

        {/* Product Catalog Grid */}
        <main>
          {loading ? (
            <LoadingSkeleton />
          ) : products.length === 0 ? (
            <div className="card empty-state">
              <SvgIcon name="search" size={36} color="var(--color-text-muted)" />
              <div className="empty-state-title">No matching products found</div>
              <div className="empty-state-desc">
                Try searching with different keywords, relaxing your price filters, or clearing the selected category.
              </div>
              <button className="btn btn-primary btn-sm" onClick={handleResetFilters} style={{ marginTop: '12px' }}>
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between" style={{ marginTop: '36px', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </button>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
