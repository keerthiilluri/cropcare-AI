const API_BASE_URL = 'http://localhost:8000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = { ...options.headers };

  // Do not set Content-Type if sending FormData (browser handles boundary automatically)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'Network request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || JSON.stringify(errJson);
    } catch {
      errorDetail = response.statusText || errorDetail;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: (creds) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(creds),
    }),

  getMe: (token) =>
    request('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  updateProfile: (profileData, token) =>
    request('/auth/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(profileData),
    }),

  // AI Crop Disease Detection
  detectDisease: (formData, token = null) => {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return request('/detection/detect', {
      method: 'POST',
      headers,
      body: formData,
    });
  },

  getDetectionHistory: (token) =>
    request('/detection/history', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  deleteDetectionHistory: (id, token) =>
    request(`/detection/history/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),

  // Disease Reports
  submitReport: (formData, token = null) => {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return request('/reports', {
      method: 'POST',
      headers,
      body: formData,
    });
  },

  getMyReports: (token) =>
    request('/reports/my', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getReportById: (id) => request(`/reports/${id}`),

  getOutbreaks: () => request('/reports/outbreaks'),

  // Disease Knowledge Base & Tips
  getDiseases: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/diseases${query ? `?${query}` : ''}`);
  },

  getCrops: () => request('/diseases/crops'),

  getDiseaseById: (id) => request(`/diseases/${id}`),

  getTips: () => request('/tips'),

  // Farmer Dashboard
  getFarmerDashboard: (token) =>
    request('/farmer/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  // Admin Portal
  getAdminStats: (token) =>
    request('/admin/stats', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getAdminFarmers: (token) =>
    request('/admin/farmers', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getAdminReports: (params = {}, token) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/reports${query ? `?${query}` : ''}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  updateReportStatus: (id, statusData, token) =>
    request(`/admin/reports/${id}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(statusData),
    }),

  getAdminDetections: (token) =>
    request('/admin/detections', {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
