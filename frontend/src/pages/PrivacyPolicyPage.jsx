import React from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicyPage() {
  return (
    <div className="container" style={{ padding: '48px 20px 80px', maxWidth: '800px' }}>
      <div className="badge badge-primary" style={{ marginBottom: '12px' }}>Legal Disclosure</div>
      <h1 style={{ marginBottom: '16px' }}>Privacy Policy</h1>
      <p style={{ fontSize: '13px', color: 'var(--color-text-light)', marginBottom: '28px' }}>
        Last updated: November 2026
      </p>

      <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <section>
          <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>1. Information We Collect</h2>
          <p style={{ fontSize: '14px', lineHeight: '1.7' }}>
            PriceTrack collects account information when you register, including your full name, email address, and encrypted authentication credentials. We also store your custom watchlist preferences, target price alerts, and in-app notification status.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>2. How Information is Used</h2>
          <p style={{ fontSize: '14px', lineHeight: '1.7' }}>
            Collected data is strictly used to evaluate target price drop conditions, maintain personalized watchlists, and provide price comparison intelligence. We do not sell, rent, or lease personal customer data to any external marketing agencies.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>3. Cryptographic Storage & Passwords</h2>
          <p style={{ fontSize: '14px', lineHeight: '1.7' }}>
            We implement Node.js native cryptographic scrypt hashing with unique cryptographic salts for all user passwords. Plaintext passwords are never stored in our MongoDB databases or server logs.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>4. Third-Party E-Commerce Retailers</h2>
          <p style={{ fontSize: '14px', lineHeight: '1.7' }}>
            External retailer links (Amazon India, Flipkart, Croma, Reliance Digital, Myntra) redirect you directly to third-party merchant platforms. We are not responsible for the privacy practices or checkout procedures on those independent websites.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>5. Academic & Demonstration Notice</h2>
          <p style={{ fontSize: '14px', lineHeight: '1.7' }}>
            PriceTrack is developed as an academic project demonstrating full-stack MERN software architecture. Sample market feeds and simulated data feeds are utilized in demonstration mode.
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
