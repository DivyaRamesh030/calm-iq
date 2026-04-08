import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

// ── Users ────────────────────────────────────────────────────────────────────
export const createUser = (data) => api.post('/users/', data).then(r => r.data)
export const getUserByEmail = (email) => api.get(`/users/by-email/${encodeURIComponent(email)}`).then(r => r.data)
export const getUser = (id) => api.get(`/users/${id}`).then(r => r.data)

// ── Stress ───────────────────────────────────────────────────────────────────
export const predictStress = (user_id, inputs) =>
  api.post('/stress/predict', { user_id, inputs }).then(r => r.data)

export const getUserLogs = (user_id, limit = 30) =>
  api.get(`/stress/user/${user_id}?limit=${limit}`).then(r => r.data)

export const getTrend = (user_id, days = 14) =>
  api.get(`/stress/user/${user_id}/trend?days=${days}`).then(r => r.data)

export const getStats = (user_id) =>
  api.get(`/stress/user/${user_id}/stats`).then(r => r.data)

export const deleteLog = (log_id) =>
  api.delete(`/stress/${log_id}`).then(r => r.data)
