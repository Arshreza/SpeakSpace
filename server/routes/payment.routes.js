import express from 'express'
import {
  createStripeCheckout, stripeWebhook,
  createRazorpayOrder, verifyRazorpayPayment,
  getSubscription, cancelSubscription
} from '../controllers/payment.controller.js'
import { protect } from '../middlewares/auth.js'

const router = express.Router()

router.post('/stripe/checkout', protect, createStripeCheckout)
router.post('/stripe/webhook', stripeWebhook) // raw body middleware applied in server.js
router.post('/razorpay/order', protect, createRazorpayOrder)
router.post('/razorpay/verify', protect, verifyRazorpayPayment)
router.get('/subscription', protect, getSubscription)
router.delete('/subscription', protect, cancelSubscription)

export default router
