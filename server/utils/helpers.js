import slugify from 'slugify';

/**
 * Paginate a mongoose query
 */
const paginate = async (query, page = 1, limit = 10) => {
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [data, total] = await Promise.all([
    query.skip(skip).limit(limitNum),
    query.model.countDocuments(query.getQuery()),
  ]);

  return {
    data,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
      hasNext: pageNum < Math.ceil(total / limitNum),
      hasPrev: pageNum > 1,
    },
  };
};

/**
 * Generate a URL-friendly slug from a name
 */
const generateSlug = (name) => {
  return slugify(name, {
    lower: true,
    strict: true,
    trim: true,
  });
};

/**
 * Sanitize user object to remove sensitive fields
 */
const sanitizeUser = (user) => {
  if (!user) return null;

  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  delete userObj.emailVerificationToken;
  delete userObj.emailVerificationExpire;
  delete userObj.resetPasswordToken;
  delete userObj.resetPasswordExpire;
  delete userObj.refreshTokens;
  delete userObj.__v;

  return userObj;
};

/**
 * XP levels table — each level requires progressively more XP
 */
const XP_LEVELS = [
  0, 100, 250, 500, 900, 1400, 2000, 2750, 3600, 4600, 5800, 7200, 8800,
  10600, 12600, 15000, 17500, 20200, 23100, 26200,
];

/**
 * Calculate user level based on total XP
 */
const calculateLevel = (xp) => {
  let level = 1;
  for (let i = 0; i < XP_LEVELS.length; i++) {
    if (xp >= XP_LEVELS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return level;
};

/**
 * Get total XP required to reach a given level
 */
const getXPForLevel = (level) => {
  const safeLevel = Math.max(1, Math.min(level, XP_LEVELS.length));
  return XP_LEVELS[safeLevel - 1] || 0;
};

/**
 * Format bytes to human readable string
 */
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Get the ISO week string for a given date (e.g., "2024-W03")
 */
const getWeekString = (date = new Date()) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

/**
 * Generate a random alphanumeric string of given length
 */
const generateRandomString = (length = 16) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Check if two dates are the same day
 */
const isSameDay = (d1, d2) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

/**
 * Check if a date was yesterday relative to today
 */
const isYesterday = (date) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(new Date(date), yesterday);
};

export {
  paginate,
  generateSlug,
  sanitizeUser,
  calculateLevel,
  getXPForLevel,
  formatBytes,
  getWeekString,
  generateRandomString,
  isSameDay,
  isYesterday,
};
