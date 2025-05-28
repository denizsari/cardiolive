'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '../../components/Header';

interface Blog {
  _id: string;
  title: string;
  summary: string;
  content: string;
  image: string;
  author: string;
  date: string;
}

export default function BlogDetail() {
  const { id } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/blogs/${id}`);
        
        if (!response.ok) {
          throw new Error('Blog bulunamadı');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setBlog(data.blog);
        } else {
          throw new Error(data.message || 'Blog yüklenemedi');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

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
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Blog yükleniyor...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-inter)' }}>
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog Bulunamadı</h1>
            <p className="text-gray-600 mb-8">{error || 'İstediğiniz blog yazısı bulunamadı.'}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-inter)' }}>
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <article>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {blog.title}
          </h1>

          <div className="flex items-center text-sm text-gray-500 mb-8">
            <span className="mr-4">Yazar: {blog.author}</span>
            <span>{formatDate(blog.date)}</span>
          </div>

          <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-8">
            <img
              src={blog.image}
              alt={blog.title}
              className="object-cover w-full h-full"
            />
          </div>

          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <p className="text-lg text-gray-700 italic">{blog.summary}</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div 
              className="text-gray-700 leading-relaxed whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>
        </article>
      </main>
    </div>
  );
}