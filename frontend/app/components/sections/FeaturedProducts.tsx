'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { productAPI } from '../../utils/api';
import { Product } from '../../types';

// Statik kategori kartları - bunlar sabit kalacak
const categories = [
  {
    href: "/products?category=zeytinyagi",
    image: "/products/category-zeytinyagi.jpg",
    title: "Cardiolive Zeytin ve Zeytinyağları",
    alt: "Cardiolive Zeytin ve Zeytinyağları"
  },
  {
    href: "/products?category=zeytinyaglari",
    image: "/products/category-zeytinyaglari.jpg", 
    title: "Zeytinyağları",
    alt: "Zeytinyağları"
  },
  {
    href: "/products?category=zeytinler",
    image: "/products/category-zeytinler.jpg",
    title: "Zeytinler", 
    alt: "Zeytinler"
  }
];

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const data = await productAPI.getAll();
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
    <section className="py-16 bg-white" style={{ fontFamily: 'var(--font-inter)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">        {/* Kategori Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {categories.map((category, index) => (
            <Link key={index} href={category.href} className="group relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image
                src={category.image}
                alt={category.alt}
                fill
                className="object-cover transform group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-white text-xl font-bold mb-2">{category.title}</h3>
                  <button className="bg-white text-gray-900 px-6 py-2 rounded-full text-sm font-medium group-hover:bg-[#70BB1B] group-hover:text-white transition-colors">
                    Şimdi Keşfet!
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Popüler Ürünler Başlığı */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            POPÜLER ÜRÜNLER
          </h2>          <p className="text-gray-600 max-w-3xl mx-auto text-sm leading-relaxed">
            Popüler ürünlerimiz, Cardiolive doğallık ve kaliteyi bir araya getiren zeytin, zeytinyağı ve zeytinyağı bazlı sabunlarından oluşmaktadır. El işçiliği ile özenle toplanan zeytinlerimiz ve soğuk sıkım zeytinyağlarımız, besin değerlerini ve lezzetlerini koruyarak sofralarınıza geliyor.
          </p>
        </div>        {/* Ürün Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            // Loading skeleton
            [...Array(4)].map((_, index) => (
              <div key={index} className="group relative">
                <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                  <div className="relative aspect-[4/3] bg-gray-200 animate-pulse"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))
          ) : products.length > 0 ? (
            products.map((product) => (
              <div key={product._id} className="group relative">
                {/* Favori Butonu */}
                <button className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors">
                  <Heart className="w-5 h-5 text-gray-600" />
                </button>

                {/* Ürün Kartı */}                <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {/* Ürün Görseli */}
                  <Link href={`/products/${product._id}`}>
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={getImageSrc(product)}
                        alt={product.name}
                        fill
                        className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>

                  {/* Ürün Bilgileri */}
                  <div className="p-4">
                    <Link href={`/products/${product._id}`}>
                      <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 min-h-[40px]">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex flex-col gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        {product.price.toLocaleString('tr-TR')} TL
                      </span>
                      <button className="w-full bg-gray-100 text-gray-900 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">
                        SEPETE EKLE
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              Henüz öne çıkan ürün bulunmamaktadır.
            </div>
          )}
        </div>
      </div>
    </section>
  );
} 