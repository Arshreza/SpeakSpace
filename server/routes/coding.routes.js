import express from 'express'
import { submitCode, runCode, getSubmissions } from '../controllers/coding.controller.js'
import { protect } from '../middlewares/auth.js'

const router = express.Router()
router.use(protect)

router.post('/submit', submitCode)
router.post('/run', runCode)
router.get('/:interviewId/submissions', getSubmissions)

export default router
