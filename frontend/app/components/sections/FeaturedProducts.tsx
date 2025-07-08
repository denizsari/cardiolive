'use client';

import { useState, useEffect } from 'react';
import { ProductImage } from '../ui/OptimizedImage';
import Link from 'next/link';
import { productAPI } from '../../utils/api';
import Button from '../ui/Button';
import { Product } from '../../types';

// Statik kategori kartları - bunlar sabit kalacak
const categories = [
  {
    href: "/products?category=zeytinyagi",
    image: "/products/olive-oil-category.jpg",
    title: "Kardiyolive Zeytin ve Zeytinyağları",
    alt: "Kardiyolive Zeytin ve Zeytinyağları"
  },
  {
    href: "/products?category=zeytinyaglari",
    image: "/products/olive-oils-category.jpg", 
    title: "Zeytinyağları",
    alt: "Zeytinyağları"
  },
  {
    href: "/products?category=zeytinler",
    image: "/products/olives-category.jpg",
    title: "Zeytinler", 
    alt: "Zeytinler"
  }
];

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        console.log('Fetching featured products...');
        console.log('API URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
        const data = await productAPI.getAll();
        console.log('Products fetched successfully:', data);
        // Get first 4 products as featured (since we don't have a featured flag)
        setProducts(data.slice(0, 4));
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);
  // Image URL helper
  const getImageSrc = (product: Product) => {
    if (product.images && product.images.length > 0) {
      const image = product.images[0];
      if (image.startsWith('http')) return image;
      return `/products/${image}`;
    }
    return '/products/placeholder.jpg';
  };
  return (
    <section data-section="products" className="py-8 sm:py-12 md:py-16 bg-white" style={{ fontFamily: 'var(--font-inter)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">        {/* Kategori Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 md:mb-16">
          {categories.map((category, index) => (
            <Link key={index} href={category.href} className="group relative aspect-[4/3] overflow-hidden rounded-xl md:rounded-2xl shadow-lg md:shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 md:hover:-translate-y-2">
              <ProductImage
                src={category.image}
                alt={category.alt}
                className="object-cover transform group-hover:scale-110 transition-transform duration-700 w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-primary/80 transition-all duration-500">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3 sm:p-4 md:p-6">
                  <h3 className="text-white text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 md:mb-6 drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-300">{category.title}</h3>
                  <div className="transform group-hover:scale-110 transition-transform duration-300">
                    <Button 
                      variant="secondary"
                      size="sm"
                      className="bg-white text-primary px-4 sm:px-6 md:px-10 py-2 sm:py-3 md:py-4 rounded-full text-sm sm:text-base md:text-lg font-bold hover:bg-primary hover:text-white transition-all duration-300 border-0 shadow-2xl"
                    >
                      Şimdi Keşfet!
                    </Button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>        {/* Popüler Ürünler Başlığı */}
        <div className="text-center mb-8 md:mb-16 page-content">
          <div className="inline-flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <div className="w-8 md:w-12 h-0.5 bg-gradient-to-r from-transparent to-primary"></div>
            <span className="text-primary font-semibold text-sm md:text-lg tracking-wider">POPÜLER</span>
            <div className="w-8 md:w-12 h-0.5 bg-gradient-to-l from-transparent to-primary"></div>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-800 mb-4 md:mb-6 px-4">
            Öne Çıkan Ürünlerimiz
          </h2>
          <div className="max-w-4xl mx-auto px-4">
            <p className="text-neutral-600 text-sm sm:text-base md:text-lg leading-relaxed">
              Popüler ürünlerimiz, Kardiyolive doğallık ve kaliteyi bir araya getiren zeytin, zeytinyağı ve zeytinyağı bazlı sabunlarından oluşmaktadır. El işçiliği ile özenle toplanan zeytinlerimiz ve soğuk sıkım zeytinyağlarımız, besin değerlerini ve lezzetlerini koruyarak sofralarınıza geliyor.
            </p>
          </div>
        </div>        {/* Ürün Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {loading ? (
            // Loading skeleton
            [...Array(4)].map((_, index) => (
              <div key={index} className="group relative">
                <div className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-lg">
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
                  <div className="p-3 sm:p-4 md:p-6">
                    <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse mb-2 sm:mb-3"></div>
                    <div className="h-4 sm:h-5 md:h-6 bg-gray-200 rounded animate-pulse mb-2 sm:mb-3"></div>
                    <div className="h-8 sm:h-9 md:h-10 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))
          ) : products.length > 0 ? (            products.map((product) => (
              <div key={product._id} className="group relative transform hover:-translate-y-1 md:hover:-translate-y-2 transition-transform duration-300">
                {/* Ürün Kartı */}
                <div className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100">
                  {/* Ürün Görseli */}
                  <Link href={`/products/${product._id}`}>
                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                      <ProductImage
                        src={getImageSrc(product)}
                        alt={product.name}
                        className="object-cover transform group-hover:scale-110 transition-transform duration-500 w-full h-full"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                    </div>
                  </Link>

                  {/* Ürün Bilgileri */}
                  <div className="p-3 sm:p-4 md:p-6">
                    <Link href={`/products/${product._id}`}>
                      <h3 className="text-sm sm:text-base md:text-lg font-semibold text-neutral-800 mb-2 sm:mb-3 line-clamp-2 min-h-[40px] sm:min-h-[48px] md:min-h-[56px] hover:text-primary transition-colors duration-300">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex flex-col gap-2 sm:gap-3 md:gap-4">
                      <span className="text-lg sm:text-xl md:text-2xl font-bold text-primary">
                        {product.price.toLocaleString('tr-TR')} TL
                      </span>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="w-full bg-gradient-to-r from-primary to-primary-hover text-white py-2 sm:py-2.5 md:py-3 rounded-full text-xs sm:text-sm font-bold hover:from-primary-hover hover:to-primary-dark transition-all duration-300 border-0 shadow-lg transform hover:scale-105"
                      >
                        SEPETE EKLE
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12">
                <div className="text-6xl mb-4">🫒</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Henüz Ürün Bulunamadı</h3>
                <p className="text-gray-500">Yakında harika ürünlerimizle burada olacağız!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
} 