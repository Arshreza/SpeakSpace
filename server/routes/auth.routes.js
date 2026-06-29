import express from 'express'
import passport from 'passport'
import {
  register, login, logout, refreshToken,
  forgotPassword, resetPassword, verifyEmail,
  resendVerification, getMe, changePassword
} from '../controllers/auth.controller.js'
import { protect } from '../middlewares/auth.js'
import { authLimiter } from '../middlewares/rateLimiter.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/logout', protect, logout)
router.post('/refresh-token', refreshToken)
router.post('/forgot-password', forgotPassword)
router.put('/reset-password/:token', resetPassword)
router.get('/verify-email/:token', verifyEmail)
router.post('/resend-verification', protect, resendVerification)
router.get('/me', protect, getMe)
router.put('/change-password', protect, changePassword)

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }))
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed` }),
  (req, res) => {
    const { accessToken, refreshToken: rt } = req.user
    res.cookie('refreshToken', rt, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 })
    res.redirect(`${process.env.CLIENT_URL}/dashboard?token=${accessToken}`)
  }
)

// GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }))
router.get('/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed` }),
  (req, res) => {
    const { accessToken, refreshToken: rt } = req.user
    res.cookie('refreshToken', rt, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 })
    res.redirect(`${process.env.CLIENT_URL}/dashboard?token=${accessToken}`)
  }
)

export default router
