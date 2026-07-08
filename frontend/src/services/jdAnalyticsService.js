import apiClient from './apiClient'

export const jdAnalyticsService = {
  uploadJD: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post('/api/jd-analytics/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  getUploadedFile: () => apiClient.get('/api/jd-analytics/uploaded-file'),
  deleteUploadedFile: () => apiClient.delete('/api/jd-analytics/uploaded-file'),
  analyze: () => apiClient.post('/api/jd-analytics/analyze'),
  reanalyze: () => apiClient.post('/api/jd-analytics/reanalyze'),
  getAnalysis: () => apiClient.get('/api/jd-analytics/analysis'),
  downloadAnalysis: () => apiClient.get('/api/jd-analytics/download-json', { responseType: 'blob' })
}
