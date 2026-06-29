import rateLimit from 'express-rate-limit';
import logger from '../utils/logger.js';

const createLimiter = (windowMs, max, message, skipSuccessfulRequests = false) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    handler: (req, res, next, options) => {
      logger.warn(
        `Rate limit exceeded: ${req.ip} on ${req.method} ${req.originalUrl}`
      );
      res.status(options.statusCode).json(options.message);
    },
  });
};

// General API limiter: 100 requests per 15 minutes
const generalLimiter = createLimiter(
  15 * 60 * 1000,
  100,
  'Too many requests from this IP. Please try again after 15 minutes.'
);

// Strict auth limiter: 5 attempts per 15 minutes
const authLimiter = createLimiter(
  15 * 60 * 1000,
  5,
  'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  false
);

// Upload limiter: 10 uploads per hour
const uploadLimiter = createLimiter(
  60 * 60 * 1000,
  10,
  'Too many file uploads from this IP. Please try again after 1 hour.'
);

// AI coach limiter: 30 requests per hour
const aiLimiter = createLimiter(
  60 * 60 * 1000,
  30,
  'Too many AI requests from this IP. Please try again after 1 hour.'
);

// Password reset limiter: 3 per hour
const passwordResetLimiter = createLimiter(
  60 * 60 * 1000,
  3,
  'Too many password reset requests from this IP. Please try again after 1 hour.'
);

export { generalLimiter, authLimiter, uploadLimiter, aiLimiter, passwordResetLimiter };
