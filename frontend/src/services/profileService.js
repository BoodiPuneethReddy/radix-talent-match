import apiClient from './apiClient'

export const profileService = {
  getProfile: () => apiClient.get('/api/profile-builder/profile'),
  createProfile: (payload) => apiClient.post('/api/profile-builder/profile', payload),
  updateProfile: (payload) => apiClient.put('/api/profile-builder/profile', payload),
  deleteProfile: () => apiClient.delete('/api/profile-builder/profile'),
  autosaveProfile: (payload) => apiClient.post('/api/profile-builder/autosave', payload),
  getAutosaveProfile: () => apiClient.get('/api/profile-builder/autosave'),
  resetProfile: () => apiClient.post('/api/profile-builder/reset'),
  importProfile: (payload) => apiClient.post('/api/profile-builder/import', payload),
  exportProfile: () => apiClient.get('/api/profile-builder/export', { responseType: 'blob' }),
  previewProfile: () => apiClient.get('/api/profile-builder/preview'),
  uploadResume: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post('/api/profile-builder/upload/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  uploadPhoto: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post('/api/profile-builder/upload/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}
