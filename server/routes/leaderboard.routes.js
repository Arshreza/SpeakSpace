import express from 'express'
import { getLeaderboard, getMyRank, updateLeaderboard } from '../controllers/leaderboard.controller.js'
import { protect, authorize } from '../middlewares/auth.js'

const router = express.Router()

router.get('/', getLeaderboard)
router.get('/me', protect, getMyRank)
router.post('/update', protect, authorize('admin'), updateLeaderboard)

export default router
