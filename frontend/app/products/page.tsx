'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, Eye } from 'lucide-react';

interface Product {
  _id?: string;
  id?: string | number;
  name: string;
  price: number | string;
  images?: string[];
  category?: string;
  badges?: string[];
  [key: string]: any;
}

export default function ProductList() {
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Hepsi');
  const [categories, setCategories] = useState<string[]>(['Hepsi']);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products`);
        if (!res.ok) throw new Error('Ürünler alınamadı');
        const data = await res.json();
        setProducts(data.products || []);
        // Kategorileri dinamik olarak oluştur
        const cats: string[] = Array.from(
          new Set(
            (data.products || []).map((p: Product) => p.category).filter((c: string): c is string => Boolean(c))
          )
        );
        setCategories(['Hepsi', ...cats]);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message as string);
        else setError(String(err));
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);
  const filteredProducts = selectedCategory === 'Hepsi'
    ? products
    : products.filter((product: Product) => product.category === selectedCategory);

  const handleAddToCart = (product: Product) => {
    addItem({
      _id: product._id || String(product.id),
      name: product.name,
      price: Number(product.price),
      image: product.images?.[0] || '/products/default.jpg'
    });
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-inter)' }}>
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Tüm Ürünler</h1>

        {/* Kategori Filtreleme */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-full border-2 ${selectedCategory === cat ? 'border-[#70BB1B] text-[#70BB1B]' : 'border-gray-300 text-gray-600 hover:border-[#70BB1B] hover:text-[#70BB1B]'}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Yükleniyor/Hata */}
        {loading && <div>Yükleniyor...</div>}
        {error && <div className="text-red-500">{error}</div>}        {/* Ürün Listesi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div key={product._id || product.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={product.images?.[0] || '/products/default.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <Link
                      href={`/products/${product._id || product.id}`}
                      className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                    >
                      <Eye size={20} className="text-gray-700" />
                    </Link>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="bg-[#70BB1B] p-2 rounded-full shadow-lg hover:bg-[#5ea516] transition-colors"
                    >
                      <ShoppingCart size={20} className="text-white" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-[#70BB1B] font-bold text-xl mb-3">{product.price} TL</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {product.badges && product.badges.map((badge, index) => (
                    <span key={index} className="bg-[#FF6B35] text-white px-2 py-1 rounded-full text-xs font-medium">
                      {badge}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-[#70BB1B] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#5ea516] transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={18} />
                  Sepete Ekle
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
} 