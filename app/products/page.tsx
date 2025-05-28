'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../components/Header';

// Örnek ürün verisi
const products = [
  {
    id: 1,
    name: 'Naturel Sızma Zeytinyağı',
    price: '349.90',
    image: '/products/product1.jpg',
    category: 'Zeytinyağı',
    badges: ['Hızlı Gönderi', 'Aynı Gün Kargo']
  },
  {
    id: 2,
    name: 'Karma Yeşil Zeytin',
    price: '250.00',
    image: '/products/product2.jpg',
    category: 'Zeytin',
    badges: ['Aynı Gün Kargo']
  },
  {
    id: 3,
    name: 'Organik Zeytinyağı',
    price: '399.90',
    image: '/products/product3.jpg',
    category: 'Zeytinyağı',
    badges: ['Organik']
  },
  {
    id: 4,
    name: 'Siyah Zeytin',
    price: '180.00',
    image: '/products/product4.jpg',
    category: 'Zeytin',
    badges: ['Yeni Ürün']
  },
  {
    id: 5,
    name: 'Limonlu Zeytinyağı',
    price: '299.90',
    image: '/products/product5.jpg',
    category: 'Zeytinyağı',
    badges: ['Lezzetli']
  },
  {
    id: 6,
    name: 'Yeşil Zeytin',
    price: '220.00',
    image: '/products/product6.jpg',
    category: 'Zeytin',
    badges: ['Popüler']
  }
  // Daha fazla ürün eklenebilir...
];

export default function ProductList() {
  const [selectedCategory, setSelectedCategory] = useState('Hepsi');

  const filteredProducts = selectedCategory === 'Hepsi'
    ? products
    : products.filter(product => product.category === selectedCategory);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-inter)' }}>
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Tüm Ürünler</h1>

        {/* Kategori Filtreleme */}
        <div className="mb-8">
          <button
            className={`px-4 py-2 rounded-full border-2 ${selectedCategory === 'Hepsi' ? 'border-[#70BB1B] text-[#70BB1B]' : 'border-gray-300 text-gray-600 hover:border-[#70BB1B] hover:text-[#70BB1B]'}`}
            onClick={() => setSelectedCategory('Hepsi')}
          >
            Hepsi
          </button>
          <button
            className={`ml-4 px-4 py-2 rounded-full border-2 ${selectedCategory === 'Zeytinyağı' ? 'border-[#70BB1B] text-[#70BB1B]' : 'border-gray-300 text-gray-600 hover:border-[#70BB1B] hover:text-[#70BB1B]'}`}
            onClick={() => setSelectedCategory('Zeytinyağı')}
          >
            Zeytinyağı
          </button>
          <button
            className={`ml-4 px-4 py-2 rounded-full border-2 ${selectedCategory === 'Zeytin' ? 'border-[#70BB1B] text-[#70BB1B]' : 'border-gray-300 text-gray-600 hover:border-[#70BB1B] hover:text-[#70BB1B]'}`}
            onClick={() => setSelectedCategory('Zeytin')}
          >
            Zeytin
          </button>
        </div>

        {/* Ürün Listesi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <Link href={`/products/${product.id}`}>
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-[#70BB1B] font-bold">{product.price} TL</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {product.badges.map((badge, index) => (
                    <span key={index} className="bg-[#FF6B35] text-white px-2 py-1 rounded-full text-xs font-medium">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
} 