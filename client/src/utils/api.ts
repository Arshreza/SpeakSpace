import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import useAuthStore from '@/store/authStore'

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach Bearer token from Zustand store
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

// Track whether a refresh is already in-flight to avoid loops
let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback)
}

function onRefreshSuccess(newToken: string) {
  refreshSubscribers.forEach((cb) => cb(newToken))
  refreshSubscribers = []
}

// Response interceptor — handle 401s with token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const { refreshToken } = useAuthStore.getState()
      if (!refreshToken) {
        clearAuthAndRedirect()
        return Promise.reject(buildError(error))
      }

      if (isRefreshing) {
        return new Promise<string>((resolve) => {
          subscribeTokenRefresh((newToken) => resolve(newToken))
        }).then((newToken) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
          }
          return api(originalRequest)
        })
      }

      isRefreshing = true

      try {
        const { data } = await axios.post(
          '/api/v1/auth/refresh-token',
          { refreshToken },
          { withCredentials: true }
        )

        const newToken: string = data.token
        useAuthStore.getState().setToken(newToken, data.refreshToken)

        onRefreshSuccess(newToken)

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
        }

        return api(originalRequest)
      } catch {
        clearAuthAndRedirect()
        return Promise.reject(buildError(error))
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(buildError(error))
  }
)

function clearAuthAndRedirect() {
  useAuthStore.getState().logout()
  window.location.href = '/login'
}

function buildError(error: AxiosError): Error {
  const responseData = error.response?.data as Record<string, unknown> | undefined
  const message =
    (typeof responseData?.message === 'string' ? responseData.message : undefined) ??
    (typeof responseData?.error === 'string' ? responseData.error : undefined) ??
    error.message ??
    'An unexpected error occurred'
  return new Error(message)
}

export default api
