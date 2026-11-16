import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import SvgIcon from '../components/SvgIcon';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !token || !newPassword) {
      setError('Email, reset token and new password are required.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.resetPassword({ email, token, newPassword });
      setSuccess(res.message);
      showToast('Password updated! You can now log in.', 'success');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '64px 20px', maxWidth: '440px' }}>
      <div className="card" style={{ padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2>Reset Password</h2>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>
            Enter your token and configure your new secure password.
          </p>
        </div>

        {error && (
          <div className="alert-box alert-box-error">
            <SvgIcon name="alert" size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert-box alert-box-success">
            <SvgIcon name="check" size={16} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="resetEmail">Email Address</label>
            <input
              id="resetEmail"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="resetToken">Reset Token</label>
            <input
              id="resetToken"
              type="text"
              className="form-input"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste 48-char hex token"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              className="form-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Updating Password...' : 'Save New Password'}
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
