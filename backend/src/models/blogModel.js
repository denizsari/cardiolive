const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: { 
    type: String, 
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  excerpt: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 500
  },
  content: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true,
    trim: true
  },  tags: [{
    type: String,
    trim: true
  }],  featured: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  publishedAt: {
    type: Date
  },
  image: {
    type: String,
    default: '/blog/placeholder.jpg'
  },
  metaTitle: {
    type: String,
    maxlength: 60
  },
  metaDescription: {
    type: String,
    maxlength: 160
  }
}, {
  timestamps: true
});

// Create indexes for performance
blogSchema.index({ publishedAt: -1 });
blogSchema.index({ category: 1 });
blogSchema.index({ featured: 1 });
blogSchema.index({ tags: 1 });

// Pre-save middleware to set publishedAt
blogSchema.pre('save', function(next) {
  if (this.isNew || !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Blog', blogSchema);