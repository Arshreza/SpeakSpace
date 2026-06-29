import api from '@/utils/api'
import type { Profile, Notification, DashboardStats, LeaderboardEntry, ApiResponse } from '@/types'

export const userService = {
  getProfile: async (): Promise<Profile> => {
    const response = await api.get<ApiResponse<Profile>>('/users/profile')
    return response.data.data
  },

  updateProfile: async (data: Partial<Profile>): Promise<Profile> => {
    const response = await api.put<ApiResponse<Profile>>('/users/profile', data)
    return response.data.data
  },

  uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData()
    formData.append('avatar', file)
    const response = await api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data.data
  },

  getNotifications: async (): Promise<Notification[]> => {
    const response = await api.get<ApiResponse<Notification[]>>('/users/notifications')
    return response.data.data
  },

  markNotificationRead: async (id: string): Promise<Notification> => {
    const response = await api.put<ApiResponse<Notification>>(`/users/notifications/${id}/read`)
    return response.data.data
  },

  markAllRead: async (): Promise<void> => {
    await api.put('/users/notifications/read-all')
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get<ApiResponse<DashboardStats>>('/users/dashboard')
    return response.data.data
  },

  getLeaderboard: async (period: 'weekly' | 'monthly' | 'all_time' = 'weekly'): Promise<LeaderboardEntry[]> => {
    const response = await api.get<ApiResponse<LeaderboardEntry[]>>(`/users/leaderboard?period=${period}`)
    return response.data.data
  },

  getMyLeaderboardPosition: async (): Promise<{ rank: number; score: number }> => {
    const response = await api.get('/users/leaderboard/me')
    return response.data.data
  },
}
