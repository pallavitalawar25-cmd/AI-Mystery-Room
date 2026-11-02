import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  // Generation can require an initial Gemini response plus one validation retry.
  timeout: 130_000,
  headers: { 'Content-Type': 'application/json' },
})

export const createCase = async (payload) => (await apiClient.post('/cases', payload)).data
export const getCaseOptions = async () => (await apiClient.get('/cases/options')).data
export const getCase = async (id) => (await apiClient.get(`/cases/${encodeURIComponent(id)}`)).data
export const discoverClue = async (id, clueId) =>
  (await apiClient.post(`/cases/${encodeURIComponent(id)}/clues/${encodeURIComponent(clueId)}/discover`)).data
export const requestHint = async (id) => (await apiClient.post(`/cases/${encodeURIComponent(id)}/hints`, {})).data
export const submitAccusation = async (id, suspectId) =>
  (await apiClient.post(`/cases/${encodeURIComponent(id)}/accuse`, { suspectId })).data
export const getResult = async (id) => (await apiClient.get(`/cases/${encodeURIComponent(id)}/result`)).data

export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error?.response) return 'Could not reach the case server. Check your connection and try again.'
  return error.response.data?.error?.message || error.response.data?.message || fallback
}
