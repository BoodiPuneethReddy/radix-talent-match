import apiClient from './apiClient'

export const resumeParserService = {
  parse: ({ resumeFile, excelFile }) => {
    const formData = new FormData()
    if (resumeFile) formData.append('resume_file', resumeFile)
    if (excelFile) formData.append('excel_file', excelFile)

    return apiClient.post('/api/resume-parser/parse', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  getLastParsed: () => apiClient.get('/api/resume-parser/parsed')
}
