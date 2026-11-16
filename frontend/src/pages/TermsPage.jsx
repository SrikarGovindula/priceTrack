import React from 'react';
import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="container" style={{ padding: '48px 20px 80px', maxWidth: '800px' }}>
      <div className="badge badge-primary" style={{ marginBottom: '12px' }}>Terms of Service</div>
      <h1 style={{ marginBottom: '16px' }}>Terms and Conditions</h1>
      <p style={{ fontSize: '13px', color: 'var(--color-text-light)', marginBottom: '28px' }}>
        Last updated: November 2026
      </p>

      <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <section>
          <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>1. Acceptance of Terms</h2>
          <p style={{ fontSize: '14px', lineHeight: '1.7' }}>
            By registering for an account or using PriceTrack, you agree to comply with and be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the application.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>2. Price Comparison & Availability Disclaimer</h2>
          <p style={{ fontSize: '14px', lineHeight: '1.7' }}>
            PriceTrack compares publicly available and simulated price feeds across multiple e-commerce stores. While we strive to maintain accurate data through scheduled monitoring, product availability, taxes, and final prices are determined solely by the respective merchant at checkout.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>3. User Conduct & Security</h2>
          <p style={{ fontSize: '14px', lineHeight: '1.7' }}>
            Users are responsible for safeguarding their login credentials. Any automated scraping, denial of service attacks, or unauthorized penetration testing of PriceTrack endpoints is strictly prohibited.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>4. Limitation of Liability</h2>
          <p style={{ fontSize: '14px', lineHeight: '1.7' }}>
            PriceTrack and its creators shall not be liable for any indirect, incidental, or consequential damages resulting from price fluctuations, stock discrepancies, or delivery delays on third-party merchant sites.
          </p>
        </section>
      </div>

      <div style={{ marginTop: '24px' }}>
        <Link to="/" className="btn btn-secondary btn-sm">
          Return to Home
        </Link>
      </div>
    </div>
  );
}
