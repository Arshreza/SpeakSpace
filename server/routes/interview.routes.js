import express from 'express'
import {
  createInterview, getInterviews, getInterview,
  startInterview, submitAnswer, completeInterview,
  getInterviewReport, deleteInterview
} from '../controllers/interview.controller.js'
import { protect } from '../middlewares/auth.js'

const router = express.Router()
router.use(protect)

router.post('/create', createInterview)
router.get('/', getInterviews)
router.get('/:id', getInterview)
router.post('/:id/start', startInterview)
router.post('/:id/answer/:questionId', submitAnswer)
router.post('/:id/complete', completeInterview)
router.get('/:id/report', getInterviewReport)
router.delete('/:id', deleteInterview)

export default router
