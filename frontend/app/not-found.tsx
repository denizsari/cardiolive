'use client';

import Link from 'next/link';
import { Home, Search, ArrowLeft, Package } from 'lucide-react';
import Button from './components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* 404 Animation */}
        <div className="relative mb-8">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse">
            404
          </h1>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Package className="h-16 w-16 text-gray-400 animate-bounce" />
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Sayfa Bulunamadı
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Aradığınız sayfa silinmiş, taşınmış ya da hiç var olmamış olabilir.
          </p>          <p className="text-sm text-gray-500">
            URL&apos;i kontrol edin veya ana sayfadan devam edin.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Home className="h-5 w-5 mr-2" />
              Ana Sayfa
            </Link>
            
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Package className="h-5 w-5 mr-2" />
              Ürünler
            </Link>
          </div>

          <div className="flex justify-center">
            <Link
              href="/products"
              className="inline-flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Search className="h-4 w-4 mr-1" />
              Ürün Ara
            </Link>
          </div>
        </div>

        {/* Popular Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Popüler Sayfalar
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
              Hakkımızda
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
              İletişim
            </Link>            <Link href="/blog" className="text-gray-600 hover:text-blue-600 transition-colors">
              Blog
            </Link>
          </div>
        </div>        {/* Back Button */}
        <div className="mt-8">
          <Button
            onClick={() => window.history.back()}
            variant="ghost"
            size="sm"
            className="inline-flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Geri Dön
          </Button>
        </div>
      </div>
    </div>
  );
}
