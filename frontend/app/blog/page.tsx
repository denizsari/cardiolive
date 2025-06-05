'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProductImage } from '../components/ui/OptimizedImage';
import Header from '../components/Header';
import { blogAPI } from '../utils/api';

interface Blog {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  image?: string; // Make image optional to handle null/undefined cases
  date: string;
}

export default function BlogList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get image source with fallback
  const getImageSrc = (blog: Blog): string => {
    if (!blog.image || blog.image.trim() === '') {
      return '/blog/default-blog.jpg'; // Use dedicated default blog image
    }
    
    // If it's already an absolute URL, return as is
    if (blog.image.startsWith('http://') || blog.image.startsWith('https://')) {
      return blog.image;
    }
    
    // If it starts with '/', return as is
    if (blog.image.startsWith('/')) {
      return blog.image;
    }
    
    // Otherwise, prepend with /blog/
    return `/blog/${blog.image}`;
  };  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const data = await blogAPI.getAll();
        setBlogs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);
  const formatDate = (blog: Blog) => {
    // Try different date fields in priority order
    const dateValue = blog.publishedAt || blog.createdAt || blog.date;
    
    if (!dateValue) {
      return 'Tarih belirtilmemiş';
    }
    
    const date = new Date(dateValue);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Tarih belirtilmemiş';
    }
    
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-inter)' }}>
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Bloglar yükleniyor...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-inter)' }}>
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-red-600">Hata: {error}</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-inter)' }}>
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Blog</h1>

        {blogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Henüz blog yazısı bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map(blog => (              <div key={blog._id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <Link href={`/blog/${blog._id}`}>                  <div className="relative aspect-[16/9] overflow-hidden">                    <ProductImage
                      src={getImageSrc(blog)}
                      alt={blog.title || 'Blog görseli'}
                      className="object-cover transform group-hover:scale-105 transition-transform duration-300 w-full h-full"
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{blog.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{blog.excerpt}</p>                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Cardiolive</span>
                    <span>{formatDate(blog)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}