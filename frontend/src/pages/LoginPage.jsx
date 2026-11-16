import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import SvgIcon from '../components/SvgIcon';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user, login } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state?.from?.pathname && location.state.from.pathname !== '/login')
    ? location.state.from.pathname
    : '/dashboard';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      showToast(`Welcome back, ${res.user.name}!`, 'success');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (userEmail, userPass) => {
    setEmail(userEmail);
    setPassword(userPass);
  };

  return (
    <div className="container" style={{ padding: '64px 20px', maxWidth: '440px' }}>
      <div className="card" style={{ padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="navbar-logo-icon" style={{ margin: '0 auto 12px', width: '36px', height: '36px' }}>
            <SvgIcon name="trending" size={20} color="#ffffff" />
          </div>
          <h2>Log In to PriceTrack</h2>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>
            Access your personalized watchlist and automated price alerts.
          </p>
        </div>

        {error && (
          <div className="alert-box alert-box-error">
            <SvgIcon name="alert" size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="loginEmail">Email Address</label>
            <input
              id="loginEmail"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="form-group">
            <div className="flex justify-between items-center" style={{ marginBottom: '6px' }}>
              <label className="form-label" htmlFor="loginPassword" style={{ marginBottom: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '12px', color: 'var(--color-primary)' }}>
                Forgot password?
              </Link>
            </div>
            <input
              id="loginPassword"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        {/* Quick-Fill Demo Credentials */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '10px', textAlign: 'center' }}>
            Evaluation Demo Accounts:
          </div>
          <div className="flex gap-2" style={{ justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fillCredentials('user@pricetrack.com', 'UserPassword123!')}
            >
              Fill Test User
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fillCredentials('admin@pricetrack.com', 'AdminPassword123!')}
            >
              Fill Admin
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
          Don&apos;t have an account?{' '}
          <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
}
