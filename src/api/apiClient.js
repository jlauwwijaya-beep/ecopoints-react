/**
 * EcoPoints API Client
 * Terhubung ke backend REST API (default: http://localhost:8090/api/v1)
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090/api/v1';

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('ep_token');

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

    // Auto-logout jika 401 Unauthorized
    if (res.status === 401) {
      localStorage.removeItem('ep_token');
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
  getMe: () => request('/auth/me')
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

export default {
  auth: authApi,
  master: masterApi,
  deposits: depositApi,
  rewards: rewardApi
};
