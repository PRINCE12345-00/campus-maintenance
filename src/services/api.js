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

export const complaintsApi = {
  getAll: () => api.get('/complaints'),
  create: (payload) => api.post('/complaints', payload),
  updateStatus: (id, status, reviewerRole = 'admin') => api.patch(`/complaints/${id}/status`, { status, reviewerRole }),
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
}

export default api
