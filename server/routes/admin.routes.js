import express from 'express'
import {
  getAdminStats, getUsers, getUserById, updateUser, deleteUser,
  getAdminInterviews, getPayments, getAdminCompanies,
  createAchievement, getAchievements, updateAchievement,
  sendNotificationToAll
} from '../controllers/admin.controller.js'
import { protect, authorize } from '../middlewares/auth.js'

const router = express.Router()
router.use(protect)
router.use(authorize('admin'))

router.get('/stats', getAdminStats)
router.get('/users', getUsers)
router.get('/users/:id', getUserById)
router.put('/users/:id', updateUser)
router.delete('/users/:id', deleteUser)
router.get('/interviews', getAdminInterviews)
router.get('/payments', getPayments)
router.get('/companies', getAdminCompanies)
router.post('/achievements', createAchievement)
router.get('/achievements', getAchievements)
router.put('/achievements/:id', updateAchievement)
router.post('/notify-all', sendNotificationToAll)

export default router
