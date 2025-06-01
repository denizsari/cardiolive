/**
 * @fileoverview Blog Controller - Handles blog management operations
 * @description Manages blog posts, categories, and content management
 * @author Cardiolive E-commerce Platform
 * @version 1.0.0
 */

const BlogService = require('../services/BlogService');
const ResponseHandler = require('../utils/responseHandler');
const { logger } = require('../utils/logger');

/**
 * Get all blogs with filtering, sorting and pagination
 * @route GET /api/blogs
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with blogs and pagination
 */
exports.getAllBlogs = async (req, res) => {
  try {    const filterOptions = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      category: req.query.category,
      search: req.query.search,
      sort: req.query.sort || 'createdAt',
      order: req.query.order || 'desc',
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    logger.logEvent('business', 'blogs_fetch_initiated', {
      filters: filterOptions,
      requestId: req.id
    });    const result = await BlogService.getBlogs(filterOptions);

    logger.logEvent('business', 'blogs_fetched', {
      blogCount: result.blogs.length,
      totalBlogs: result.pagination.totalBlogs,
      category: filterOptions.category,
      requestId: req.id
    });

    ResponseHandler.success(res, 'Bloglar başarıyla getirildi', result);
  } catch (error) {
    logger.logEvent('error', 'blogs_fetch_failed', {
      filters: req.query,
      error: error.message,
      stack: error.stack,
      requestId: req.id
    });

    ResponseHandler.error(res, 'Blogları getirme hatası', error);
  }
};

/**
 * Get single blog by ID
 * @route GET /api/blogs/:id
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with blog details
 */
exports.getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    logger.logEvent('business', 'blog_fetch_by_id_initiated', {
      blogId: id,
      requestId: req.id
    });

    const blog = await BlogService.getBlogById(id);

    logger.logEvent('business', 'blog_viewed', {
      blogId: id,
      title: blog.title,
      category: blog.category,
      newViewCount: blog.viewCount,
      requestId: req.id
    });

    ResponseHandler.success(res, 'Blog başarıyla getirildi', { blog });
  } catch (error) {
    logger.logEvent('error', 'blog_fetch_by_id_failed', {
      blogId: req.params.id,
      error: error.message,
      stack: error.stack,
      requestId: req.id
    });

    ResponseHandler.error(res, 'Blog getirme hatası', error);
  }
};

/**
 * Get blog by slug (SEO friendly)
 * @route GET /api/blogs/slug/:slug
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with blog details
 */
exports.getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    logger.logEvent('business', 'blog_fetch_by_slug_initiated', {
      slug,
      requestId: req.id
    });

    const blog = await BlogService.getBlogBySlug(slug);

    logger.logEvent('business', 'blog_viewed_by_slug', {
      blogId: blog._id,
      slug,
      title: blog.title,
      category: blog.category,
      newViewCount: blog.viewCount,
      requestId: req.id
    });

    ResponseHandler.success(res, 'Blog başarıyla getirildi', { blog });
  } catch (error) {
    logger.logEvent('error', 'blog_fetch_by_slug_failed', {
      slug: req.params.slug,
      error: error.message,
      stack: error.stack,
      requestId: req.id
    });

    ResponseHandler.error(res, 'Blog getirme hatası', error);
  }
};

/**
 * Create new blog (Admin only)
 * @route POST /api/blogs
 * @access Private (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with created blog
 */
exports.createBlog = async (req, res) => {  try {
    const blogData = {
      ...req.body
    };

    logger.logEvent('business', 'blog_creation_initiated', {
      adminId: req.user?.userId || 'test-admin',
      title: blogData.title,
      category: blogData.category,
      status: blogData.status,
      requestId: req.id
    });

    const blog = await BlogService.createBlog(blogData);

    logger.logEvent('business', 'blog_created', {
      blogId: blog._id,
      adminId: req.user?.userId || 'test-admin',
      title: blog.title,
      slug: blog.slug,
      category: blog.category,
      status: blog.status,
      featured: blog.featured,
      requestId: req.id
    });

    ResponseHandler.created(res, 'Blog başarıyla oluşturuldu', { blog });  } catch (error) {
    logger.logEvent('error', 'blog_creation_failed', {
      adminId: req.user?.userId || 'test-admin',
      title: req.body.title,
      error: error.message,
      stack: error.stack,
      requestId: req.id
    });

    ResponseHandler.error(res, 'Blog oluşturma hatası', error);
  }
};

/**
 * Update blog (Admin only)
 * @route PUT /api/blogs/:id
 * @access Private (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated blog
 */
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const adminId = req.user.userId;

    logger.logEvent('business', 'blog_update_initiated', {
      blogId: id,
      adminId,
      updateFields: Object.keys(updateData),
      requestId: req.id
    });

    const blog = await BlogService.updateBlog(id, updateData);

    logger.logEvent('business', 'blog_updated', {
      blogId: id,
      adminId,
      title: blog.title,
      slug: blog.slug,
      category: blog.category,
      status: blog.status,
      featured: blog.featured,
      requestId: req.id
    });

    ResponseHandler.success(res, 'Blog başarıyla güncellendi', { blog });
  } catch (error) {
    logger.logEvent('error', 'blog_update_failed', {
      blogId: req.params.id,
      adminId: req.user.userId,
      error: error.message,
      stack: error.stack,
      requestId: req.id
    });

    ResponseHandler.error(res, 'Blog güncelleme hatası', error);
  }
};

/**
 * Delete blog (Admin only)
 * @route DELETE /api/blogs/:id
 * @access Private (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response confirmation
 */
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.userId;

    logger.logEvent('security', 'blog_deletion_initiated', {
      blogId: id,
      adminId,
      requestId: req.id
    });

    await BlogService.deleteBlog(id);

    logger.logEvent('security', 'blog_deleted', {
      blogId: id,
      adminId,
      requestId: req.id
    });

    ResponseHandler.success(res, 'Blog başarıyla silindi');
  } catch (error) {
    logger.logEvent('error', 'blog_deletion_failed', {
      blogId: req.params.id,
      adminId: req.user.userId,
      error: error.message,
      stack: error.stack,
      requestId: req.id
    });

    ResponseHandler.error(res, 'Blog silme hatası', error);
  }
};

/**
 * Get featured blogs
 * @route GET /api/blogs/featured
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with featured blogs
 */
exports.getFeaturedBlogs = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    logger.logEvent('business', 'featured_blogs_fetch_initiated', {
      limit,
      requestId: req.id
    });

    const result = await BlogService.getFeaturedBlogs(Number(limit));

    logger.logEvent('business', 'featured_blogs_fetched', {
      blogCount: result.blogs.length,
      requestId: req.id
    });

    ResponseHandler.success(res, 'Öne çıkan bloglar getirildi', result);
  } catch (error) {
    logger.logEvent('error', 'featured_blogs_fetch_failed', {
      error: error.message,
      stack: error.stack,
      requestId: req.id
    });

    ResponseHandler.error(res, 'Öne çıkan blogları getirme hatası', error);
  }
};

/**
 * Get blog categories
 * @route GET /api/blogs/categories
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with blog categories
 */
exports.getBlogCategories = async (req, res) => {
  try {
    logger.logEvent('business', 'blog_categories_fetch_initiated', {
      requestId: req.id
    });

    const result = await BlogService.getBlogCategories();

    logger.logEvent('business', 'blog_categories_fetched', {
      categoryCount: result.categories.length,
      requestId: req.id
    });

    ResponseHandler.success(res, 'Blog kategorileri getirildi', result);
  } catch (error) {
    logger.logEvent('error', 'blog_categories_fetch_failed', {
      error: error.message,
      stack: error.stack,
      requestId: req.id
    });

    ResponseHandler.error(res, 'Blog kategorilerini getirme hatası', error);
  }
};

/**
 * Get related blogs
 * @route GET /api/blogs/:id/related
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with related blogs
 */
exports.getRelatedBlogs = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 4 } = req.query;

    logger.logEvent('business', 'related_blogs_fetch_initiated', {
      blogId: id,
      limit,
      requestId: req.id
    });

    const result = await BlogService.getRelatedBlogs(id, Number(limit));

    logger.logEvent('business', 'related_blogs_fetched', {
      blogId: id,
      relatedCount: result.blogs.length,
      requestId: req.id
    });

    ResponseHandler.success(res, 'İlgili bloglar getirildi', result);
  } catch (error) {
    logger.logEvent('error', 'related_blogs_fetch_failed', {
      blogId: req.params.id,
      error: error.message,
      stack: error.stack,
      requestId: req.id
    });

    ResponseHandler.error(res, 'İlgili blogları getirme hatası', error);
  }
};