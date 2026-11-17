const API_BASE =
  import.meta.env.VITE_API_BASE_URL || '/api';

class ApiService {
  getToken() {
    return localStorage.getItem('pt_token') || '';
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('pt_token', token);
    } else {
      localStorage.removeItem('pt_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
      credentials: 'include'
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(data.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      throw err;
    }
  }

  // Auth APIs
  register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  logout() {
    return this.request('/auth/logout', {
      method: 'POST'
    });
  }

  getMe() {
    return this.request('/auth/me');
  }

  updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  resetPassword(payload) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Product APIs
  getProducts(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    return this.request(`/products?${query.toString()}`);
  }

  getProductById(id) {
    return this.request(`/products/${id}`);
  }

  getSearchSuggestions(q) {
    return this.request(`/products/suggestions?q=${encodeURIComponent(q)}`);
  }

  getCategories() {
    return this.request('/products/categories');
  }

  getBrands() {
    return this.request('/products/brands');
  }

  getDeals(limit = 8) {
    return this.request(`/products/deals?limit=${limit}`);
  }

  getTrending(limit = 8) {
    return this.request(`/products/trending?limit=${limit}`);
  }

  compareUrl(url) {
    return this.request('/products/compare-url', {
      method: 'POST',
      body: JSON.stringify({ url })
    });
  }

  identifyUrl(url) {
    return this.request('/products/identify-url', {
      method: 'POST',
      body: JSON.stringify({ url })
    });
  }

  // Price APIs
  getPriceComparison(productId) {
    return this.request(`/prices/${productId}`);
  }

  getPriceHistory(productId, days = '30') {
    return this.request(`/prices/${productId}/history?days=${days}`);
  }

  getBestPrice(productId) {
    return this.request(`/prices/${productId}/best-price`);
  }

  // Watchlist APIs
  getWatchlist() {
    return this.request('/watchlist');
  }

  addToWatchlist(productId, targetPrice = null) {
    return this.request('/watchlist', {
      method: 'POST',
      body: JSON.stringify({ productId, targetPrice })
    });
  }

  updateWatchlistItem(id, data) {
    return this.request(`/watchlist/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  removeFromWatchlist(id) {
    return this.request(`/watchlist/${id}`, {
      method: 'DELETE'
    });
  }

  // Alert APIs
  getAlerts() {
    return this.request('/alerts');
  }

  createAlert(productId, targetPrice) {
    return this.request('/alerts', {
      method: 'POST',
      body: JSON.stringify({ productId, targetPrice })
    });
  }

  updateAlert(id, data) {
    return this.request(`/alerts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  deleteAlert(id) {
    return this.request(`/alerts/${id}`, {
      method: 'DELETE'
    });
  }

  // Notification APIs
  getNotifications() {
    return this.request('/notifications');
  }

  markNotificationRead(id) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT'
    });
  }

  markAllNotificationsRead() {
    return this.request('/notifications/read-all', {
      method: 'PUT'
    });
  }

  deleteNotification(id) {
    return this.request(`/notifications/${id}`, {
      method: 'DELETE'
    });
  }

  clearAllNotifications() {
    return this.request('/notifications', {
      method: 'DELETE'
    });
  }

  // Admin APIs
  getAdminDashboard() {
    return this.request('/admin/dashboard');
  }

  getAdminUsers() {
    return this.request('/admin/users');
  }

  getAdminStores() {
    return this.request('/admin/stores');
  }

  updateStoreListingPrice(productId, storeId, newPrice) {
    return this.request('/admin/store-listings/price', {
      method: 'PUT',
      body: JSON.stringify({ productId, storeId, newPrice })
    });
  }

  triggerPriceRefresh() {
    return this.request('/admin/price-jobs/refresh', {
      method: 'POST'
    });
  }

  getPriceJobs() {
    return this.request('/admin/price-jobs');
  }
}

export const api = new ApiService();
