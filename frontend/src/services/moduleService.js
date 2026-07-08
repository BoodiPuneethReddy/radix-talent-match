import apiClient from './apiClient'

export const moduleService = {
  getTalentCheckStatus: () => apiClient.get('/api/talent-check/status'),
  getSkillMatchingStatus: () => apiClient.get('/api/skill-matching/status')
}
