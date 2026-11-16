import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import SvgIcon from '../components/SvgIcon';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [demoToken, setDemoToken] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage('');
    try {
      const res = await api.forgotPassword(email);
      setMessage(res.message);
      if (res.demoResetToken) {
        setDemoToken(res.demoResetToken);
      }
    } catch (err) {
      setMessage(err.message || 'Error generating reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '64px 20px', maxWidth: '440px' }}>
      <div className="card" style={{ padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2>Forgot Password</h2>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>
            Enter your email to receive a password reset token.
          </p>
        </div>

        {message && (
          <div className="alert-box alert-box-info">
            <SvgIcon name="info" size={16} />
            <span>{message}</span>
          </div>
        )}

        {demoToken && (
          <div className="alert-box alert-box-success" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <div><strong>Demonstration Reset Token Generated:</strong></div>
            <code style={{ wordBreak: 'break-all', marginTop: '4px' }}>{demoToken}</code>
            <button
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '8px' }}
              onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(demoToken)}`)}
            >
              Proceed to Reset Password Page
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="forgotEmail">Email Address</label>
            <input
              id="forgotEmail"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Sending Request...' : 'Generate Reset Token'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px' }}>
          <Link to="/login" style={{ color: 'var(--color-primary)' }}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
