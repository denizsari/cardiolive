'use client';

import KardiyoliveGallery from '../components/KardiyoliveGallery';
import { ProductImage } from '../components/ui/OptimizedImage';

export default function GalleryPage() {
  const featuredProducts = [
    {
      name: 'Doğal Salamura Gemlik Yağlı Zeytin',
      image: '/images/products/doğal salamura gemlik yağlı zeytin.png',
      category: 'Gemlik Zeytin'
    },
    {
      name: 'Kalamata Siyah Zeytin',
      image: '/images/products/kalamata siyah zeytin.png',
      category: 'Kalamata Zeytin'
    },
    {
      name: 'Kardiyolive Premium Zeytinyağı 5L',
      image: '/images/mockups/olive mockup 5LT.png',
      category: 'Zeytinyağı'
    },
    {
      name: 'Doğal Pekmez',
      image: '/images/products/pekmez.png',
      category: 'Pekmez'
    },
    {
      name: 'Premium Karışık Turşu',
      image: '/images/products/TURŞU 2.png',
      category: 'Turşu'
    },
    {
      name: 'Özel Karışım Pul Biber',
      image: '/images/products/pulbiber.png',
      category: 'Baharat'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Kardiyolive Galeri
          </h1>          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Doğal ve organik ürünlerimizin üretim sürecinden final hallerine kadar 
            tüm aşamaları keşfedin. Kaliteli fotoğraflarımızla Kardiyolive&apos;ın hikayesini görün.
          </p>
        </div>

        {/* Featured Products Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Öne Çıkan Ürünler
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <ProductImage
                  src={product.image}
                  alt={product.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full mb-2">
                    {product.category}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {product.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Production Gallery Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Üretim ve İşleme Galeri
          </h2>
          <KardiyoliveGallery showFilter={true} />
        </section>

        {/* Catalog Downloads */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Kataloglarımız
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="bg-red-100 rounded-lg p-6 mb-4">
                <svg className="w-16 h-16 text-red-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Kardiyolive Katalog TR
                </h3>
                <p className="text-gray-600 mb-4">
                  Türkçe ürün katalogu - Tüm ürün serimizi inceleyin
                </p>
                <a 
                  href="/images/catalogs/Kardiyolive Katalog TR.pdf" 
                  download
                  className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition duration-200"
                >
                  PDF İndir
                </a>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-lg p-6 mb-4">
                <svg className="w-16 h-16 text-blue-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2-2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Kardiyolive Katalog 2
                </h3>
                <p className="text-gray-600 mb-4">
                  Detaylı ürün bilgileri ve fiyat listesi
                </p>
                <a 
                  href="/images/catalogs/kardiyolive 2.pdf" 
                  download
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition duration-200"
                >
                  PDF İndir
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">22+</div>
            <div className="text-gray-600">Farklı Ürün</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">11</div>
            <div className="text-gray-600">Kategori</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">40+</div>
            <div className="text-gray-600">Profesyonel Fotoğraf</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
            <div className="text-gray-600">Doğal Ürünler</div>
          </div>
        </section>
      </div>
    </div>
  );
}
