import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import SvgIcon from './SvgIcon';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo-icon">
            <SvgIcon name="trending" size={16} color="#ffffff" />
          </div>
          <span>PriceTrack</span>
        </Link>

        {/* Desktop Links */}
        <ul className="navbar-links">
          <li><NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Home</NavLink></li>
          <li><NavLink to="/search" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Compare Prices</NavLink></li>
          <li><NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Price History</NavLink></li>
          <li><NavLink to="/deals" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Deals</NavLink></li>
          <li><NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>About</NavLink></li>
          <li><NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Contact</NavLink></li>
        </ul>

        {/* Right Actions */}
        <div className="navbar-actions">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            <SvgIcon name={isDark ? 'sun' : 'moon'} size={17} />
          </button>

          {/* Notifications Dropdown (for authenticated users) */}
          {user && (
            <div className="notif-btn-wrapper" ref={notifRef}>
              <button
                className="notif-btn"
                onClick={() => setShowNotifs(!showNotifs)}
                title="Notifications"
                aria-label="Notifications"
              >
                <SvgIcon name="bell" size={18} />
                {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
              </button>

              {showNotifs && (
                <div className="notif-dropdown">
                  <div className="notif-header">
                    <h4>Notifications</h4>
                    {unreadCount > 0 && (
                      <button className="btn btn-sm btn-secondary" onClick={markAllAsRead}>
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="notif-list">
                    {notifications.length === 0 ? (
                      <div className="empty-state" style={{ padding: '24px 16px' }}>
                        <SvgIcon name="bell" size={24} color="var(--color-text-muted)" />
                        <p style={{ fontSize: '13px' }}>No notifications yet</p>
                      </div>
                    ) : (
                      notifications.slice(0, 10).map(n => (
                        <div
                          key={n._id}
                          className={`notif-item ${!n.isRead ? 'unread' : ''}`}
                          onClick={() => {
                            if (!n.isRead) markAsRead(n._id);
                            if (n.productId) {
                              navigate(`/product/${n.productId}`);
                              setShowNotifs(false);
                            }
                          }}
                        >
                          <div style={{ color: 'var(--color-primary)', marginTop: '2px' }}>
                            <SvgIcon name="tag" size={16} />
                          </div>
                          <div className="notif-item-body">
                            <div className="notif-item-title">{n.title}</div>
                            <div className="notif-item-desc">{n.message}</div>
                            <div className="notif-item-time">
                              {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="notif-footer">
                    <Link
                      to="/dashboard?tab=notifications"
                      onClick={() => setShowNotifs(false)}
                      style={{ color: 'var(--color-primary)', fontWeight: 600 }}
                    >
                      View all in Dashboard
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Menu / Login Buttons */}
          {user ? (
            <div style={{ position: 'relative' }} ref={userMenuRef}>
              <button
                className="user-menu-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <SvgIcon name="user" size={16} />
                <span>{user.name.split(' ')[0]}</span>
                <SvgIcon name="chevron-down" size={14} />
              </button>

              {showUserMenu && (
                <div
                  className="card"
                  style={{
                    position: 'absolute',
                    top: '44px',
                    right: 0,
                    width: '200px',
                    zIndex: 1010,
                    padding: '8px',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                >
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border)', marginBottom: '4px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{user.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{user.email}</div>
                    {isAdmin && (
                      <span className="badge badge-primary" style={{ marginTop: '4px', display: 'inline-block' }}>
                        Admin
                      </span>
                    )}
                  </div>

                  <Link
                    to="/dashboard"
                    className="dashboard-nav-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <SvgIcon name="user" size={15} /> Dashboard
                  </Link>

                  <Link
                    to="/watchlist"
                    className="dashboard-nav-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <SvgIcon name="heart" size={15} /> Watchlist
                  </Link>

                  <Link
                    to="/alerts"
                    className="dashboard-nav-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <SvgIcon name="bell" size={15} /> Price Alerts
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="dashboard-nav-item"
                      onClick={() => setShowUserMenu(false)}
                      style={{ color: 'var(--color-secondary)' }}
                    >
                      <SvgIcon name="shield" size={15} /> Admin Portal
                    </Link>
                  )}

                  <div style={{ borderTop: '1px solid var(--color-border)', margin: '4px 0' }}></div>

                  <button
                    className="dashboard-nav-item"
                    style={{ width: '100%', color: 'var(--color-danger)' }}
                    onClick={handleLogout}
                  >
                    <SvgIcon name="close" size={15} /> Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn btn-secondary btn-sm">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <SvgIcon name={mobileMenuOpen ? 'close' : 'filter'} size={18} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            background: 'var(--color-bg)',
            borderBottom: '1px solid var(--color-border)',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/search" onClick={() => setMobileMenuOpen(false)}>Compare Prices</Link>
          <Link to="/history" onClick={() => setMobileMenuOpen(false)}>Price History</Link>
          <Link to="/deals" onClick={() => setMobileMenuOpen(false)}>Deals</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)}>About</Link>
          <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          {user && (
            <>
              <div style={{ borderTop: '1px solid var(--color-border)', margin: '4px 0' }}></div>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>My Dashboard</Link>
              <Link to="/watchlist" onClick={() => setMobileMenuOpen(false)}>Watchlist</Link>
              <Link to="/alerts" onClick={() => setMobileMenuOpen(false)}>Price Alerts</Link>
              {isAdmin && <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>Admin Panel</Link>}
            </>
          )}
        </div>
      )}
    </nav>
  );
}
