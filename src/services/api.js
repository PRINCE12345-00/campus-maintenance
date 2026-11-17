import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const authApi = {
  login: (payload) => api.post('/auth/login', payload),
  register: (payload) => api.post('/auth/register', payload),
}

export const analyticsApi = {
  get: () => api.get('/analytics'),
  getPredictiveMaintenance: () => api.get('/analytics/predictive-maintenance'),
  getAssetHealthMatrix: () => api.get('/analytics/asset-health-matrix'),
  clusterDuplicates: (target_id, threshold = 0.50) => api.post('/analytics/cluster-duplicates', { target_id, threshold }),
}

export const chatbotApi = {
  sendQuery: (query) => api.post('/chat', { query }),
}

export const visionApi = {
  analyzeImage: (image_base64, filename, category) => api.post('/vision/analyze', { image_base64, filename, category }),
}

export const complaintsApi = {
  getAll: () => api.get('/complaints'),
  create: (payload) => api.post('/complaints', payload),
  updateStatus: (id, status, reviewerRole = 'admin', extra = {}) =>
    api.patch(`/complaints/${id}/status`, { status, reviewerRole, ...extra }),
  sendUpdate: (id, payload) => api.patch(`/complaints/${id}/status`, payload),
  notify: (id, payload) => api.post(`/complaints/${id}/notify`, payload),
  reviewEvidence: (id, decision, reason) => api.patch(`/complaints/${id}/evidence-review`, { decision, reason }),
}

export const permissionsApi = {
  getAll: () => api.get('/permissions'),
  create: (payload) => api.post('/permissions', payload),
  updateStatus: (id, status) => api.patch(`/permissions/${id}/status`, { status }),
  review: (id, decision, reviewerRole = 'admin', comment = '') => api.patch(`/permissions/${id}/status`, { decision, reviewerRole, comment }),
  resubmit: (id, studentResponse) => api.patch(`/permissions/${id}/resubmit`, { studentResponse }),
}

export const notificationsApi = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: (userEmail) => api.patch('/notifications/read-all', { userEmail }),
  clearAll: (userEmail) => api.delete('/notifications/clear', { data: { userEmail } }),
}

export const usersApi = {
  getAll: () => api.get('/users'),
  create: (payload) => api.post('/users', payload),
  update: (id, payload) => api.patch(`/users/${id}`, payload),
  delete: (id) => api.delete(`/users/${id}`),
  broadcast: (payload) => api.post('/users/broadcast', payload),
  sendMessage: (id, payload) => api.post(`/users/${id}/message`, payload),
}

export const newsletterApi = {
  subscribe: (email) => api.post('/newsletter/subscribe', { email }),
  getSubscribers: () => api.get('/newsletter/subscribers'),
}

export default api
