'use client';

import Link from 'next/link';
import Header from '../components/Header';

// Örnek blog verisi
const blogs = [
  {
    id: 1,
    title: 'Zeytinyağının Faydaları',
    excerpt: 'Zeytinyağının sağlığa olan faydaları ve günlük yaşamda kullanımı...',
    image: '/blog/blog1.jpg',
    date: '15 Mayıs 2024'
  },
  {
    id: 2,
    title: 'Organik Tarımın Önemi',
    excerpt: 'Organik tarımın çevre ve insan sağlığı üzerindeki etkileri...',
    image: '/blog/blog2.jpg',
    date: '10 Mayıs 2024'
  },
  {
    id: 3,
    title: 'Zeytinyağının Faydaları ve Kullanım Alanları',
    excerpt: 'Zeytinyağının sağlığa olan faydaları ve günlük yaşamda kullanımı hakkında detaylı bilgiler...',
    image: '/blog/blog3.jpg',
    date: '20 Mayıs 2024'
  },
  // Diğer bloglar...
];

export default function BlogList() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-inter)' }}>
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Blog</h1>

        {/* Blog Listesi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map(blog => (
            <div key={blog.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <Link href={`/blog/${blog.id}`}>
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
                <p className="text-sm text-gray-600 mb-4">{blog.excerpt}</p>
                <p className="text-xs text-gray-500">{blog.date}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
} 