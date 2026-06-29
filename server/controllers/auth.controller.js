import crypto from 'crypto';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Subscription from '../models/Subscription.js';
import { asyncHandler, AppError } from '../middlewares/errorHandler.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { sanitizeUser } from '../utils/helpers.js';
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from '../services/email.service.js';
import { setCache, deleteCache } from '../config/redis.js';
import logger from '../utils/logger.js';

const ACCESS_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 15 * 60 * 1000, // 15 minutes
};

const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/api/v1/auth/refresh-token',
};

/**
 * Signs tokens, sets cookies, and returns user data in JSON
 */
const sendTokenResponse = async (user, statusCode, res, message = 'Success') => {
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  // Store refresh token in user's refreshTokens array
  await User.findByIdAndUpdate(user._id, {
    $push: { refreshTokens: refreshToken },
    lastLogin: new Date(),
  });

  res
    .status(statusCode)
    .cookie('accessToken', accessToken, ACCESS_TOKEN_COOKIE_OPTIONS)
    .cookie('refreshToken', refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS)
    .json({
      success: true,
      message,
      accessToken,
      user: sanitizeUser(user),
    });
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('An account with this email already exists.', 400));
  }

  const user = await User.create({ name, email, password, provider: 'local' });

  // Create empty profile
  await Profile.create({ user: user._id });

  // Create free subscription
  await Subscription.create({
    user: user._id,
    plan: 'free',
    status: 'active',
    features: {
      maxInterviews: 3,
      maxResumes: 1,
      voiceInterview: false,
      codingInterview: false,
      aiCoach: false,
      downloadReports: false,
    },
  });

  // Send verification email
  const verificationToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  try {
    await sendVerificationEmail(user.email, user.name, verificationToken);
  } catch (emailError) {
    logger.error(`Failed to send verification email to ${user.email}: ${emailError.message}`);
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });
  }

  await sendTokenResponse(user, 201, res, 'Registration successful. Please verify your email.');
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, provider: 'local' }).select('+password');
  if (!user) {
    return next(new AppError('Invalid email or password.', 401));
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new AppError('Invalid email or password.', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated. Please contact support.', 401));
  }

  await sendTokenResponse(user, 200, res, 'Login successful.');
});

// @desc    Handle Google OAuth callback
// @route   GET /api/v1/auth/google/callback
// @access  Public
const loginWithGoogle = asyncHandler(async (req, res, next) => {
  const user = req.user;
  if (!user) {
    return next(new AppError('Google authentication failed.', 401));
  }

  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  await User.findByIdAndUpdate(user._id, {
    $push: { refreshTokens: refreshToken },
    lastLogin: new Date(),
  });

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  res
    .cookie('accessToken', accessToken, ACCESS_TOKEN_COOKIE_OPTIONS)
    .cookie('refreshToken', refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS)
    .redirect(`${clientUrl}/auth/callback?token=${accessToken}`);
});

// @desc    Handle GitHub OAuth callback
// @route   GET /api/v1/auth/github/callback
// @access  Public
const loginWithGithub = asyncHandler(async (req, res, next) => {
  const user = req.user;
  if (!user) {
    return next(new AppError('GitHub authentication failed.', 401));
  }

  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  await User.findByIdAndUpdate(user._id, {
    $push: { refreshTokens: refreshToken },
    lastLogin: new Date(),
  });

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  res
    .cookie('accessToken', accessToken, ACCESS_TOKEN_COOKIE_OPTIONS)
    .cookie('refreshToken', refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS)
    .redirect(`${clientUrl}/auth/callback?token=${accessToken}`);
});

// @desc    Logout user
// @route   GET /api/v1/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken;
  const accessToken = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];

  if (refreshToken) {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { refreshTokens: refreshToken },
    });
  }

  // Blacklist the access token in Redis (TTL = 15 min)
  if (accessToken) {
    await setCache(`bl:${accessToken}`, true, 15 * 60);
  }

  res
    .clearCookie('accessToken')
    .clearCookie('refreshToken')
    .status(200)
    .json({ success: true, message: 'Logged out successfully.' });
});

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh-token
// @access  Public (with refresh token cookie)
const refreshToken = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  if (!token) {
    return next(new AppError('Refresh token not provided.', 401));
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (err) {
    return next(new AppError('Invalid or expired refresh token. Please log in again.', 401));
  }

  const user = await User.findById(decoded.id).select('+refreshTokens');
  if (!user || !user.refreshTokens.includes(token)) {
    return next(new AppError('Refresh token is invalid or has been revoked.', 401));
  }

  // Rotate the refresh token
  const newRefreshToken = signRefreshToken(user._id);
  const newAccessToken = signAccessToken(user._id);

  user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
  user.refreshTokens.push(newRefreshToken);
  await user.save({ validateBeforeSave: false });

  res
    .cookie('accessToken', newAccessToken, ACCESS_TOKEN_COOKIE_OPTIONS)
    .cookie('refreshToken', newRefreshToken, REFRESH_TOKEN_COOKIE_OPTIONS)
    .status(200)
    .json({ success: true, message: 'Token refreshed.', accessToken: newAccessToken });
});

// @desc    Forgot password — send reset email
// @route   POST /api/v1/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email, provider: 'local' });
  if (!user) {
    // Don't reveal if email exists
    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  }

  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    await sendPasswordResetEmail(user.email, user.name, resetToken);
    res.status(200).json({
      success: true,
      message: 'Password reset email sent. Please check your inbox.',
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Failed to send reset email. Please try again.', 500));
  }
});

// @desc    Reset password
// @route   PUT /api/v1/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select('+refreshTokens');

  if (!user) {
    return next(new AppError('Password reset token is invalid or has expired.', 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.refreshTokens = []; // Invalidate all sessions
  await user.save();

  await sendTokenResponse(user, 200, res, 'Password reset successful. You are now logged in.');
});

// @desc    Verify email address
// @route   GET /api/v1/auth/verify-email/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Email verification link is invalid or has expired.', 400));
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save({ validateBeforeSave: false });

  // Send welcome email
  try {
    await sendWelcomeEmail(user.email, user.name);
  } catch (err) {
    logger.warn(`Welcome email failed for ${user.email}: ${err.message}`);
  }

  res.status(200).json({ success: true, message: 'Email verified successfully.' });
});

// @desc    Resend email verification
// @route   POST /api/v1/auth/resend-verification
// @access  Public
const resendVerification = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(200).json({
      success: true,
      message: 'If that email is registered, a verification link has been sent.',
    });
  }

  if (user.isEmailVerified) {
    return next(new AppError('Email is already verified.', 400));
  }

  const token = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  try {
    await sendVerificationEmail(user.email, user.name, token);
    res.status(200).json({ success: true, message: 'Verification email sent.' });
  } catch (error) {
    return next(new AppError('Failed to send verification email. Please try again.', 500));
  }
});

// @desc    Get current logged-in user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate('profile');
  res.status(200).json({
    success: true,
    user: sanitizeUser(user),
  });
});

// @desc    Change password
// @route   PUT /api/v1/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!user.password) {
    return next(new AppError('Password change is not available for OAuth accounts.', 400));
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return next(new AppError('Current password is incorrect.', 401));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true, message: 'Password changed successfully.' });
});

export {
  register,
  login,
  loginWithGoogle,
  loginWithGithub,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  getMe,
  changePassword,
};
