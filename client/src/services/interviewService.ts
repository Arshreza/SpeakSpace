import api from '@/utils/api'
import type { Interview, InterviewFilters, PaginatedResponse, ApiResponse } from '@/types'

export const interviewService = {
  createInterview: async (data: {
    type: string
    role: string
    difficulty: string
    experience: string
    duration: number
    voiceEnabled?: boolean
    language?: string
  }): Promise<Interview> => {
    const response = await api.post<ApiResponse<Interview>>('/interviews', data)
    return response.data.data
  },

  getInterviews: async (params?: InterviewFilters): Promise<PaginatedResponse<Interview>> => {
    const response = await api.get<PaginatedResponse<Interview>>('/interviews', { params })
    return response.data
  },

  getInterview: async (id: string): Promise<Interview> => {
    const response = await api.get<ApiResponse<Interview>>(`/interviews/${id}`)
    return response.data.data
  },

  startInterview: async (id: string): Promise<Interview> => {
    const response = await api.post<ApiResponse<Interview>>(`/interviews/${id}/start`)
    return response.data.data
  },

  submitAnswer: async (
    interviewId: string,
    questionId: string,
    data: { answer: string; timeTaken: number; audioUrl?: string }
  ): Promise<{ feedback: object; nextQuestion?: object }> => {
    const response = await api.post(`/interviews/${interviewId}/questions/${questionId}/answer`, data)
    return response.data.data
  },

  completeInterview: async (id: string): Promise<Interview> => {
    const response = await api.post<ApiResponse<Interview>>(`/interviews/${id}/complete`)
    return response.data.data
  },

  getInterviewReport: async (id: string): Promise<Interview> => {
    const response = await api.get<ApiResponse<Interview>>(`/interviews/${id}/report`)
    return response.data.data
  },

  deleteInterview: async (id: string): Promise<void> => {
    await api.delete(`/interviews/${id}`)
  },

  regenerateFeedback: async (id: string): Promise<Interview> => {
    const response = await api.post<ApiResponse<Interview>>(`/interviews/${id}/regenerate-feedback`)
    return response.data.data
  },
}
