const Blog = require('../models/blogModel');

// Tüm blogları getir
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Bloglar alınamadı', error: err.message });
  }
};

// Tek blog getir
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog bulunamadı' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Blog alınamadı', error: err.message });
  }
};

// Blog oluştur
exports.createBlog = async (req, res) => {
  try {
    const newBlog = new Blog(req.body);
    await newBlog.save();
    res.status(201).json(newBlog);
  } catch (err) {
    res.status(400).json({ success: false, message: 'Blog oluşturulamadı', error: err.message });
  }
};

// Blog güncelle
exports.updateBlog = async (req, res) => {
  try {
    const updated = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Blog bulunamadı' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ success: false, message: 'Blog güncellenemedi', error: err.message });
  }
};

// Blog sil
exports.deleteBlog = async (req, res) => {
  try {
    const deleted = await Blog.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Blog bulunamadı' });
    res.json({ success: true, message: 'Blog silindi' });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Blog silinemedi', error: err.message });
  }
}; 