import apiClient from './apiClient'

export const moduleService = {
  getModuleStatus: (modulePath) => apiClient.get(modulePath)
}
