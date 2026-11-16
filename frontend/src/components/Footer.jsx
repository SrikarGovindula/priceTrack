import React from 'react';
import { Link } from 'react-router-dom';
import SvgIcon from './SvgIcon';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--color-bg-alt)', borderTop: '1px solid var(--color-border)', marginTop: 'auto', padding: '48px 0 24px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px', marginBottom: '40px' }}>
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '12px' }}>
              <div className="navbar-logo-icon">
                <SvgIcon name="trending" size={16} color="#ffffff" />
              </div>
              <span style={{ fontSize: '18px', fontWeight: 700 }}>PriceTrack</span>
            </div>
            <p style={{ fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
              Centralized e-commerce price comparison and monitoring platform. Compare multi-store prices, analyze 90-day price history graphs, and receive target price drop alerts.
            </p>
            <span className="badge badge-demo">Simulated Market Data Feed</span>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <li><Link to="/" style={{ color: 'var(--color-text-muted)' }}>Home</Link></li>
              <li><Link to="/search" style={{ color: 'var(--color-text-muted)' }}>Compare Prices</Link></li>
              <li><Link to="/history" style={{ color: 'var(--color-text-muted)' }}>Price History</Link></li>
              <li><Link to="/deals" style={{ color: 'var(--color-text-muted)' }}>Deals and Trending</Link></li>
              <li><Link to="/about" style={{ color: 'var(--color-text-muted)' }}>About PriceTrack</Link></li>
              <li><Link to="/contact" style={{ color: 'var(--color-text-muted)' }}>Contact and Support</Link></li>
            </ul>
          </div>

          {/* Supported Stores */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Supported Retailers
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <li>
                <a href="https://www.amazon.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text-muted)' }}>
                  Amazon India <SvgIcon name="external" size={12} />
                </a>
              </li>
              <li>
                <a href="https://www.flipkart.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text-muted)' }}>
                  Flipkart <SvgIcon name="external" size={12} />
                </a>
              </li>
              <li>
                <a href="https://www.croma.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text-muted)' }}>
                  Croma <SvgIcon name="external" size={12} />
                </a>
              </li>
              <li>
                <a href="https://www.reliancedigital.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text-muted)' }}>
                  Reliance Digital <SvgIcon name="external" size={12} />
                </a>
              </li>
              <li>
                <a href="https://www.myntra.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text-muted)' }}>
                  Myntra <SvgIcon name="external" size={12} />
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Policy */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Legal and Policies
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <li><Link to="/privacy" style={{ color: 'var(--color-text-muted)' }}>Privacy Policy</Link></li>
              <li><Link to="/terms" style={{ color: 'var(--color-text-muted)' }}>Terms and Conditions</Link></li>
              <li><Link to="/about" style={{ color: 'var(--color-text-muted)' }}>Demo Data Disclosure</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Line */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: 'var(--color-text-light)' }}>
          <div>
            &copy; {new Date().getFullYear()} PriceTrack Platform. All rights reserved. Built with MERN Stack.
          </div>
          <div>
            Search: Compare: Track: Watchlist: Alert
          </div>
        </div>
      </div>
    </footer>
  );
}
