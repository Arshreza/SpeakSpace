import express from 'express'
import {
  uploadResume, analyzeResume, getResumes,
  getResume, deleteResume, setDefaultResume, generateResume, buildResume
} from '../controllers/resume.controller.js'
import { protect } from '../middlewares/auth.js'
import { uploadResume as uploadResumeMiddleware } from '../middlewares/upload.js'
import { uploadLimiter } from '../middlewares/rateLimiter.js'

const router = express.Router()
router.use(protect)

router.post('/upload', uploadLimiter, uploadResumeMiddleware, uploadResume)
router.post('/:id/analyze', analyzeResume)
router.get('/', getResumes)
router.get('/:id', getResume)
router.delete('/:id', deleteResume)
router.put('/:id/default', setDefaultResume)
router.post('/generate', generateResume)
router.post('/build', buildResume)

export default router
