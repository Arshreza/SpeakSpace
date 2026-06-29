import api from '@/utils/api'
import type { Resume, ApiResponse } from '@/types'

export const resumeService = {
  uploadResume: async (file: File): Promise<Resume> => {
    const formData = new FormData()
    formData.append('resume', file)
    const response = await api.post<ApiResponse<Resume>>('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data.data
  },

  analyzeResume: async (id: string): Promise<Resume> => {
    const response = await api.post<ApiResponse<Resume>>(`/resumes/${id}/analyze`)
    return response.data.data
  },

  getResumes: async (): Promise<Resume[]> => {
    const response = await api.get<ApiResponse<Resume[]>>('/resumes')
    return response.data.data
  },

  getResume: async (id: string): Promise<Resume> => {
    const response = await api.get<ApiResponse<Resume>>(`/resumes/${id}`)
    return response.data.data
  },

  deleteResume: async (id: string): Promise<void> => {
    await api.delete(`/resumes/${id}`)
  },

  setDefaultResume: async (id: string): Promise<Resume> => {
    const response = await api.put<ApiResponse<Resume>>(`/resumes/${id}/default`)
    return response.data.data
  },

  generateResume: async (data: {
    targetRole: string
    targetCompany?: string
    skills: string[]
    experience: object[]
    education: object[]
  }): Promise<{ content: string; downloadUrl: string }> => {
    const response = await api.post('/resumes/generate', data)
    return response.data.data
  },

  buildResume: async (data: object): Promise<Resume> => {
    const response = await api.post<ApiResponse<Resume>>('/resumes/build', data)
    return response.data.data
  },
}
