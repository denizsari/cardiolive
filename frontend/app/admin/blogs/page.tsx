'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiPlus, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import { blogAPI, uploadAPI } from '@/utils/api';
import Button from '@/components/ui/Button';
import { FileUpload } from '@/components/forms/FileUploadComponents';

interface Blog {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  image: string;
  date: string;
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    image: ''
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await blogAPI.getAll();
      setBlogs(response);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error fetching blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== FRONTEND SUBMIT DEBUG ===');
    console.log('Form data:', JSON.stringify(formData, null, 2));
    console.log('============================');
    
    try {
      if (editingBlog) {
        await blogAPI.update(editingBlog._id, formData);
      } else {
        await blogAPI.create(formData);
      }
      fetchBlogs();
      setShowCreateForm(false);
      setEditingBlog(null);
      setFormData({ title: '', content: '', excerpt: '', category: '', image: '' });
    } catch (error) {
      console.error('Submit error:', error);
      setError(error instanceof Error ? error.message : 'Error saving blog');
    }
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt,
      category: blog.category,
      image: blog.image
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    
    try {
      await blogAPI.delete(id);
      fetchBlogs();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error deleting blog');
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingBlog(null);
    setFormData({ title: '', content: '', excerpt: '', category: '', image: '' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-900">Blog Management</h1>
        <Button
          variant="primary"
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2"
        >
          <FiPlus /> Create New Blog
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            {editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                placeholder="Blog Post Title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Excerpt
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                placeholder="Short excerpt of the blog post"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                placeholder="Blog category"
                required
              />
            </div>            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blog Image
              </label>              <FileUpload
                label="Blog Image"
                accept="image/*"
                multiple={false}
                maxSize={10 * 1024 * 1024} // 10MB
                onFilesChange={(files) => {
                  // Update the form with the selected files
                  console.log('Files changed:', files);
                }}                uploadFunction={async (file) => {
                  try {
                    const uploadResult = await uploadAPI.uploadSingle(file);
                    setFormData({ ...formData, image: uploadResult.url });
                    return uploadResult.url;
                  } catch (error) {
                    setError('Failed to upload image');
                    console.error('Upload error:', error);
                    throw error;
                  }
                }}
                className="mb-2"
              />{formData.image && (
                <div className="mt-2">
                  <Image 
                    src={formData.image} 
                    alt="Blog preview" 
                    width={128}
                    height={80}
                    className="w-32 h-20 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: '' })}
                    className="mt-1 text-sm text-red-600 hover:text-red-800"
                  >
                    Remove image
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={10}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                placeholder="Write your blog content here..."
                required
              />            </div>
            <div className="flex gap-4">
              <Button
                type="submit"
                variant="success"
              >
                {editingBlog ? 'Update Blog' : 'Create Blog'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Blogs List */}
      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {blogs.map((blog) => (
                <tr key={blog._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{blog.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {blog.content.substring(0, 100)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {blog.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(blog.date).toLocaleDateString()}
                  </td>                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => window.open(`/blog/${blog._id}`, '_blank')}
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="View"
                      >
                        <FiEye />
                      </Button>
                      <Button
                        onClick={() => handleEdit(blog)}
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:text-green-900 p-1"
                        title="Edit"
                      >
                        <FiEdit />
                      </Button>
                      <Button
                        onClick={() => handleDelete(blog._id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Delete"
                      >
                        <FiTrash2 />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {blogs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No blog posts found. Create your first blog post!
          </div>
        )}
      </div>
    </div>
  );
}
