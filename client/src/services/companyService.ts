import api from '@/utils/api'
import type { Company, InterviewExperience_, ApiResponse } from '@/types'

export const companyService = {
  getCompanies: async (search?: string, industry?: string): Promise<Company[]> => {
    const params: Record<string, string> = {}
    if (search) params.search = search
    if (industry) params.industry = industry
    const response = await api.get<ApiResponse<Company[]>>('/companies', { params })
    return response.data.data
  },

  getCompany: async (slug: string): Promise<Company> => {
    const response = await api.get<ApiResponse<Company>>(`/companies/${slug}`)
    return response.data.data
  },

  addInterviewExperience: async (
    slug: string,
    data: {
      role: string
      result: 'selected' | 'rejected' | 'pending'
      experience: string
      tips: string[]
    }
  ): Promise<InterviewExperience_> => {
    const response = await api.post<ApiResponse<InterviewExperience_>>(`/companies/${slug}/experiences`, data)
    return response.data.data
  },

  upvoteExperience: async (slug: string, expId: string): Promise<{ upvotes: number }> => {
    const response = await api.post(`/companies/${slug}/experiences/${expId}/upvote`)
    return response.data.data
  },

  addCompany: async (data: Partial<Company>): Promise<Company> => {
    const response = await api.post<ApiResponse<Company>>('/companies', data)
    return response.data.data
  },

  updateCompany: async (id: string, data: Partial<Company>): Promise<Company> => {
    const response = await api.put<ApiResponse<Company>>(`/companies/${id}`, data)
    return response.data.data
  },

  deleteCompany: async (id: string): Promise<void> => {
    await api.delete(`/companies/${id}`)
  },
}
