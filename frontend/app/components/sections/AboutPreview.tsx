'use client';

import { ProductImage } from '../ui/OptimizedImage';
import Link from 'next/link';

export default function AboutPreview() {
  return (
    <section data-section="about" className="relative bg-white py-8 sm:py-12 md:py-16" style={{ fontFamily: 'var(--font-inter)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
          {/* Sol: Görsel */}          <div className="relative aspect-[4/3] rounded-lg overflow-hidden order-2 lg:order-1">
            <ProductImage
              src="/about/olive-tree.jpg"
              alt="Kardiyolive Zeytin Ağaçları"
              className="object-cover w-full h-full"
            />
          </div>

          {/* Sağ: İçerik */}
          <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-800">
              Kardiyolive ile Saf Zeytinin Hikayesi
            </h2>            <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
              Kardiyolive&apos;ın hikayesi, doğanın ve geleneklerimizin kalbiyle başladığı. Doğanın bize sunduğu nimetleri özüyle, zeytinin asırlık bilgeliğiyle harmanlıyoruz. Her bir ürünümüz, el emeğiyle özenle işleniyor ve modern teknolojilerle buluşuyor. Sağlıklı yaşamın temelini oluşturan zeytinyağlarımız, sizlere doğanın en saf halini sunuyor. Şeffaflık, hijyen ve kalite bizim de değişmez ilkelerimiz. Her şey, saf ve doğal bir yaşam için...
            </p>
            <Link 
              href="/about"
              className="inline-block bg-primary text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full hover:bg-primary-hover transition-colors text-sm sm:text-base"
            >
              Devamını Oku
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
} 