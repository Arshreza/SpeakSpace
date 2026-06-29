import api from '@/utils/api'
import type { ChatMessage, Roadmap, ApiResponse } from '@/types'

export const aiService = {
  chatWithCoach: async (
    message: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<{ response: string; suggestions?: string[] }> => {
    const response = await api.post('/ai/chat', { message, history })
    return response.data.data
  },

  generateRoadmap: async (data: {
    currentSkills: string[]
    targetCompany: string
    targetRole: string
    experience?: string
  }): Promise<Roadmap> => {
    const response = await api.post<ApiResponse<Roadmap>>('/ai/roadmap/generate', data)
    return response.data.data
  },

  getRoadmap: async (): Promise<Roadmap | null> => {
    try {
      const response = await api.get<ApiResponse<Roadmap>>('/ai/roadmap')
      return response.data.data
    } catch {
      return null
    }
  },

  updateRoadmapTask: async (taskId: string, completed: boolean): Promise<void> => {
    await api.put(`/ai/roadmap/tasks/${taskId}`, { completed })
  },

  textToSpeech: async (text: string): Promise<Blob> => {
    const response = await api.post('/ai/tts', { text }, { responseType: 'blob' })
    return response.data
  },

  speechToText: async (audio: Blob): Promise<{ text: string }> => {
    const formData = new FormData()
    formData.append('audio', audio, 'audio.webm')
    const response = await api.post('/ai/stt', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data.data
  },

  generateInterviewQuestions: async (data: {
    type: string
    role: string
    difficulty: string
    count?: number
  }): Promise<object[]> => {
    const response = await api.post('/ai/questions/generate', data)
    return response.data.data
  },
}
