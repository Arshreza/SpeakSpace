import asyncHandler from 'express-async-handler'
import Stripe from 'stripe'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import Subscription from '../models/Subscription.js'
import Payment from '../models/Payment.js'
import User from '../models/User.js'
import Notification from '../models/Notification.js'
import logger from '../utils/logger.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder')
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder'
})

const PLANS = {
  premium: {
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
    amount: 999,
    features: {
      maxInterviews: 100,
      maxResumes: 10,
      voiceInterview: true,
      codingInterview: true,
      aiCoach: true,
      downloadReports: true
    }
  },
  enterprise: {
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    amount: 2999,
    features: {
      maxInterviews: -1,
      maxResumes: -1,
      voiceInterview: true,
      codingInterview: true,
      aiCoach: true,
      downloadReports: true
    }
  }
}

export const createStripeCheckout = asyncHandler(async (req, res) => {
  const { plan } = req.body
  if (!PLANS[plan]) { res.status(400); throw new Error('Invalid plan') }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    customer_email: req.user.email,
    line_items: [{ price: PLANS[plan].priceId, quantity: 1 }],
    success_url: `${process.env.CLIENT_URL}/settings?payment=success`,
    cancel_url: `${process.env.CLIENT_URL}/pricing?payment=cancelled`,
    metadata: { userId: req.user._id.toString(), plan }
  })

  res.json({ success: true, data: { url: session.url } })
})

export const stripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    logger.error('Stripe webhook error:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { userId, plan } = session.metadata

    await Promise.all([
      Subscription.findOneAndUpdate(
        { user: userId },
        {
          plan,
          status: 'active',
          stripeSubscriptionId: session.subscription,
          stripeCustomerId: session.customer,
          features: PLANS[plan].features,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        { upsert: true }
      ),
      Payment.create({
        user: userId,
        amount: PLANS[plan].amount,
        currency: 'USD',
        gateway: 'stripe',
        gatewayPaymentId: session.payment_intent,
        plan,
        status: 'completed'
      }),
      Notification.create({
        user: userId,
        title: 'Subscription Activated!',
        message: `Your ${plan} plan is now active. Enjoy unlimited access!`,
        type: 'success'
      })
    ])
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object
    const sub = await Subscription.findOne({ stripeSubscriptionId: subscription.id })
    if (sub) {
      sub.status = 'cancelled'
      sub.plan = 'free'
      await sub.save()
    }
  }

  res.json({ received: true })
})

export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { plan } = req.body
  if (!PLANS[plan]) { res.status(400); throw new Error('Invalid plan') }

  const order = await razorpay.orders.create({
    amount: PLANS[plan].amount * 100,
    currency: 'INR',
    notes: { userId: req.user._id.toString(), plan }
  })

  res.json({
    success: true,
    data: {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    }
  })
})

export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body

  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder')
  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`)
  const generated = hmac.digest('hex')

  if (generated !== razorpay_signature) { res.status(400); throw new Error('Invalid payment signature') }

  await Promise.all([
    Subscription.findOneAndUpdate(
      { user: req.user._id },
      {
        plan,
        status: 'active',
        razorpayCustomerId: razorpay_payment_id,
        features: PLANS[plan]?.features,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      { upsert: true }
    ),
    Payment.create({
      user: req.user._id,
      amount: PLANS[plan]?.amount,
      currency: 'INR',
      gateway: 'razorpay',
      gatewayPaymentId: razorpay_payment_id,
      plan,
      status: 'completed'
    }),
    Notification.create({
      user: req.user._id,
      title: 'Subscription Activated!',
      message: `Your ${plan} plan is now active!`,
      type: 'success'
    })
  ])

  res.json({ success: true, message: 'Payment verified and subscription activated' })
})

export const getSubscription = asyncHandler(async (req, res) => {
  let subscription = await Subscription.findOne({ user: req.user._id })
  if (!subscription) {
    subscription = await Subscription.create({
      user: req.user._id,
      plan: 'free',
      status: 'active',
      features: {
        maxInterviews: 5,
        maxResumes: 1,
        voiceInterview: false,
        codingInterview: false,
        aiCoach: false,
        downloadReports: false
      }
    })
  }
  res.json({ success: true, data: subscription })
})

export const cancelSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findOne({ user: req.user._id })
  if (!subscription) { res.status(404); throw new Error('No subscription found') }

  if (subscription.stripeSubscriptionId) {
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, { cancel_at_period_end: true })
    subscription.cancelAtPeriodEnd = true
  } else {
    subscription.status = 'cancelled'
    subscription.plan = 'free'
  }

  await subscription.save()
  res.json({ success: true, message: 'Subscription cancellation scheduled', data: subscription })
})
