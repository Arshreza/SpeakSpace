import api from '@/utils/api'
import type { Subscription, Payment, ApiResponse } from '@/types'

export const paymentService = {
  createStripeCheckout: async (plan: 'premium' | 'enterprise'): Promise<{ sessionId: string; url: string }> => {
    const response = await api.post('/payments/stripe/checkout', { plan })
    return response.data.data
  },

  createRazorpayOrder: async (plan: 'premium' | 'enterprise'): Promise<{
    orderId: string
    amount: number
    currency: string
    keyId: string
  }> => {
    const response = await api.post('/payments/razorpay/order', { plan })
    return response.data.data
  },

  verifyRazorpayPayment: async (data: {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
    plan: string
  }): Promise<{ success: boolean; subscription: Subscription }> => {
    const response = await api.post('/payments/razorpay/verify', data)
    return response.data.data
  },

  getSubscription: async (): Promise<Subscription | null> => {
    try {
      const response = await api.get<ApiResponse<Subscription>>('/payments/subscription')
      return response.data.data
    } catch {
      return null
    }
  },

  cancelSubscription: async (): Promise<{ message: string }> => {
    const response = await api.post('/payments/subscription/cancel')
    return response.data
  },

  getPaymentHistory: async (): Promise<Payment[]> => {
    const response = await api.get<ApiResponse<Payment[]>>('/payments/history')
    return response.data.data
  },

  stripeWebhook: async (payload: string, signature: string): Promise<void> => {
    await api.post('/payments/stripe/webhook', payload, {
      headers: { 'stripe-signature': signature },
    })
  },
}
