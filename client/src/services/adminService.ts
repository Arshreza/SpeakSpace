import api from '@/utils/api'
import type { User, Company, PaginatedResponse, ApiResponse } from '@/types'

export const adminService = {
  getUsers: async (params?: {
    page?: number
    limit?: number
    search?: string
    role?: string
    status?: string
    sortBy?: string
    order?: 'asc' | 'desc'
  }): Promise<PaginatedResponse<User>> => {
    const response = await api.get<PaginatedResponse<User>>('/admin/users', { params })
    return response.data
  },

  getUser: async (id: string): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(`/admin/users/${id}`)
    return response.data.data
  },

  updateUserRole: async (id: string, role: string): Promise<User> => {
    const response = await api.put<ApiResponse<User>>(`/admin/users/${id}/role`, { role })
    return response.data.data
  },

  suspendUser: async (id: string): Promise<User> => {
    const response = await api.put<ApiResponse<User>>(`/admin/users/${id}/suspend`)
    return response.data.data
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/admin/users/${id}`)
  },

  getDashboardStats: async (): Promise<{
    totalUsers: number
    totalInterviews: number
    revenue: number
    activeSubscriptions: number
    newUsersToday: number
    interviewsToday: number
    revenueChart: Array<{ month: string; revenue: number }>
    usersChart: Array<{ date: string; users: number }>
    interviewTypesChart: Array<{ type: string; count: number }>
    recentUsers: User[]
    recentPayments: object[]
  }> => {
    const response = await api.get('/admin/stats')
    return response.data.data
  },

  sendNotification: async (data: {
    title: string
    message: string
    type: string
    targetAll?: boolean
    targetUsers?: string[]
  }): Promise<void> => {
    await api.post('/admin/notifications', data)
  },

  createAchievement: async (data: object): Promise<object> => {
    const response = await api.post('/admin/achievements', data)
    return response.data.data
  },

  getAnalytics: async (period?: string): Promise<object> => {
    const response = await api.get('/admin/analytics', { params: { period } })
    return response.data.data
  },
}
