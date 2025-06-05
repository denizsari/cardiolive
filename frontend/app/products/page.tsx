'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ProductImage } from '../components/ui/OptimizedImage';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, Eye } from 'lucide-react';
import { productAPI } from '../utils/api';
import { Product } from '../types';
import Button from '../components/ui/Button';

export const dynamic = 'force-dynamic';

// Helper function to validate image URL
const isValidImageUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  
  try {
    new URL(url);
    // Additional check for relative paths that are valid
    return url.startsWith('http') || url.startsWith('/');  } catch {
    return false;
  }
};

// Function to get valid image URL or fallback
const getImageSrc = (images?: string[]): string => {
  if (!images || images.length === 0) return '/products/default.jpg';
  
  const validImage = images.find(img => isValidImageUrl(img));
  return validImage || '/products/default.jpg';
};

function ProductsContent() {
  const { addItem } = useCart();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Hepsi');
  const [categories, setCategories] = useState<string[]>(['Hepsi']);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const searchQuery = searchParams.get('search') || '';
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await productAPI.getAll();
        
        // Filter products by search if needed
        let filteredData = data;
        if (searchQuery) {
          filteredData = data.filter(product => 
            product.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        setProducts(filteredData);
        // Build categories dynamically
        const cats: string[] = Array.from(
          new Set(
            filteredData.map((p: Product) => p.category).filter((c: string): c is string => Boolean(c))
          )
        );
        setCategories(['Hepsi', ...cats]);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError(String(err));
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchQuery]);
  
  const filteredProducts = selectedCategory === 'Hepsi'
    ? products
    : products.filter((product: Product) => product.category === selectedCategory);
  const handleAddToCart = (product: Product) => {
    addItem({
      _id: product._id,
      name: product.name,
      price: Number(product.price),
      image: getImageSrc(product.images)
    });
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-inter)' }}>
      <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {searchQuery ? `"${searchQuery}" için arama sonuçları` : 'Tüm Ürünler'}
          </h1>
          {searchQuery && (
            <p className="text-gray-600">
              {products.length} ürün bulundu
            </p>
          )}
        </div>        {/* Kategori Filtreleme */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                <div className="w-full h-64 bg-gray-300"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
                  <div className="h-10 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <div className="bg-red-50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <div className="text-red-400 text-4xl">⚠️</div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ürünler Yüklenemedi
            </h3>
            <p className="text-gray-600 mb-6">
              {error}
            </p>
            <Button 
              onClick={() => window.location.reload()}
              variant="primary"
              size="md"
            >
              Tekrar Dene
            </Button>
          </div>        )}
        
        {/* Empty Results State */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-gray-50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <div className="text-gray-400 text-4xl">🔍</div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {searchQuery ? 'Arama sonucu bulunamadı' : 'Bu kategoride ürün bulunamadı'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchQuery 
                ? `"${searchQuery}" aramanız için ürün bulunamadı. Farklı bir arama terimi deneyin.`
                : `${selectedCategory} kategorisinde henüz ürün bulunmamaktadır.`
              }
            </p>
            <div className="space-y-4">
              <Button 
                onClick={() => {
                  setSelectedCategory('Hepsi');
                  if (searchQuery) {
                    window.location.href = '/products';
                  }
                }}
                variant="primary"
                size="md"
              >
                {searchQuery ? 'Tüm Ürünleri Görüntüle' : 'Tüm Kategorileri Görüntüle'}
              </Button>
              <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
                <span>✨ Yeni ürünler ekleniyor</span>
                <span>🔔 Bildirim almak için bizi takip edin</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Ürün Listesi */}
        {!loading && !error && filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">          {filteredProducts.map(product => (
            <div key={product._id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group">              <div className="relative aspect-square overflow-hidden">
                <ProductImage
                  src={getImageSrc(product.images)}
                  alt={product.name}
                  className="w-full h-full transform group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <Link
                      href={`/products/${product._id}`}
                      className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                    >
                      <Eye size={20} className="text-gray-700" />
                    </Link>                    <Button
                      variant="primary"
                      onClick={() => handleAddToCart(product)}
                      className="bg-[#70BB1B] p-2 rounded-full shadow-lg hover:bg-[#5ea516] transition-colors"
                    >
                      <ShoppingCart size={20} className="text-white" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-4">                <h3 className="text-lg font-bold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-[#70BB1B] font-bold text-xl mb-3">{product.price} TL</p>
                <Button
                  onClick={() => handleAddToCart(product)}
                  className="w-full"
                  size="md"
                >
                  <ShoppingCart size={18} className="mr-2" />
                  Sepete Ekle
                </Button>
              </div>
            </div>
          ))}        </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

// Main component with Suspense wrapper
export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}