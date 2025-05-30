'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import { blogAPI } from '../../utils/api';

interface Blog {
  _id: string;
  title: string;
  summary: string;
  content: string;
  image: string;
  author: string;
  date: string;
}

export default function BlogPreview() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await blogAPI.getAll();
        // Get last 3 blog posts
        setBlogs(data.slice(0, 3));
      } catch (error) {
        console.error('Error fetching blogs:', error);
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
  // Image URL helper
  const getImageSrc = (blog: Blog) => {
    if (blog.image.startsWith('http')) return blog.image;
    if (blog.image.startsWith('/')) return blog.image;
    return `/blog/${blog.image}`;
  };

  return (
    <section className="py-16 bg-white" style={{ fontFamily: 'var(--font-inter)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Başlık */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Cardiolive ile Sağlıklı Yaşamın Sırları
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Zeytinyağı kültürü, sağlıklı yaşam ve sürdürülebilir tarım hakkında bilgi edinmek için blog yazılarımızı keşfedin.
          </p>
        </div>        {/* Blog Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            // Loading skeleton
            [...Array(3)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm">
                <div className="relative aspect-[16/9] bg-gray-200 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))
          ) : blogs.length > 0 ? (
            blogs.map((blog) => (
              <Link 
                key={blog._id} 
                href={`/blog/${blog._id}`}
                className="group"
              >
                <article className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {/* Görsel */}
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={getImageSrc(blog)}
                      alt={blog.title}
                      fill
                      className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* İçerik */}
                  <div className="p-6">
                    {/* Tarih */}
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(blog.date)}
                    </div>

                    {/* Başlık */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-[#70BB1B] transition-colors line-clamp-2">
                      {blog.title}
                    </h3>

                    {/* Özet */}
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {blog.summary}
                    </p>

                    {/* Devamını Oku */}
                    <div className="flex items-center text-[#70BB1B] font-medium group-hover:underline">
                      Devamını Oku
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </article>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              Henüz blog yazısı bulunmamaktadır.
            </div>
          )}
        </div>

        {/* Tüm Yazılar Butonu */}
        <div className="text-center mt-12">
          <Link 
            href="/blog"
            className="inline-flex items-center justify-center bg-white text-[#70BB1B] border-2 border-[#70BB1B] px-8 py-3 rounded-full hover:bg-[#70BB1B] hover:text-white transition-colors font-medium"
          >
            Tüm Blog Yazıları
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
} 