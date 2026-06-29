import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Notification from '../models/Notification.js';
import Leaderboard from '../models/Leaderboard.js';
import Interview from '../models/Interview.js';
import { asyncHandler, AppError } from '../middlewares/errorHandler.js';
import { sanitizeUser, calculateLevel } from '../utils/helpers.js';
import { deleteFromCloudinary } from '../config/cloudinary.js';
import { deleteCache } from '../config/redis.js';
import logger from '../utils/logger.js';

// @desc    Get current user's profile
// @route   GET /api/v1/users/profile
// @access  Private
const getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate('profile');
  if (!user) {
    return next(new AppError('User not found.', 404));
  }
  res.status(200).json({ success: true, user: sanitizeUser(user) });
});

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res, next) => {
  const {
    bio, phone, location, website, linkedin, github, portfolio,
    targetCompany, targetRole, preferredLanguage, skills,
    yearsOfExperience, education, experience,
  } = req.body;

  // Update name on user doc if provided
  if (req.body.name) {
    await User.findByIdAndUpdate(req.user._id, { name: req.body.name });
  }

  const updatedProfile = await Profile.findOneAndUpdate(
    { user: req.user._id },
    {
      $set: {
        ...(bio !== undefined && { bio }),
        ...(phone !== undefined && { phone }),
        ...(location !== undefined && { location }),
        ...(website !== undefined && { website }),
        ...(linkedin !== undefined && { linkedin }),
        ...(github !== undefined && { github }),
        ...(portfolio !== undefined && { portfolio }),
        ...(targetCompany !== undefined && { targetCompany }),
        ...(targetRole !== undefined && { targetRole }),
        ...(preferredLanguage !== undefined && { preferredLanguage }),
        ...(skills !== undefined && { skills }),
        ...(yearsOfExperience !== undefined && { yearsOfExperience }),
        ...(education !== undefined && { education }),
        ...(experience !== undefined && { experience }),
      },
    },
    { new: true, runValidators: true, upsert: true }
  );

  await deleteCache(`profile:${req.user._id}`);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully.',
    profile: updatedProfile,
  });
});

// @desc    Upload avatar
// @route   POST /api/v1/users/avatar
// @access  Private
const uploadAvatar = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload an image file.', 400));
  }

  const user = await User.findById(req.user._id);

  // Delete old avatar from Cloudinary if it exists and is a cloudinary URL
  if (user.avatar && user.avatar.includes('cloudinary.com')) {
    const publicId = user.avatar.split('/').slice(-2).join('/').split('.')[0];
    try {
      await deleteFromCloudinary(publicId, 'image');
    } catch (err) {
      logger.warn(`Failed to delete old avatar: ${err.message}`);
    }
  }

  user.avatar = req.file.path || req.file.secure_url;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Avatar updated successfully.',
    avatar: user.avatar,
  });
});

// @desc    Get user notifications (paginated)
// @route   GET /api/v1/users/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments({ user: req.user._id }),
    Notification.countDocuments({ user: req.user._id, isRead: false }),
  ]);

  res.status(200).json({
    success: true,
    notifications,
    unreadCount,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// @desc    Mark single notification as read
// @route   PUT /api/v1/users/notifications/:id/read
// @access  Private
const markNotificationRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    return next(new AppError('Notification not found.', 404));
  }

  res.status(200).json({ success: true, notification });
});

// @desc    Mark all notifications as read
// @route   PUT /api/v1/users/notifications/read-all
// @access  Private
const markAllNotificationsRead = asyncHandler(async (req, res, next) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.status(200).json({ success: true, message: 'All notifications marked as read.' });
});

// @desc    Delete a notification
// @route   DELETE /api/v1/users/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!notification) {
    return next(new AppError('Notification not found.', 404));
  }

  res.status(200).json({ success: true, message: 'Notification deleted.' });
});

// @desc    Get dashboard stats for the current user
// @route   GET /api/v1/users/dashboard
// @access  Private
const getDashboardStats = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const [profile, recentInterviews, leaderboardEntry] = await Promise.all([
    Profile.findOne({ user: userId }),
    Interview.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title type status overallScore createdAt completedAt difficulty'),
    Leaderboard.findOne({ user: userId, period: 'allTime' }),
  ]);

  const completedInterviews = await Interview.find({
    user: userId,
    status: 'completed',
  }).select('overallScore technicalScore communicationScore createdAt');

  const totalInterviews = completedInterviews.length;
  const avgScore =
    totalInterviews > 0
      ? Math.round(completedInterviews.reduce((s, i) => s + (i.overallScore || 0), 0) / totalInterviews)
      : 0;

  // Monthly data for the last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyData = await Interview.aggregate([
    {
      $match: {
        user: userId,
        status: 'completed',
        createdAt: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
        avgScore: { $avg: '$overallScore' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalInterviews,
      avgScore,
      streak: profile?.streak || 0,
      xp: profile?.xp || 0,
      level: profile?.level || 1,
      coins: profile?.coins || 0,
      rank: leaderboardEntry?.rank || null,
      resumeCount: profile?.resumeCount || 0,
      badges: profile?.badges || [],
      achievements: profile?.achievements || [],
      weeklyProgress: profile?.weeklyProgress?.slice(-4) || [],
      monthlyAnalytics: monthlyData,
      recentInterviews,
    },
  });
});

// @desc    Get top 50 leaderboard
// @route   GET /api/v1/users/leaderboard
// @access  Private
const getLeaderboard = asyncHandler(async (req, res, next) => {
  const period = req.query.period || 'allTime';
  const validPeriods = ['weekly', 'monthly', 'allTime'];
  if (!validPeriods.includes(period)) {
    return next(new AppError('Invalid period. Use weekly, monthly, or allTime.', 400));
  }

  const entries = await Leaderboard.find({ period })
    .sort({ score: -1 })
    .limit(50)
    .populate('user', 'name avatar');

  res.status(200).json({ success: true, period, leaderboard: entries });
});

// @desc    Get current user's leaderboard position
// @route   GET /api/v1/users/leaderboard/me
// @access  Private
const getUserLeaderboardPosition = asyncHandler(async (req, res, next) => {
  const period = req.query.period || 'allTime';

  const entry = await Leaderboard.findOne({ user: req.user._id, period })
    .populate('user', 'name avatar');

  if (!entry) {
    return res.status(200).json({
      success: true,
      position: null,
      message: 'Complete an interview to appear on the leaderboard.',
    });
  }

  res.status(200).json({ success: true, position: entry });
});

export {
  getProfile,
  updateProfile,
  uploadAvatar,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  getDashboardStats,
  getLeaderboard,
  getUserLeaderboardPosition,
};
