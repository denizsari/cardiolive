const Blog = require('../models/blogModel');
const ResponseHandler = require('../utils/responseHandler');
const mongoose = require('mongoose');

// Utility function to check valid ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Get all blogs with filtering, sorting and pagination
exports.getAllBlogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      author, 
      status = 'published',
      search,
      sort = 'createdAt', 
      order = 'desc',
      startDate,
      endDate
    } = req.query;

    // Build filter
    const filter = {};
    
    if (status && status !== 'all') filter.status = status;
    if (category) filter.category = category;
    if (author) filter.author = new RegExp(author, 'i');
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
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build sort
    const sortObj = { [sort]: order === 'asc' ? 1 : -1 };

    const blogs = await Blog.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit))
      .select('-__v');

    const totalBlogs = await Blog.countDocuments(filter);

    const pagination = {
      currentPage: Number(page),
      totalPages: Math.ceil(totalBlogs / limit),
      totalBlogs,
      hasNext: page < Math.ceil(totalBlogs / limit),
      hasPrev: page > 1
    };    ResponseHandler.success(res, {
      blogs,
      pagination,
      count: blogs.length
    }, 'Bloglar başarıyla getirildi');
  } catch (error) {
    ResponseHandler.error(res, 'Blogları getirme hatası', error);
  }
};

// Get single blog by ID
exports.getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return ResponseHandler.badRequest(res, 'Geçersiz blog ID');
    }

    const blog = await Blog.findById(id).select('-__v');
    
    if (!blog) {
      return ResponseHandler.notFound(res, 'Blog bulunamadı');
    }

    // Increment view count
    blog.viewCount = (blog.viewCount || 0) + 1;
    await blog.save();    ResponseHandler.success(res, { blog }, 'Blog başarıyla getirildi');
  } catch (error) {
    ResponseHandler.error(res, 'Blog getirme hatası', error);
  }
};

// Get blog by slug (SEO friendly)
exports.getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug, status: 'published' }).select('-__v');
    
    if (!blog) {
      return ResponseHandler.notFound(res, 'Blog bulunamadı');
    }

    // Increment view count
    blog.viewCount = (blog.viewCount || 0) + 1;
    await blog.save();    ResponseHandler.success(res, { blog }, 'Blog başarıyla getirildi');
  } catch (error) {
    ResponseHandler.error(res, 'Blog getirme hatası', error);
  }
};

// Create new blog (Admin only)
exports.createBlog = async (req, res) => {
  try {
    const { title, content, excerpt, category, tags, featured, status = 'draft' } = req.body;
    const authorId = req.user.userId;

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    // Check if slug exists
    const existingBlog = await Blog.findOne({ slug });
    if (existingBlog) {
      return ResponseHandler.badRequest(res, 'Bu başlıkla bir blog zaten mevcut');
    }

    const blog = new Blog({
      title,
      slug,
      content,
      excerpt,
      category,
      tags: tags || [],
      featured: featured || false,
      status,
      author: authorId,
      publishedAt: status === 'published' ? new Date() : null
    });

    await blog.save();
    await blog.populate('author', 'name email');

    ResponseHandler.created(res, 'Blog başarıyla oluşturuldu', { blog });
  } catch (error) {
    ResponseHandler.error(res, 'Blog oluşturma hatası', error);
  }
};

// Update blog (Admin only)
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, category, tags, featured, status } = req.body;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return ResponseHandler.badRequest(res, 'Geçersiz blog ID');
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return ResponseHandler.notFound(res, 'Blog bulunamadı');
    }

    // Update fields
    if (title && title !== blog.title) {
      // Generate new slug if title changed
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');

      // Check if new slug exists
      const existingBlog = await Blog.findOne({ slug, _id: { $ne: id } });
      if (existingBlog) {
        return ResponseHandler.badRequest(res, 'Bu başlıkla bir blog zaten mevcut');
      }

      blog.title = title;
      blog.slug = slug;
    }

    if (content !== undefined) blog.content = content;
    if (excerpt !== undefined) blog.excerpt = excerpt;
    if (category !== undefined) blog.category = category;
    if (tags !== undefined) blog.tags = tags;
    if (featured !== undefined) blog.featured = featured;
    
    // Handle status change
    if (status !== undefined && status !== blog.status) {
      blog.status = status;
      if (status === 'published' && !blog.publishedAt) {
        blog.publishedAt = new Date();
      }
    }

    blog.updatedAt = new Date();
    await blog.save();
    await blog.populate('author', 'name email');    ResponseHandler.success(res, { blog }, 'Blog başarıyla güncellendi');
  } catch (error) {
    ResponseHandler.error(res, 'Blog güncelleme hatası', error);
  }
};

// Delete blog (Admin only)
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return ResponseHandler.badRequest(res, 'Geçersiz blog ID');
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return ResponseHandler.notFound(res, 'Blog bulunamadı');
    }

    await Blog.findByIdAndDelete(id);

    ResponseHandler.success(res, 'Blog başarıyla silindi');
  } catch (error) {
    ResponseHandler.error(res, 'Blog silme hatası', error);
  }
};

// Get featured blogs
exports.getFeaturedBlogs = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const blogs = await Blog.find({ 
      featured: true, 
      status: 'published' 
    })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .select('title slug excerpt category createdAt author viewCount')
      .populate('author', 'name');    ResponseHandler.success(res, {
      blogs,
      count: blogs.length
    }, 'Öne çıkan bloglar getirildi');
  } catch (error) {
    ResponseHandler.error(res, 'Öne çıkan blogları getirme hatası', error);
  }
};

// Get blog categories
exports.getBlogCategories = async (req, res) => {
  try {
    const categories = await Blog.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);    ResponseHandler.success(res, {
      categories: categories.map(cat => ({
        name: cat._id,
        count: cat.count
      }))
    }, 'Blog kategorileri getirildi');
  } catch (error) {
    ResponseHandler.error(res, 'Blog kategorilerini getirme hatası', error);
  }
};

// Get related blogs
exports.getRelatedBlogs = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 4 } = req.query;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return ResponseHandler.badRequest(res, 'Geçersiz blog ID');
    }

    const currentBlog = await Blog.findById(id);
    if (!currentBlog) {
      return ResponseHandler.notFound(res, 'Blog bulunamadı');
    }

    const relatedBlogs = await Blog.find({
      _id: { $ne: id },
      status: 'published',
      $or: [
        { category: currentBlog.category },
        { tags: { $in: currentBlog.tags } }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .select('title slug excerpt category createdAt viewCount')
      .populate('author', 'name');    ResponseHandler.success(res, {
      blogs: relatedBlogs,
      count: relatedBlogs.length
    }, 'İlgili bloglar getirildi');
  } catch (error) {
    ResponseHandler.error(res, 'İlgili blogları getirme hatası', error);
  }
};