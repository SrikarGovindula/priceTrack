import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = api.getToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const res = await api.getMe();
      if (res && res.user) {
        setUser(res.user);
      } else {
        api.setToken(null);
        setUser(null);
      }
    } catch (err) {
      api.setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await api.login({ email, password });
      if (res.token) {
        api.setToken(res.token);
      }
      setUser(res.user);
      return res;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (name, email, password, confirmPassword) => {
    setError(null);
    try {
      const res = await api.register({ name, email, password, confirmPassword });
      if (res.token) {
        api.setToken(res.token);
      }
      setUser(res.user);
      return res;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      // Ignore network errors during logout
    } finally {
      api.setToken(null);
      setUser(null);
    }
  };

  const updateProfile = async (name) => {
    try {
      const res = await api.updateProfile({ name });
      setUser(prev => ({ ...prev, name: res.user.name }));
      return res;
    } catch (err) {
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateProfile,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
