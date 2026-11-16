import React from 'react';
import { Link } from 'react-router-dom';
import SvgIcon from '../components/SvgIcon';

export default function AboutPage() {
  return (
    <div className="container" style={{ padding: '48px 20px 80px', maxWidth: '840px' }}>
      <div className="badge badge-primary" style={{ marginBottom: '12px' }}>
        About the Platform
      </div>
      <h1 style={{ marginBottom: '16px' }}>About PriceTrack</h1>
      <p style={{ fontSize: '16px', lineHeight: '1.7', marginBottom: '32px' }}>
        PriceTrack is a centralized online shopping price comparison and monitoring platform developed to eliminate price dispersion across major e-commerce retailers.
      </p>

      <div className="card" style={{ padding: '28px', marginBottom: '28px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>Project Background and Objectives</h2>
        <p style={{ fontSize: '14px', lineHeight: '1.7', marginBottom: '16px' }}>
          In modern online shopping, the same electronic item is frequently priced differently across retailers like Amazon India, Flipkart, Croma, and Reliance Digital. Furthermore, online retail prices fluctuate continuously based on demand algorithms and sales cycles.
        </p>
        <p style={{ fontSize: '14px', lineHeight: '1.7' }}>
          PriceTrack addresses this by consolidating store listings into a single transparent interface, maintaining 90-day historical tracking data, and enabling shoppers to set automated target price drop alerts.
        </p>
      </div>

      <div className="card" style={{ padding: '28px', marginBottom: '28px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Architectural Highlights</h2>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px' }}>
          <li className="flex items-center gap-3">
            <SvgIcon name="check" size={16} color="var(--color-primary)" />
            <span><strong>Full MERN Stack:</strong> React.js frontend, Node.js and Express.js REST API layer, and native MongoDB document store.</span>
          </li>
          <li className="flex items-center gap-3">
            <SvgIcon name="check" size={16} color="var(--color-primary)" />
            <span><strong>Native SVG Visualizations:</strong> Custom-built responsive SVG time-series charts with interactive tooltips and historical analytics.</span>
          </li>
          <li className="flex items-center gap-3">
            <SvgIcon name="check" size={16} color="var(--color-primary)" />
            <span><strong>Scrypt Security:</strong> Cryptographic password hashing utilizing Node.js built-in scrypt and secure session tokens.</span>
          </li>
          <li className="flex items-center gap-3">
            <SvgIcon name="check" size={16} color="var(--color-primary)" />
            <span><strong>Background Price Daemon:</strong> Periodic background runner evaluating target price drops and generating real-time user notifications.</span>
          </li>
        </ul>
      </div>

      <div className="flex gap-3">
        <Link to="/search" className="btn btn-primary">Start Comparing Prices</Link>
        <Link to="/contact" className="btn btn-secondary">Contact Technical Team</Link>
      </div>
    </div>
  );
}
