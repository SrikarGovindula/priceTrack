import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import SvgIcon from '../components/SvgIcon';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user, register } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state?.from?.pathname && location.state.from.pathname !== '/register' && location.state.from.pathname !== '/login')
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

    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await register(name, email, password, confirmPassword);
      showToast(`Welcome to PriceTrack, ${res.user.name}!`, 'success');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '64px 20px', maxWidth: '440px' }}>
      <div className="card" style={{ padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="navbar-logo-icon" style={{ margin: '0 auto 12px', width: '36px', height: '36px' }}>
            <SvgIcon name="trending" size={20} color="#ffffff" />
          </div>
          <h2>Create Your Account</h2>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>
            Join PriceTrack to monitor multi-store prices and track historical drops.
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
            <label className="form-label" htmlFor="regName">Full Name</label>
            <input
              id="regName"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="regEmail">Email Address</label>
            <input
              id="regEmail"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="regPassword">Password</label>
            <input
              id="regPassword"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="regConfirmPassword">Confirm Password</label>
            <input
              id="regConfirmPassword"
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
