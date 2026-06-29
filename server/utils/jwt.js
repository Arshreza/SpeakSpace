import jwt from 'jsonwebtoken';
import logger from './logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'speckspace_dev_secret_key_min_32_chars_long';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'speckspace_refresh_dev_secret_key_min_32_chars';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '15m';
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '7d';

/**
 * Sign an access token for a given user ID
 */
const signAccessToken = (userId) => {
  return jwt.sign({ id: userId, type: 'access' }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
    issuer: 'speckspace',
    audience: 'speckspace-client',
  });
};

/**
 * Sign a refresh token for a given user ID
 */
const signRefreshToken = (userId) => {
  return jwt.sign({ id: userId, type: 'refresh' }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRE,
    issuer: 'speckspace',
    audience: 'speckspace-client',
  });
};

/**
 * Verify an access token and return the decoded payload
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'speckspace',
      audience: 'speckspace-client',
    });
  } catch (error) {
    logger.debug(`Access token verification failed: ${error.message}`);
    throw error;
  }
};

/**
 * Verify a refresh token and return the decoded payload
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'speckspace',
      audience: 'speckspace-client',
    });
  } catch (error) {
    logger.debug(`Refresh token verification failed: ${error.message}`);
    throw error;
  }
};

export { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken };
