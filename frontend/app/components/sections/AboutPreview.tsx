'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function AboutPreview() {
  return (
    <section className="relative bg-white py-16" style={{ fontFamily: 'var(--font-inter)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Sol: Görsel */}
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
            <Image
              src="/about/olive-tree.jpg"
              alt="Cardiolive Zeytin Ağaçları"
              fill
              className="object-cover"
            />
          </div>

          {/* Sağ: İçerik */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Cardiolive ile Saf Zeytinin Hikayesi
            </h2>            <p className="text-gray-600 leading-relaxed">
              Cardiolive&apos;ın hikayesi, doğanın ve geleneklerimizin kalbiyle başladığı. Doğanın bize sunduğu nimetleri özüyle, zeytinin asırlık bilgeliğiyle harmanlıyoruz. Her bir ürünümüz, el emeğiyle özenle işleniyor ve modern teknolojilerle buluşuyor. Sağlıklı yaşamın temelini oluşturan zeytinyağlarımız, sizlere doğanın en saf halini sunuyor. Şeffaflık, hijyen ve kalite bizim de değişmez ilkelerimiz. Her şey, saf ve doğal bir yaşam için...
            </p>
            <Link 
              href="/about"
              className="inline-block bg-[#70BB1B] text-white px-8 py-3 rounded-full hover:bg-opacity-90 transition-colors"
            >
              Devamını Oku
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
} 