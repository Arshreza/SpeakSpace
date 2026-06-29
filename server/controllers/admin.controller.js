import asyncHandler from 'express-async-handler'
import User from '../models/User.js'
import Profile from '../models/Profile.js'
import Interview from '../models/Interview.js'
import Payment from '../models/Payment.js'
import Subscription from '../models/Subscription.js'
import Company from '../models/Company.js'
import Achievement from '../models/Achievement.js'
import Notification from '../models/Notification.js'
import logger from '../utils/logger.js'

export const getAdminStats = asyncHandler(async (req, res) => {
  const [
    totalUsers, totalInterviews, totalRevenue,
    activeSubscriptions, newUsersThisMonth, newInterviewsThisMonth
  ] = await Promise.all([
    User.countDocuments(),
    Interview.countDocuments(),
    Payment.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Subscription.countDocuments({ status: 'active', plan: { $ne: 'free' } }),
    User.countDocuments({ createdAt: { $gte: new Date(new Date().setDate(1)) } }),
    Interview.countDocuments({ createdAt: { $gte: new Date(new Date().setDate(1)) } })
  ])

  const revenueByMonth = await Payment.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, revenue: { $sum: '$amount' } } },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ])

  const usersByMonth = await User.aggregate([
    { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ])

  const interviewsByType = await Interview.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ])

  res.json({
    success: true,
    data: {
      overview: {
        totalUsers,
        totalInterviews,
        totalRevenue: totalRevenue[0]?.total || 0,
        activeSubscriptions,
        newUsersThisMonth,
        newInterviewsThisMonth
      },
      charts: { revenueByMonth, usersByMonth, interviewsByType }
    }
  })
})

export const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role, isActive, sort = '-createdAt' } = req.query
  const query = {}
  if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }]
  if (role) query.role = role
  if (isActive !== undefined) query.isActive = isActive === 'true'

  const skip = (page - 1) * limit
  const [users, total] = await Promise.all([
    User.find(query).select('-password -refreshTokens').sort(sort).skip(skip).limit(Number(limit)).lean(),
    User.countDocuments(query)
  ])

  res.json({ success: true, data: { users, total, page: Number(page), pages: Math.ceil(total / limit) } })
})

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -refreshTokens')
  if (!user) { res.status(404); throw new Error('User not found') }
  const profile = await Profile.findOne({ user: user._id })
  const interviewCount = await Interview.countDocuments({ user: user._id })
  res.json({ success: true, data: { user, profile, interviewCount } })
})

export const updateUser = asyncHandler(async (req, res) => {
  const { role, isActive } = req.body
  const user = await User.findByIdAndUpdate(req.params.id, { role, isActive }, { new: true }).select('-password')
  if (!user) { res.status(404); throw new Error('User not found') }
  res.json({ success: true, data: user })
})

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true })
  if (!user) { res.status(404); throw new Error('User not found') }
  res.json({ success: true, message: 'User deactivated successfully' })
})

export const getAdminInterviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type, status, sort = '-createdAt' } = req.query
  const query = {}
  if (type) query.type = type
  if (status) query.status = status

  const skip = (page - 1) * limit
  const [interviews, total] = await Promise.all([
    Interview.find(query).populate('user', 'name email avatar').sort(sort).skip(skip).limit(Number(limit)).lean(),
    Interview.countDocuments(query)
  ])

  res.json({ success: true, data: { interviews, total, page: Number(page), pages: Math.ceil(total / limit) } })
})

export const getPayments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, gateway, sort = '-createdAt' } = req.query
  const query = {}
  if (status) query.status = status
  if (gateway) query.gateway = gateway

  const skip = (page - 1) * limit
  const [payments, total] = await Promise.all([
    Payment.find(query).populate('user', 'name email').sort(sort).skip(skip).limit(Number(limit)).lean(),
    Payment.countDocuments(query)
  ])

  res.json({ success: true, data: { payments, total, page: Number(page), pages: Math.ceil(total / limit) } })
})

export const getAdminCompanies = asyncHandler(async (req, res) => {
  const companies = await Company.find().sort('name').lean()
  res.json({ success: true, data: companies })
})

export const createAchievement = asyncHandler(async (req, res) => {
  const achievement = await Achievement.create(req.body)
  res.status(201).json({ success: true, data: achievement })
})

export const getAchievements = asyncHandler(async (req, res) => {
  const achievements = await Achievement.find().lean()
  res.json({ success: true, data: achievements })
})

export const updateAchievement = asyncHandler(async (req, res) => {
  const achievement = await Achievement.findByIdAndUpdate(req.params.id, req.body, { new: true })
  if (!achievement) { res.status(404); throw new Error('Achievement not found') }
  res.json({ success: true, data: achievement })
})

export const sendNotificationToAll = asyncHandler(async (req, res) => {
  const { title, message, type = 'system', link } = req.body
  if (!title || !message) { res.status(400); throw new Error('Title and message required') }

  const users = await User.find({ isActive: true }).select('_id')
  const notifications = users.map(u => ({ user: u._id, title, message, type, link }))
  await Notification.insertMany(notifications)

  logger.info(`Sent notification "${title}" to ${users.length} users`)
  res.json({ success: true, message: `Notification sent to ${users.length} users` })
})
