import asyncHandler from 'express-async-handler'
import {
  chatWithCoach as chatWithCoachAI,
  generateRoadmap as generateRoadmapAI,
  textToSpeech as textToSpeechAI,
  speechToText as speechToTextAI
} from '../services/ai.service.js'
import Roadmap from '../models/Roadmap.js'
import Profile from '../models/Profile.js'

export const chatWithCoach = asyncHandler(async (req, res) => {
  const { message, history = [] } = req.body
  if (!message) { res.status(400); throw new Error('Message is required') }

  const profile = await Profile.findOne({ user: req.user._id }).lean()
  const response = await chatWithCoachAI(message, history, profile)
  res.json({ success: true, data: { response } })
})

export const generateRoadmap = asyncHandler(async (req, res) => {
  const { currentSkills, targetCompany, targetRole } = req.body
  if (!targetCompany || !targetRole) { res.status(400); throw new Error('Target company and role required') }

  const roadmapData = await generateRoadmapAI(currentSkills || [], targetCompany, targetRole)

  const roadmap = await Roadmap.findOneAndUpdate(
    { user: req.user._id },
    { user: req.user._id, targetCompany, targetRole, currentSkills: currentSkills || [], ...roadmapData, generatedBy: 'ai' },
    { upsert: true, new: true }
  )

  res.json({ success: true, data: roadmap })
})

export const getRoadmap = asyncHandler(async (req, res) => {
  const roadmap = await Roadmap.findOne({ user: req.user._id })
  res.json({ success: true, data: roadmap })
})

export const textToSpeech = asyncHandler(async (req, res) => {
  const { text, voice = 'alloy' } = req.body
  if (!text) { res.status(400); throw new Error('Text is required') }

  const audioBuffer = await textToSpeechAI(text, voice)
  res.set({ 'Content-Type': 'audio/mpeg', 'Content-Length': audioBuffer.length })
  res.send(audioBuffer)
})

export const speechToText = asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400); throw new Error('Audio file is required') }
  const transcript = await speechToTextAI(req.file.buffer, req.file.originalname)
  res.json({ success: true, data: { transcript } })
})
