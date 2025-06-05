/**
 * Redis Cache Manager for Cardiolive E-commerce Platform
 * Advanced caching layer with intelligent cache strategies
 */

const redis = require('redis');
const { logger } = require('../backend/src/utils/logger');

class RedisCacheManager {
  constructor(options = {}) {
    this.config = {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || '',
      db: process.env.REDIS_DB || 0,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      ...options
    };

    this.client = null;
    this.isConnected = false;
    this.metrics = {
      hits: 0,
      misses: 0,
      errors: 0,
      sets: 0,
      deletes: 0
    };

    this.defaultTTL = {
      products: 300, // 5 minutes
      categories: 600, // 10 minutes
      users: 180, // 3 minutes
      orders: 120, // 2 minutes
      search: 300, // 5 minutes
      api: 60, // 1 minute
      static: 3600, // 1 hour
      session: 1800 // 30 minutes
    };

    this.init();
  }

  /**
   * Initialize Redis connection
   */
  async init() {
    try {
      this.client = redis.createClient(this.config);

      this.client.on('connect', () => {
        logger.info('Redis client connected');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        logger.error('Redis connection error:', err);
        this.isConnected = false;
        this.metrics.errors++;
      });

      this.client.on('end', () => {
        logger.warn('Redis connection ended');
        this.isConnected = false;
      });

      await this.client.connect();
      logger.info('✅ Redis Cache Manager initialized');
    } catch (error) {
      logger.error('Failed to initialize Redis:', error);
      throw error;
    }
  }

  /**
   * Generate cache key with namespace
   */
  generateKey(namespace, identifier) {
    const env = process.env.NODE_ENV || 'development';
    return `cardiolive:${env}:${namespace}:${identifier}`;
  }

  /**
   * Get value from cache
   */
  async get(namespace, identifier) {
    if (!this.isConnected) {
      logger.warn('Redis not connected, cache miss');
      this.metrics.misses++;
      return null;
    }

    try {
      const key = this.generateKey(namespace, identifier);
      const value = await this.client.get(key);
      
      if (value !== null) {
        this.metrics.hits++;
        logger.debug(`Cache hit: ${key}`);
        return JSON.parse(value);
      } else {
        this.metrics.misses++;
        logger.debug(`Cache miss: ${key}`);
        return null;
      }
    } catch (error) {
      logger.error('Cache get error:', error);
      this.metrics.errors++;
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(namespace, identifier, value, ttl = null) {
    if (!this.isConnected) {
      logger.warn('Redis not connected, skipping cache set');
      return false;
    }

    try {
      const key = this.generateKey(namespace, identifier);
      const serializedValue = JSON.stringify(value);
      const cacheTTL = ttl || this.defaultTTL[namespace] || 300;

      await this.client.setEx(key, cacheTTL, serializedValue);
      this.metrics.sets++;
      logger.debug(`Cache set: ${key} (TTL: ${cacheTTL}s)`);
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      this.metrics.errors++;
      return false;
    }
  }

  /**
   * Delete from cache
   */
  async delete(namespace, identifier) {
    if (!this.isConnected) {
      return false;
    }

    try {
      const key = this.generateKey(namespace, identifier);
      const result = await this.client.del(key);
      this.metrics.deletes++;
      logger.debug(`Cache delete: ${key}`);
      return result > 0;
    } catch (error) {
      logger.error('Cache delete error:', error);
      this.metrics.errors++;
      return false;
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async deletePattern(pattern) {
    if (!this.isConnected) {
      return 0;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        const result = await this.client.del(keys);
        this.metrics.deletes += result;
        logger.debug(`Cache pattern delete: ${pattern} (${result} keys)`);
        return result;
      }
      return 0;
    } catch (error) {
      logger.error('Cache pattern delete error:', error);
      this.metrics.errors++;
      return 0;
    }
  }

  /**
   * Increment counter
   */
  async increment(namespace, identifier, by = 1) {
    if (!this.isConnected) {
      return null;
    }

    try {
      const key = this.generateKey(namespace, identifier);
      const result = await this.client.incrBy(key, by);
      logger.debug(`Cache increment: ${key} by ${by}`);
      return result;
    } catch (error) {
      logger.error('Cache increment error:', error);
      this.metrics.errors++;
      return null;
    }
  }

  /**
   * Set with expiration
   */
  async setWithExpiration(namespace, identifier, value, seconds) {
    return this.set(namespace, identifier, value, seconds);
  }

  /**
   * Get or set pattern (cache-aside)
   */
  async getOrSet(namespace, identifier, fetchFunction, ttl = null) {
    // Try to get from cache first
    let value = await this.get(namespace, identifier);
    
    if (value !== null) {
      return value;
    }

    // If not in cache, fetch and set
    try {
      value = await fetchFunction();
      if (value !== null && value !== undefined) {
        await this.set(namespace, identifier, value, ttl);
      }
      return value;
    } catch (error) {
      logger.error('GetOrSet fetch function error:', error);
      throw error;
    }
  }

  /**
   * Cache warming strategies
   */
  async warmCache() {
    logger.info('🔥 Starting cache warming...');

    try {
      // Warm popular products cache
      await this.warmPopularProducts();
      
      // Warm categories cache
      await this.warmCategories();
      
      // Warm featured content
      await this.warmFeaturedContent();

      logger.info('✅ Cache warming completed');
    } catch (error) {
      logger.error('Cache warming failed:', error);
    }
  }

  /**
   * Warm popular products
   */
  async warmPopularProducts() {
    // This would typically fetch from database
    // For now, we'll simulate the warming process
    logger.info('Warming popular products cache...');
    
    const popularProductIds = ['featured', 'bestsellers', 'new-arrivals'];
    
    for (const productType of popularProductIds) {
      const key = this.generateKey('products', productType);
      await this.client.setEx(key, this.defaultTTL.products, JSON.stringify({
        type: productType,
        warmed_at: new Date().toISOString()
      }));
    }
  }

  /**
   * Warm categories cache
   */
  async warmCategories() {
    logger.info('Warming categories cache...');
    
    const key = this.generateKey('categories', 'all');
    await this.client.setEx(key, this.defaultTTL.categories, JSON.stringify({
      categories: ['electronics', 'clothing', 'books', 'health'],
      warmed_at: new Date().toISOString()
    }));
  }

  /**
   * Warm featured content
   */
  async warmFeaturedContent() {
    logger.info('Warming featured content cache...');
    
    const contentTypes = ['blogs', 'promotions', 'banners'];
    
    for (const contentType of contentTypes) {
      const key = this.generateKey('content', contentType);
      await this.client.setEx(key, this.defaultTTL.static, JSON.stringify({
        type: contentType,
        warmed_at: new Date().toISOString()
      }));
    }
  }

  /**
   * Cache invalidation strategies
   */
  async invalidateUserCache(userId) {    const patterns = [
      this.generateKey('users', userId),
      this.generateKey('orders', `user:${userId}:*`)
    ];

    for (const pattern of patterns) {
      await this.deletePattern(pattern);
    }

    logger.info(`User cache invalidated for user: ${userId}`);
  }

  /**
   * Invalidate product cache
   */
  async invalidateProductCache(productId) {
    const patterns = [
      this.generateKey('products', productId),
      this.generateKey('products', 'featured'),
      this.generateKey('products', 'bestsellers'),
      this.generateKey('search', '*')
    ];

    for (const pattern of patterns) {
      await this.deletePattern(pattern);
    }

    logger.info(`Product cache invalidated for product: ${productId}`);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const totalRequests = this.metrics.hits + this.metrics.misses;
    const hitRate = totalRequests > 0 ? (this.metrics.hits / totalRequests * 100).toFixed(2) : 0;

    return {
      ...this.metrics,
      hitRate: `${hitRate}%`,
      isConnected: this.isConnected,
      totalRequests
    };
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      await this.client.ping();
      
      return {
        status: 'healthy',
        connected: true,
        stats: this.getStats()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        connected: false,
        error: error.message,
        stats: this.getStats()
      };
    }
  }

  /**
   * Graceful shutdown
   */
  async disconnect() {
    try {
      if (this.client) {
        await this.client.quit();
        logger.info('Redis client disconnected gracefully');
      }
    } catch (error) {
      logger.error('Error during Redis disconnect:', error);
    }
  }
}

// Middleware factory for Express
function createCacheMiddleware(cacheManager) {
  return function cacheMiddleware(namespace, ttl = null) {
    return async (req, res, next) => {
      // Generate cache key based on request
      const identifier = `${req.method}:${req.originalUrl}:${JSON.stringify(req.query)}`;
      
      try {
        // Try to get from cache
        const cachedResponse = await cacheManager.get(namespace, identifier);
        
        if (cachedResponse) {
          logger.debug(`Cache hit for ${req.originalUrl}`);
          return res.json(cachedResponse);
        }

        // Store original res.json
        const originalJson = res.json;
        
        // Override res.json to cache the response
        res.json = function(data) {
          // Cache successful responses only
          if (res.statusCode === 200) {
            cacheManager.set(namespace, identifier, data, ttl);
          }
          
          // Call original json method
          return originalJson.call(this, data);
        };

        next();
      } catch (error) {
        logger.error('Cache middleware error:', error);
        next();
      }
    };
  };
}

// Session cache for user sessions
class SessionCache extends RedisCacheManager {
  constructor(options = {}) {
    super(options);
    this.sessionPrefix = 'session';
  }

  async setSession(sessionId, sessionData, ttl = 1800) {
    return this.set(this.sessionPrefix, sessionId, sessionData, ttl);
  }

  async getSession(sessionId) {
    return this.get(this.sessionPrefix, sessionId);
  }

  async deleteSession(sessionId) {
    return this.delete(this.sessionPrefix, sessionId);
  }

  async refreshSession(sessionId, ttl = 1800) {
    const sessionData = await this.getSession(sessionId);
    if (sessionData) {
      return this.setSession(sessionId, sessionData, ttl);
    }
    return false;
  }
}

module.exports = {
  RedisCacheManager,
  SessionCache,
  createCacheMiddleware
};
