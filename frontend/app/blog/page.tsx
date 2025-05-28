'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';

interface Blog {
  _id: string;
  title: string;
  summary: string;
  content: string;
  image: string;
  author: string;
  date: string;
}

export default function BlogList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/blogs`);
        
        if (!response.ok) {
          throw new Error('Bloglar yüklenemedi');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setBlogs(data.blogs);
        } else {
          throw new Error(data.message || 'Bloglar yüklenemedi');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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
            {blogs.map(blog => (
              <div key={blog._id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <Link href={`/blog/${blog._id}`}>
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{blog.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{blog.summary}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{blog.author}</span>
                    <span>{formatDate(blog.date)}</span>
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