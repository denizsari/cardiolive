'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ProductImage } from '../../components/ui/OptimizedImage';
import Header from '../../components/Header';

interface Blog {
  _id: string;
  title: string;
  summary?: string;
  excerpt?: string;
  content?: string;
  image?: string;
  date?: string;
  publishedAt?: string;
  createdAt?: string;
}

// Utility function to ensure all img tags have alt attributes
const sanitizeHtmlContent = (content: string | null | undefined): string => {
  if (!content) return '';
  
  return content
    .replace(/<img(?![^>]*alt\s*=)/gi, '<img alt="Blog içerik görseli"')
    .replace(/<img([^>]*)(?<!\/)\s*>/gi, '<img$1 />')
    .replace(/<img(?![^>]*loading\s*=)/gi, '<img loading="lazy"');
};

export default function BlogDetail() {
  const { id } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) return;
      
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_URL}/api/blogs/${id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data && result.data.blog) {
          setBlog(result.data.blog);
        } else {
          throw new Error('Blog not found in response');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);  const formatDate = (blog: Blog) => {
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

  const getSummary = (blog: Blog): string => {
    return blog.summary || blog.excerpt || '';
  };

  const getImageSrc = (blog: Blog): string => {
    if (!blog.image || blog.image.trim() === '') {
      return '/slider/image1.jpg';
    }
    
    if (blog.image.startsWith('http://') || blog.image.startsWith('https://')) {
      return blog.image;
    }
    
    if (blog.image.startsWith('/')) {
      return blog.image;
    }
    
    return `/blog/${blog.image}`;
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
          </h1>          <div className="flex items-center text-sm text-gray-500 mb-8">
            <span className="mr-4">Yazar: Cardiolive</span>
            <span>{formatDate(blog)}</span>
          </div><div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-8">
            <ProductImage
              src={getImageSrc(blog)}
              alt={blog.title}
              className="object-cover w-full h-full"
            />
          </div>

          {getSummary(blog) && (
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <p className="text-lg text-gray-700 italic">{getSummary(blog)}</p>
            </div>
          )}

          <div className="prose prose-lg max-w-none">
            {blog.content ? (
              <div 
                className="text-gray-700 leading-relaxed whitespace-pre-line"
                dangerouslySetInnerHTML={{ 
                  __html: sanitizeHtmlContent(blog.content)
                }}
              />
            ) : (
              <div className="text-gray-500 italic">
                Bu blog yazısının içeriği henüz mevcut değil.
              </div>
            )}
          </div>
        </article>
      </main>
    </div>
  );
}