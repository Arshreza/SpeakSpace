import asyncHandler from 'express-async-handler'
import Leaderboard from '../models/Leaderboard.js'
import Profile from '../models/Profile.js'

export const getLeaderboard = asyncHandler(async (req, res) => {
  const { period = 'allTime', limit = 50 } = req.query

  const entries = await Leaderboard.find({ period })
    .sort({ score: -1 })
    .limit(Number(limit))
    .populate('user', 'name email avatar')
    .lean()

  const ranked = entries.map((e, i) => ({ ...e, rank: i + 1 }))
  res.json({ success: true, data: ranked })
})

export const getMyRank = asyncHandler(async (req, res) => {
  const entry = await Leaderboard.findOne({ user: req.user._id, period: 'allTime' }).populate('user', 'name email avatar')
  res.json({ success: true, data: entry })
})

export const updateLeaderboard = asyncHandler(async (req, res) => {
  const { userId, score, interviewsCompleted, avgScore, streak, badges } = req.body

  await Promise.all(['weekly', 'monthly', 'allTime'].map(period =>
    Leaderboard.findOneAndUpdate(
      { user: userId, period },
      { $set: { score, interviewsCompleted, avgScore, streak, badges, updatedAt: new Date() } },
      { upsert: true }
    )
  ))

  res.json({ success: true, message: 'Leaderboard updated' })
})

// Service function called internally (not a route handler)
export async function updateLeaderboardEntry(userId, newScore) {
  await Promise.all(['weekly', 'monthly', 'allTime'].map(period =>
    Leaderboard.findOneAndUpdate(
      { user: userId, period },
      {
        $inc: { score: newScore, interviewsCompleted: 1 },
        $set: { updatedAt: new Date() },
      },
      { upsert: true, new: true }
    )
  ))
}
