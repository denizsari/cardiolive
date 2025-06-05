/**
 * Cache Integration Setup for Cardiolive Backend
 * Integrates Redis caching with existing API endpoints
 */

const { RedisCacheManager, SessionCache, createCacheMiddleware } = require('../../caching/redis-cache');
const { logger } = require('./logger');

class CacheIntegration {
  constructor() {
    this.cacheManager = new RedisCacheManager();
    this.sessionCache = new SessionCache();
    this.middleware = createCacheMiddleware(this.cacheManager);
    
    // Cache warming schedule
    this.warmingInterval = null;
  }

  /**
   * Initialize cache integration
   */
  async init() {
    try {
      await this.cacheManager.init();
      await this.sessionCache.init();
      
      // Start cache warming
      await this.startCacheWarming();
      
      logger.info('✅ Cache integration initialized');
    } catch (error) {
      logger.error('Failed to initialize cache integration:', error);
      throw error;
    }
  }

  /**
   * Get cache middleware for different endpoints
   */
  getMiddleware() {
    return {
      // Product caching - 5 minutes
      products: this.middleware('products', 300),
      
      // Category caching - 10 minutes
      categories: this.middleware('categories', 600),
      
      // Search results - 5 minutes
      search: this.middleware('search', 300),
      
      // User profile - 3 minutes
      users: this.middleware('users', 180),
      
      // Orders - 2 minutes
      orders: this.middleware('orders', 120),
      
      // API responses - 1 minute
      api: this.middleware('api', 60),
      
      // Static content - 1 hour
      static: this.middleware('static', 3600)
    };
  }

  /**
   * Product-specific caching methods
   */
  async getProduct(productId, fetchFunction) {
    return this.cacheManager.getOrSet('products', productId, fetchFunction, 300);
  }

  async getFeaturedProducts(fetchFunction) {
    return this.cacheManager.getOrSet('products', 'featured', fetchFunction, 600);
  }

  async getProductsByCategory(categoryId, fetchFunction) {
    return this.cacheManager.getOrSet('products', `category:${categoryId}`, fetchFunction, 300);
  }

  async invalidateProduct(productId) {
    await this.cacheManager.invalidateProductCache(productId);
  }

  /**
   * User-specific caching methods
   */
  async getUserProfile(userId, fetchFunction) {
    return this.cacheManager.getOrSet('users', userId, fetchFunction, 180);
  }

  async getUserOrders(userId, fetchFunction) {
    return this.cacheManager.getOrSet('orders', `user:${userId}`, fetchFunction, 120);
  }

  async invalidateUser(userId) {
    await this.cacheManager.invalidateUserCache(userId);
  }

  /**
   * Search caching methods
   */
  async getSearchResults(query, filters, fetchFunction) {
    const searchKey = `${query}:${JSON.stringify(filters)}`;
    return this.cacheManager.getOrSet('search', searchKey, fetchFunction, 300);
  }

  async invalidateSearchCache() {
    await this.cacheManager.deletePattern(this.cacheManager.generateKey('search', '*'));
  }

  /**
   * Session management
   */
  async setUserSession(sessionId, userData) {
    return this.sessionCache.setSession(sessionId, userData);
  }

  async getUserSession(sessionId) {
    return this.sessionCache.getSession(sessionId);
  }

  async deleteUserSession(sessionId) {
    return this.sessionCache.deleteSession(sessionId);
  }

  async refreshUserSession(sessionId) {
    return this.sessionCache.refreshSession(sessionId);
  }

  /**
   * Shopping cart caching
   */
  async getCart(userId, fetchFunction) {
    return this.cacheManager.getOrSet('cart', userId, fetchFunction, 1800); // 30 minutes
  }

  async updateCart(userId, cartData) {
    return this.cacheManager.set('cart', userId, cartData, 1800);
  }

  async clearCart(userId) {
    return this.cacheManager.delete('cart', userId);
  }
  /**
   * Cache warming
   */
  async startCacheWarming() {
    // Initial warming
    await this.cacheManager.warmCache();
    
    // Schedule periodic warming every 30 minutes
    this.warmingInterval = setInterval(async () => {
      try {
        await this.cacheManager.warmCache();
        logger.info('🔥 Periodic cache warming completed');
      } catch (error) {
        logger.error('Periodic cache warming failed:', error);
      }
    }, 30 * 60 * 1000); // 30 minutes
  }

  /**
   * Cache analytics and monitoring
   */
  getCacheStats() {
    return {
      main: this.cacheManager.getStats(),
      session: this.sessionCache.getStats()
    };
  }

  async getCacheHealth() {
    const [mainHealth, sessionHealth] = await Promise.all([
      this.cacheManager.healthCheck(),
      this.sessionCache.healthCheck()
    ]);

    return {
      main: mainHealth,
      session: sessionHealth,
      overall: mainHealth.status === 'healthy' && sessionHealth.status === 'healthy' ? 'healthy' : 'degraded'
    };
  }

  /**
   * Cache metrics for Prometheus
   */
  getMetricsData() {
    const stats = this.getCacheStats();
    
    return {
      cache_hits_total: stats.main.hits + stats.session.hits,
      cache_misses_total: stats.main.misses + stats.session.misses,
      cache_errors_total: stats.main.errors + stats.session.errors,
      cache_sets_total: stats.main.sets + stats.session.sets,
      cache_deletes_total: stats.main.deletes + stats.session.deletes,
      cache_hit_rate: parseFloat(stats.main.hitRate.replace('%', ''))
    };
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    logger.info('Shutting down cache integration...');
    
    // Clear warming interval
    if (this.warmingInterval) {
      clearInterval(this.warmingInterval);
    }
    
    // Disconnect cache managers
    await Promise.all([
      this.cacheManager.disconnect(),
      this.sessionCache.disconnect()
    ]);
    
    logger.info('✅ Cache integration shutdown completed');
  }
}

// Export singleton instance
const cacheIntegration = new CacheIntegration();

module.exports = {
  CacheIntegration,
  cacheIntegration
};
