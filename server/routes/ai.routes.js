import express from 'express'
import {
  chatWithCoach, generateRoadmap, getRoadmap,
  textToSpeech, speechToText
} from '../controllers/ai.controller.js'
import { protect } from '../middlewares/auth.js'
import multer from 'multer'

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } })

const router = express.Router()
router.use(protect)

router.post('/coach', chatWithCoach)
router.post('/roadmap', generateRoadmap)
router.get('/roadmap', getRoadmap)
router.post('/tts', textToSpeech)
router.post('/stt', upload.single('audio'), speechToText)

export default router
