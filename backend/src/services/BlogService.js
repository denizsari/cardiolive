const BaseService = require('./BaseService');
const Blog = require('../models/blogModel');
const { logger } = require('../utils/logger');
const mongoose = require('mongoose');

/**
 * Blog Service Class
 * Handles all blog-related business logic
 * @class BlogService
 * @extends BaseService
 */
class BlogService extends BaseService {
  constructor() {
    super(Blog);
  }

  /**
   * Get all blogs with filtering, sorting and pagination
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated blogs
   */  async getBlogs(filters = {}, options = {}) {
    const { 
      category, 
      search,
      startDate,
      endDate
    } = filters;

    // Build filter
    const filter = {};    
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { content: new RegExp(search, 'i') },
        { excerpt: new RegExp(search, 'i') }
      ];
    }
      if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);    }

    const queryOptions = {
      ...options
    };

    const result = await this.findAll(filter, queryOptions);
    
    // Transform documents to blogs for consistent API
    return {
      blogs: result.documents,
      pagination: result.pagination
    };
  }

  /**
   * Get blog by slug with view count increment
   * @param {string} slug - Blog slug
   * @returns {Promise<Object>} Blog document
   * @throws {Error} If blog not found
   */  async getBlogBySlug(slug) {
    const blog = await this.findOne({ slug });
    if (!blog) {
      throw new Error('Blog bulunamadı');
    }

    // Increment view count
    blog.viewCount = (blog.viewCount || 0) + 1;
    await blog.save();

    logger.info('Blog viewed', { blogId: blog._id, slug, viewCount: blog.viewCount });

    return blog;
  }

  /**
   * Get blog by ID with view count increment
   * @param {string} blogId - Blog ID
   * @returns {Promise<Object>} Blog document
   * @throws {Error} If blog not found or invalid ID
   */
  async getBlogById(blogId) {
    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      throw new Error('Geçersiz blog ID');
    }

    const blog = await this.findById(blogId);
    if (!blog) {
      throw new Error('Blog bulunamadı');
    }

    // Increment view count
    blog.viewCount = (blog.viewCount || 0) + 1;
    await blog.save();

    logger.info('Blog viewed', { blogId: blog._id, viewCount: blog.viewCount });

    return blog;
  }
  /**   * Create a new blog (Admin only)
   * @param {Object} blogData - Blog creation data
   * @returns {Promise<Object>} Created blog
   * @throws {Error} If slug already exists
   */async createBlog(blogData) {
    const { title, content, excerpt, category, image, tags, featured } = blogData;

    // Generate slug from title
    const slug = this.generateSlug(title);

    // Check if slug exists
    const existingBlog = await this.findOne({ slug });
    if (existingBlog) {
      throw new Error('Bu başlıkla bir blog zaten mevcut');
    }

const blog = await this.create({
      title,
      slug,
      content,
      excerpt,
      category,
      image,
      tags: tags || [],
      featured: featured || false,
      publishedAt: new Date(),
      viewCount: 0
    });

    logger.info('Blog created', { blogId: blog._id, title });

    return blog;
  }

  /**
   * Update a blog (Admin only)
   * @param {string} blogId - Blog ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated blog
   * @throws {Error} If blog not found or slug conflict
   */  async updateBlog(blogId, updateData) {
    const { title, content, excerpt, category, tags, featured } = updateData;

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      throw new Error('Geçersiz blog ID');
    }

    const blog = await this.findById(blogId);
    if (!blog) {
      throw new Error('Blog bulunamadı');
    }

    const updateFields = {};

    // Update fields
    if (title && title !== blog.title) {
      // Generate new slug if title changed
      const slug = this.generateSlug(title);

      // Check if new slug exists
      const existingBlog = await this.findOne({ slug, _id: { $ne: blogId } });
      if (existingBlog) {
        throw new Error('Bu başlıkla bir blog zaten mevcut');
      }

      updateFields.title = title;
      updateFields.slug = slug;
    }

    if (content !== undefined) updateFields.content = content;
    if (excerpt !== undefined) updateFields.excerpt = excerpt;
    if (category !== undefined) updateFields.category = category;
    if (tags !== undefined) updateFields.tags = tags;
    if (featured !== undefined) updateFields.featured = featured;
    
    updateFields.updatedAt = new Date();

    const updatedBlog = await this.updateById(blogId, updateFields);

    logger.info('Blog updated', { blogId, title: updatedBlog.title });

    return updatedBlog;
  }

  /**
   * Delete a blog (Admin only)
   * @param {string} blogId - Blog ID
   * @returns {Promise<void>}
   * @throws {Error} If blog not found
   */
  async deleteBlog(blogId) {
    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      throw new Error('Geçersiz blog ID');
    }

    const blog = await this.findById(blogId);
    if (!blog) {
      throw new Error('Blog bulunamadı');
    }

    await this.deleteById(blogId);

    logger.info('Blog deleted', { blogId, title: blog.title });
  }

  /**
   * Get featured blogs
   * @param {number} limit - Number of blogs to return
   * @returns {Promise<Array>} Featured blogs
   */  async getFeaturedBlogs(limit = 5) {
    const blogs = await this.model
      .find({ 
        featured: true
      })
      .sort({ createdAt: -1 })      .limit(Number(limit))
      .select('title slug excerpt category createdAt viewCount');

    return blogs;
  }

  /**
   * Get blog categories with post counts
   * @returns {Promise<Array>} Categories with counts
   */  async getBlogCategories() {
    const categories = await this.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    return categories.map(cat => ({
      name: cat._id,
      count: cat.count
    }));
  }

  /**
   * Get related blogs based on category and tags
   * @param {string} blogId - Current blog ID
   * @param {number} limit - Number of related blogs to return
   * @returns {Promise<Array>} Related blogs
   */
  async getRelatedBlogs(blogId, limit = 4) {
    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      throw new Error('Geçersiz blog ID');
    }

    const currentBlog = await this.findById(blogId);
    if (!currentBlog) {
      throw new Error('Blog bulunamadı');
    }    const relatedBlogs = await this.model
      .find({
        _id: { $ne: blogId },
        $or: [
          { category: currentBlog.category },
          { tags: { $in: currentBlog.tags } }
        ]
      })      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .select('title slug excerpt category createdAt viewCount');

    return relatedBlogs;
  }

  /**
   * Get blog statistics
   * @returns {Promise<Object>} Blog statistics
   */  async getBlogStats() {
    const stats = await this.aggregate([
      {
        $group: {
          _id: null,
          totalBlogs: { $sum: 1 },
          featuredBlogs: { $sum: { $cond: ['$featured', 1, 0] } },
          totalViews: { $sum: '$viewCount' },
          averageViews: { $avg: '$viewCount' }
        }
      }
    ]);

    const categoryStats = await this.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalViews: { $sum: '$viewCount' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return {
      ...stats[0],
      categoryStats
    };
  }

  /**
   * Search blogs with text search
   * @param {string} query - Search query
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Search results
   */  async searchBlogs(query, options = {}) {
    const filter = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { excerpt: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    };    const queryOptions = {
      ...options
    };

    return await this.findAll(filter, queryOptions);
  }

  /**
   * Generate URL-friendly slug from title
   * @param {string} title - Blog title
   * @returns {string} Generated slug
   * @private
   */
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim('-'); // Remove leading/trailing hyphens
  }
}

module.exports = new BlogService();
