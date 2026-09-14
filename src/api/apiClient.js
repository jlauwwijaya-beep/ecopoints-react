/**
 * EcoPoints API Client
 * Terhubung ke backend REST API (default: http://localhost:8090/api/v1)
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090/api/v1';

let inMemoryToken = typeof window !== 'undefined' ? localStorage.getItem('ep_token') : null;

export function setAuthToken(token) {
  inMemoryToken = token;
  if (token) {
    localStorage.setItem('ep_token', token);
  } else {
    localStorage.removeItem('ep_token');
  }
}

export function getAuthToken() {
  if (inMemoryToken) return inMemoryToken;
  if (typeof window !== 'undefined') {
    return localStorage.getItem('ep_token');
  }
  return null;
}

export async function request(endpoint, options = {}) {
  const token = options.token || getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, config);

    // Auto-logout jika 401 Unauthorized (kecuali saat mencoba login/register)
    if (res.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
      setAuthToken(null);
      localStorage.removeItem('ep_user');
      // trigger custom event agar UI tahu
      window.dispatchEvent(new Event('ep_unauthorized'));
    }

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg = data?.message || data?.error || `HTTP Error ${res.status}`;
      return { success: false, error: errorMsg, status: res.status, data: null };
    }

    return { success: true, data: data?.data ?? data, message: data?.message };
  } catch (err) {
    // Backend offline / connection refused
    return {
      success: false,
      isOffline: true,
      error: `Tidak dapat terhubung ke API backend (${BASE_URL}). Pastikan server backend Anda sudah berjalan.`
    };
  }
}

// Health Check
export const healthApi = {
  check: async () => {
    try {
      const rootUrl = BASE_URL.replace(/\/api\/v1\/?$/, '');
      const res = await fetch(`${rootUrl}/health`);
      if (!res.ok) return { success: false };
      const data = await res.json();
      return { success: true, data: data?.data };
    } catch {
      return { success: false };
    }
  }
};

// Auth APIs
export const authApi = {
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
  register: (name, email, password) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    }),
  getMe: (token) => request('/auth/me', token ? { token } : {})
};

// Waste Types & Drop Points
export const masterApi = {
  getWasteTypes: () => request('/waste-types'),
  getDropPoints: () => request('/drop-points'),
  getLeaderboard: () => request('/leaderboard')
};

// Waste Deposits
export const depositApi = {
  getAll: (params = '') => request(`/waste-deposits${params ? `?${params}` : ''}`),
  getById: (id) => request(`/waste-deposits/${id}`),
  create: (payload) =>
    request('/waste-deposits', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  verify: (id, payload) =>
    request(`/waste-deposits/${id}/verify`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
};

// Rewards
export const rewardApi = {
  getAll: () => request('/rewards'),
  redeem: (id) =>
    request(`/rewards/${id}/redeem`, {
      method: 'POST'
    })
};

// Points & Transactions
export const pointApi = {
  getTransactions: () => request('/point-transactions')
};

// Admin APIs
export const adminApi = {
  // Deposit management
  updateDepositStatus: (id, status, notes) =>
    request(`/waste-deposits/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes })
    }),

  // Waste type CRUD
  createWasteType: (payload) =>
    request('/waste-types', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateWasteType: (id, payload) =>
    request(`/waste-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),
  deleteWasteType: (id) =>
    request(`/waste-types/${id}`, { method: 'DELETE' }),

  // Reward CRUD
  createReward: (payload) =>
    request('/rewards', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateReward: (id, payload) =>
    request(`/rewards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),
  deleteReward: (id) =>
    request(`/rewards/${id}`, { method: 'DELETE' }),

  // Redemptions
  getRedemptions: () => request('/reward-redemptions'),
  updateRedemptionStatus: (id, status, notes) =>
    request(`/reward-redemptions/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes })
    }),

  // Reports
  getReportsSummary: () => request('/reports/summary')
};

export default {
  auth: authApi,
  master: masterApi,
  deposits: depositApi,
  rewards: rewardApi,
  points: pointApi,
  health: healthApi,
  admin: adminApi
};
