'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';

const blogPosts = [
  {
    id: 1,
    title: 'Zeytinyağının Faydaları ve Cardiolive\'ın Kalite Standartları',
    excerpt: 'Soğuk sıkım zeytinyağının sağlığa faydaları ve Cardiolive olarak kalite standartlarımız hakkında detaylı bilgi...',
    image: '/blog/zeytinyagi-faydalari.jpg',
    date: '15 Mayıs 2024',
    slug: 'zeytinyagi-faydalari-kalite-standartlari'
  },
  {
    id: 2,
    title: 'Zeytinyağı İnsan Sağlığına Olan 5 Önemli Faydası',
    excerpt: 'Zeytinyağının kalp sağlığından cilt bakımına kadar birçok alanda insan sağlığına olan etkileri...',
    image: '/blog/saglikli-yasam.jpg',
    date: '12 Mayıs 2024',
    slug: 'zeytinyagi-saglik-faydalari'
  },
  {
    id: 3,
    title: 'Cardiolive\'ın Sürdürülebilir Tarım Politikası',
    excerpt: 'Doğaya saygılı üretim yöntemlerimiz ve sürdürülebilir tarım uygulamalarımız hakkında bilgi...',
    image: '/blog/surdurulebilir-tarim.jpg',
    date: '10 Mayıs 2024',
    slug: 'surdurulebilir-tarim-politikasi'
  }
];

export default function BlogPreview() {
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
        </div>

        {/* Blog Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Link 
              key={post.id} 
              href={`/blog/${post.slug}`}
              className="group"
            >
              <article className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Görsel */}
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* İçerik */}
                <div className="p-6">
                  {/* Tarih */}
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar className="w-4 h-4 mr-2" />
                    {post.date}
                  </div>

                  {/* Başlık */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-[#70BB1B] transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  {/* Özet */}
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>

                  {/* Devamını Oku */}
                  <div className="flex items-center text-[#70BB1B] font-medium group-hover:underline">
                    Devamını Oku
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </article>
            </Link>
          ))}
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