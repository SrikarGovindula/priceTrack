import React from 'react';
import SvgIcon from './SvgIcon';
import { validateStoreProductUrl } from '../utils/urlValidator';

export default function PriceComparisonTable({ listings = [], productName = '' }) {
  if (!listings || listings.length === 0) {
    return (
      <div className="comparison-container">
        <div className="empty-state">
          <SvgIcon name="info" size={32} color="var(--color-text-muted)" />
          <div className="empty-state-title">No store listings available</div>
          <div className="empty-state-desc">We are actively expanding data providers for this product.</div>
        </div>
      </div>
    );
  }

  // Sorted lowest to highest price
  const sortedListings = [...listings].sort((a, b) => a.currentPrice - b.currentPrice);
  const lowestPrice = sortedListings[0].currentPrice;
  const highestPrice = sortedListings[sortedListings.length - 1].currentPrice;
  const bestOption = sortedListings[0];
  const maxSavings = highestPrice - lowestPrice;

  // Validate bestOption URL
  const bestOptionValidation = bestOption
    ? validateStoreProductUrl(bestOption.store?.storeSlug, bestOption.productUrl)
    : { isValid: false };
  const isBestOptionExact = bestOption?.isExactProductUrl && bestOptionValidation.isValid;
  const bestOptionUrl = isBestOptionExact ? (bestOptionValidation.canonicalUrl || bestOption.productUrl) : null;

  return (
    <div className="comparison-container">
      <div className="comparison-header">
        <div>
          <h3>
            <SvgIcon name="store" size={18} color="var(--color-primary)" />
            Multi-Store Price Comparison
          </h3>
          <p style={{ fontSize: '12px', marginTop: '4px', color: 'var(--color-text-muted)' }}>
            Comparing verified pricing across {listings.length} online retailers. Only exact product detail page links are provided. Search query redirections and store homepages are strictly prohibited.
          </p>
        </div>
        <span className="badge badge-demo" title="Exact product page redirection enforced">
          Verified Exact Links Only
        </span>
      </div>

      {/* Best Option Highlight Banner */}
      {bestOption && (
        <div className="best-option-banner">
          <div className="best-option-info">
            <h4>
              Best Option: {bestOption.store?.storeName || 'Online Retailer'} at ₹{bestOption.currentPrice.toLocaleString('en-IN')}
            </h4>
            <p>
              {maxSavings > 0 
                ? `Save up to ₹${maxSavings.toLocaleString('en-IN')} compared to the highest available price.` 
                : 'Current lowest verified price available.'}
            </p>
          </div>
          {isBestOptionExact ? (
            <a
              href={bestOptionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-success btn-sm"
              title={`Open exact product detail page on ${bestOption.store?.storeName}`}
            >
              View Exact Product
              <SvgIcon name="external" size={13} color="#ffffff" />
            </a>
          ) : (
            <button
              disabled
              className="btn btn-secondary btn-sm"
              style={{ opacity: 0.65, cursor: 'not-allowed' }}
              title="Exact product detail page link is currently unavailable for this store"
            >
              Exact product link unavailable
            </button>
          )}
        </div>
      )}

      {/* Comparison Table */}
      <div className="comparison-table-wrapper">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Store</th>
              <th>Link Verification</th>
              <th>Current Price</th>
              <th>Price Difference</th>
              <th>Availability</th>
              <th>Delivery Time</th>
              <th>Last Verified</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedListings.map((item, idx) => {
              const isLowest = item.currentPrice === lowestPrice;
              const diff = item.currentPrice - lowestPrice;

              // Validate this listing's exact product URL
              const validation = validateStoreProductUrl(item.store?.storeSlug, item.productUrl);
              const isExact = (item.isExactProductUrl || item.urlType === 'exact_product') && validation.isValid;
              const exactUrl = isExact ? (validation.canonicalUrl || item.productUrl) : null;

              return (
                <tr key={item._id || idx} className={isLowest ? 'is-lowest' : ''}>
                  {/* Store Name & Logo */}
                  <td>
                    <div className="store-cell" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      {item.store?.storeLogo ? (
                        <img
                          src={item.store.storeLogo}
                          alt={item.store?.storeName}
                          className="store-logo-img"
                        />
                      ) : (
                        <span className="store-name-text">{item.store?.storeName || 'Store'}</span>
                      )}
                      {item.isSourceStore && (
                        <span className="badge badge-primary" style={{ fontSize: '9px', marginLeft: '4px' }}>
                          Pasted
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Verification Status Badge */}
                  <td>
                    {isExact ? (
                      <span
                        className="badge badge-success"
                        style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        title="Verified exact product detail page"
                      >
                        <SvgIcon name="check" size={11} />
                        Exact Product Link
                      </span>
                    ) : (
                      <span
                        className="badge badge-secondary"
                        style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', opacity: 0.8 }}
                        title="Exact product detail page link is currently unavailable"
                      >
                        <SvgIcon name="info" size={11} />
                        Link Unavailable
                      </span>
                    )}
                  </td>

                  {/* Price */}
                  <td>
                    <div className={`price-cell ${isLowest ? 'lowest-price' : ''}`}>
                      ₹{item.currentPrice.toLocaleString('en-IN')}
                    </div>
                    {isLowest && (
                      <span className="badge badge-success" style={{ marginTop: '4px' }}>
                        Lowest Price
                      </span>
                    )}
                  </td>

                  {/* Difference */}
                  <td>
                    {isLowest ? (
                      <span style={{ fontSize: '13px', color: 'var(--color-success)', fontWeight: 600 }}>
                        Base (Lowest)
                      </span>
                    ) : (
                      <span className="diff-badge">
                        +₹{diff.toLocaleString('en-IN')}
                      </span>
                    )}
                  </td>

                  {/* Availability */}
                  <td>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: item.availability === 'In Stock' ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                      {item.availability || 'In Stock'}
                    </span>
                  </td>

                  {/* Delivery */}
                  <td>
                    <span className="delivery-cell">
                      {item.deliveryInformation || 'Standard 2-4 days'}
                    </span>
                  </td>

                  {/* Last Verified Time */}
                  <td>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {item.urlVerifiedAt || item.lastUpdated
                        ? new Date(item.urlVerifiedAt || item.lastUpdated).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'Verified'}
                    </span>
                  </td>

                  {/* Action Button: View Exact Product OR Disabled Unavailable */}
                  <td>
                    {isExact ? (
                      <a
                        href={exactUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`btn btn-sm ${isLowest ? 'btn-primary' : 'btn-secondary'}`}
                        title={`Open exact product detail page on ${item.store?.storeName}`}
                      >
                        View Exact Product
                        <SvgIcon name="external" size={13} />
                      </a>
                    ) : (
                      <button
                        disabled
                        className="btn btn-sm btn-secondary"
                        style={{ opacity: 0.6, cursor: 'not-allowed', whiteSpace: 'nowrap', fontSize: '11px', padding: '6px 10px' }}
                        title="Exact product detail page link is currently unavailable for this store"
                      >
                        Exact product link unavailable
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
