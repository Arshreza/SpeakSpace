import api from '@/utils/api'
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from '@/types'

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials)
    return data
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', credentials)
    return data
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },

  refreshToken: async (refreshToken: string): Promise<{ token: string; refreshToken: string }> => {
    const { data } = await api.post('/auth/refresh-token', { refreshToken })
    return data.data
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const { data } = await api.post('/auth/forgot-password', { email })
    return data
  },

  resetPassword: async (token: string, password: string, confirmPassword: string): Promise<{ message: string }> => {
    const { data } = await api.post(`/auth/reset-password/${token}`, { password, confirmPassword })
    return data
  },

  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const { data } = await api.get(`/auth/verify-email/${token}`)
    return data
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get('/auth/me')
    return data.data
  },

  changePassword: async (currentPassword: string, newPassword: string, confirmPassword: string): Promise<{ message: string }> => {
    const { data } = await api.put('/auth/change-password', { currentPassword, newPassword, confirmPassword })
    return data
  },

  loginWithGoogle: (): void => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/auth/google`
  },

  loginWithGithub: (): void => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/auth/github`
  },

  resendVerification: async (email: string): Promise<{ message: string }> => {
    const { data } = await api.post('/auth/resend-verification', { email })
    return data
  },
}
