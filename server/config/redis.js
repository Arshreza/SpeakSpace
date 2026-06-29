import Redis from 'ioredis';
import logger from '../utils/logger.js';

let redisClient = null;

const createRedisClient = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  const client = new Redis(redisUrl, {
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      if (times > 20) {
        logger.error('Redis: Max connection retries reached');
        return null;
      }
      logger.warn(`Redis retry attempt ${times}, reconnecting in ${delay}ms`);
      return delay;
    },
    reconnectOnError(err) {
      const targetErrors = ['READONLY', 'ECONNRESET', 'ECONNREFUSED'];
      return targetErrors.some((e) => err.message.includes(e));
    },
    enableOfflineQueue: true,
    maxRetriesPerRequest: 3,
    lazyConnect: false,
  });

  client.on('connect', () => {
    logger.info('Redis client connected');
  });

  client.on('ready', () => {
    logger.info('Redis client ready');
  });

  client.on('error', (err) => {
    logger.error(`Redis client error: ${err.message}`);
  });

  client.on('close', () => {
    logger.warn('Redis client connection closed');
  });

  client.on('reconnecting', () => {
    logger.info('Redis client reconnecting...');
  });

  client.on('end', () => {
    logger.warn('Redis client connection ended');
  });

  return client;
};

redisClient = createRedisClient();

/**
 * Set a cache value with optional TTL in seconds
 */
const setCache = async (key, data, ttl = 3600) => {
  try {
    if (!redisClient || redisClient.status !== 'ready') return false;
    const serialized = JSON.stringify(data);
    if (ttl) {
      await redisClient.setex(key, ttl, serialized);
    } else {
      await redisClient.set(key, serialized);
    }
    return true;
  } catch (error) {
    logger.error(`Redis setCache error for key "${key}": ${error.message}`);
    return false;
  }
};

/**
 * Get a cached value by key
 */
const getCache = async (key) => {
  try {
    if (!redisClient || redisClient.status !== 'ready') return null;
    const data = await redisClient.get(key);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    logger.error(`Redis getCache error for key "${key}": ${error.message}`);
    return null;
  }
};

/**
 * Delete a cache entry by key
 */
const deleteCache = async (key) => {
  try {
    if (!redisClient || redisClient.status !== 'ready') return false;
    await redisClient.del(key);
    return true;
  } catch (error) {
    logger.error(`Redis deleteCache error for key "${key}": ${error.message}`);
    return false;
  }
};

/**
 * Clear all cache entries matching a pattern (e.g., "user:*")
 */
const clearCacheByPattern = async (pattern) => {
  try {
    if (!redisClient || redisClient.status !== 'ready') return false;
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
      logger.info(`Redis: Cleared ${keys.length} keys matching pattern "${pattern}"`);
    }
    return true;
  } catch (error) {
    logger.error(`Redis clearCacheByPattern error for pattern "${pattern}": ${error.message}`);
    return false;
  }
};

export { redisClient, setCache, getCache, deleteCache, clearCacheByPattern };
export default redisClient;
