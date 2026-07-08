import apiClient from './apiClient'

export const profileService = {
  load: async () => {
    const { data } = await apiClient.get('/profile-builder/profile')
    return data
  },
  save: async (profile) => {
    const { data } = await apiClient.post('/profile-builder/profile/save', profile)
    return data
  },
  update: async (profile) => {
    const { data } = await apiClient.put('/profile-builder/profile/update', profile)
    return data
  },
  autosave: async (profile) => {
    const { data } = await apiClient.post('/profile-builder/profile/autosave', profile)
    return data
  },
  delete: async () => {
    const { data } = await apiClient.delete('/profile-builder/profile')
    return data
  },
  uploadResume: async (file) => {
    const form = new FormData()
    form.append('file', file)
    const { data } = await apiClient.post('/profile-builder/upload/resume', form)
    return data
  },
  uploadPhoto: async (file) => {
    const form = new FormData()
    form.append('file', file)
    const { data } = await apiClient.post('/profile-builder/upload/photo', form)
    return data
  },
}

export const resumeService = {
  analyze: async (file) => {
    const form = new FormData()
    form.append('file', file)
    const { data } = await apiClient.post('/resume/analyze', form)
    return data
  },
}
