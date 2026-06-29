import { verifyAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';
import { AppError, asyncHandler } from './errorHandler.js';
import { getCache } from '../config/redis.js';
import logger from '../utils/logger.js';

/**
 * Protect routes — verifies JWT from Authorization header or httpOnly cookie
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(new AppError('Not authorized. No token provided.', 401));
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    return next(new AppError('Not authorized. Token is invalid or expired.', 401));
  }

  if (decoded.type !== 'access') {
    return next(new AppError('Not authorized. Invalid token type.', 401));
  }

  // Check if token is blacklisted (after logout)
  try {
    const isBlacklisted = await getCache(`bl:${token}`);
    if (isBlacklisted) {
      return next(new AppError('Not authorized. Token has been invalidated.', 401));
    }
  } catch (err) {
    logger.warn(`Redis token blacklist check failed: ${err.message}`);
  }

  const user = await User.findById(decoded.id).select('+refreshTokens');
  if (!user) {
    return next(new AppError('Not authorized. User no longer exists.', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated. Please contact support.', 401));
  }

  req.user = user;
  next();
});

/**
 * Role-based authorization — must be used after protect
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Not authorized. Please log in.', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Role '${req.user.role}' is not authorized to access this route.`,
          403
        )
      );
    }
    next();
  };
};

/**
 * Optional authentication — attaches user if token is present and valid, but doesn't block if not
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);
    if (user && user.isActive) {
      req.user = user;
    }
  } catch (err) {
    // Not a critical error — just proceed without user
    logger.debug(`optionalAuth: Token check failed: ${err.message}`);
  }

  next();
});

export { protect, authorize, optionalAuth };
