import apiClient from './apiClient'

export const profileService = {
  getProfile: () => apiClient.get('/api/profile-builder/profile'),
  createProfile: (payload) => apiClient.post('/api/profile-builder/profile', payload),
  updateProfile: (payload) => apiClient.put('/api/profile-builder/profile', payload),
  deleteProfile: () => apiClient.delete('/api/profile-builder/profile'),
  analyzeResume: (formData) => apiClient.post('/api/resume/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
