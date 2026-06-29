import express from 'express'
import {
  getProfile, updateProfile, uploadAvatar,
  getNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification,
  getDashboardStats, getLeaderboard, getUserLeaderboardPosition
} from '../controllers/user.controller.js'
import { protect } from '../middlewares/auth.js'
import { uploadAvatar as uploadAvatarMiddleware } from '../middlewares/upload.js'

const router = express.Router()
router.use(protect)

router.get('/profile', getProfile)
router.put('/profile', updateProfile)
router.post('/avatar', uploadAvatarMiddleware, uploadAvatar)
router.get('/notifications', getNotifications)
router.put('/notifications/:id/read', markNotificationRead)
router.put('/notifications/read-all', markAllNotificationsRead)
router.delete('/notifications/:id', deleteNotification)
router.get('/dashboard', getDashboardStats)
router.get('/leaderboard', getLeaderboard)
router.get('/leaderboard/me', getUserLeaderboardPosition)

export default router
