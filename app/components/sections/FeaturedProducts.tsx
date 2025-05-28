'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';

const featuredProducts = [
  {
    id: 1,
    name: 'Zeytin Sofrası',
    price: '1.100,00',
    image: '/products/zeytin-sofrasi.jpg',
    badges: ['Hızlı Gönderi', 'Aynı Gün Kargo'],
    slug: 'zeytin-sofrasi'
  },
  {
    id: 2,
    name: 'Karma Yeşil Zeytin',
    price: '250,00',
    image: '/products/karma-yesil-zeytin.jpg',
    badges: ['Aynı Gün Kargo'],
    slug: 'karma-yesil-zeytin'
  },
  {
    id: 3,
    name: 'Kırma Biber Dolgulu Yeşil Zeytin',
    price: '200,00',
    image: '/products/biber-dolgulu-yesil-zeytin.jpg',
    badges: ['Aynı Gün Kargo'],
    slug: 'biber-dolgulu-yesil-zeytin'
  },
  {
    id: 4,
    name: 'Erken Hasat Soğuk Sıkım Domat Premium Zeytinyağı 1Lt',
    price: '1.320,00',
    image: '/products/erken-hasat-premium.jpg',
    badges: ['Aynı Gün Kargo', 'Kampanyalı Ürün'],
    slug: 'erken-hasat-premium'
  }
];

export default function FeaturedProducts() {
  return (
    <section className="py-16 bg-white" style={{ fontFamily: 'var(--font-inter)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Kategori Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Link href="/zeytinyagi" className="group relative aspect-[4/3] overflow-hidden rounded-lg">
            <Image
              src="/products/category-zeytinyagi.jpg"
              alt="Cardiolive Zeytin ve Zeytinyağları"
              fill
              className="object-cover transform group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-white text-xl font-bold mb-2">Cardiolive Zeytin ve Zeytinyağları</h3>
                <button className="bg-white text-gray-900 px-6 py-2 rounded-full text-sm font-medium group-hover:bg-[#70BB1B] group-hover:text-white transition-colors">
                  Şimdi Keşfet!
                </button>
              </div>
            </div>
          </Link>

          <Link href="/zeytinyaglari" className="group relative aspect-[4/3] overflow-hidden rounded-lg">
            <Image
              src="/products/category-zeytinyaglari.jpg"
              alt="Zeytinyağları"
              fill
              className="object-cover transform group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-white text-xl font-bold mb-2">Zeytinyağları</h3>
                <button className="bg-white text-gray-900 px-6 py-2 rounded-full text-sm font-medium group-hover:bg-[#70BB1B] group-hover:text-white transition-colors">
                  Şimdi Keşfet!
                </button>
              </div>
            </div>
          </Link>

          <Link href="/zeytinler" className="group relative aspect-[4/3] overflow-hidden rounded-lg">
            <Image
              src="/products/category-zeytinler.jpg"
              alt="Zeytinler"
              fill
              className="object-cover transform group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-white text-xl font-bold mb-2">Zeytinler</h3>
                <button className="bg-white text-gray-900 px-6 py-2 rounded-full text-sm font-medium group-hover:bg-[#70BB1B] group-hover:text-white transition-colors">
                  Şimdi Keşfet!
                </button>
              </div>
            </div>
          </Link>
        </div>

        {/* Popüler Ürünler Başlığı */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            POPÜLER ÜRÜNLER
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-sm leading-relaxed">
            Popüler ürünlerimiz, Cardiolive'ın doğallık ve kaliteyi bir araya getiren zeytin, zeytinyağı ve zeytinyağı bazlı sabunlarından oluşmaktadır. El işçiliği ile özenle toplanan zeytinlerimiz ve soğuk sıkım zeytinyağlarımız, besin değerlerini ve lezzetlerini koruyarak sofralarınıza geliyor.
          </p>
        </div>

        {/* Ürün Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <div key={product.id} className="group relative">
              {/* Favori Butonu */}
              <button className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors">
                <Heart className="w-5 h-5 text-gray-600" />
              </button>

              {/* Ürün Kartı */}
              <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Ürün Görseli */}
                <Link href={`/products/${product.slug}`}>
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>

                {/* Badge'ler */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  {product.badges.map((badge, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        badge === 'Kampanyalı Ürün'
                          ? 'bg-red-500 text-white'
                          : 'bg-[#FF6B35] text-white'
                      }`}
                    >
                      {badge}
                    </span>
                  ))}
                </div>

                {/* Ürün Bilgileri */}
                <div className="p-4">
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 min-h-[40px]">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex flex-col gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      {product.price} TL
                    </span>
                    <button className="w-full bg-gray-100 text-gray-900 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">
                      SEPETE EKLE
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 