import express from 'express'
import {
  getCompanies, getCompany, addInterviewExperience, upvoteExperience,
  createCompany, updateCompany, seedCompanies
} from '../controllers/company.controller.js'
import { protect, authorize } from '../middlewares/auth.js'

const router = express.Router()

router.get('/', getCompanies)
router.get('/:slug', getCompany)
router.post('/:slug/experience', protect, addInterviewExperience)
router.post('/:slug/experience/:expId/upvote', protect, upvoteExperience)
router.post('/', protect, authorize('admin'), createCompany)
router.put('/:id', protect, authorize('admin'), updateCompany)
router.post('/seed/all', protect, authorize('admin'), seedCompanies)

export default router
