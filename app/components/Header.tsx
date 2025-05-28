'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search, ShoppingCart } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white z-50 shadow-sm" style={{ fontFamily: 'var(--font-inter)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-[#70BB1B]">
            ZeytinYağı
          </Link>

          {/* Masaüstü Menü */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-[#70BB1B] transition-colors">
              Ana Sayfa
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-[#70BB1B] transition-colors">
              Mağaza
            </Link>
            <Link href="/blog" className="text-gray-700 hover:text-[#70BB1B] transition-colors">
              Blog
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-[#70BB1B] transition-colors">
              Hakkımızda
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-[#70BB1B] transition-colors">
              İletişim
            </Link>
          </nav>

          {/* Mobil Menü Butonu */}
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg 
              className="h-6 w-6 text-gray-700" 
              fill="none" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Sağ: Hesap ve Sepet */}
          <div className="flex items-center space-x-6">
            <Link href="/account" className="flex items-center space-x-1 text-gray-700 hover:text-[#70BB1B] transition-colors">
              <span>Hesabım</span>
            </Link>
            <button aria-label="Search" className="text-gray-700 hover:text-[#70BB1B] transition-colors">
              <Search size={24} />
            </button>
            <button aria-label="Cart" className="text-gray-700 hover:text-[#70BB1B] transition-colors">
              <ShoppingCart size={24} />
            </button>
          </div>
        </div>

        {/* Mobil Menü */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link 
                href="/" 
                className="block px-3 py-2 text-gray-700 hover:text-[#70BB1B] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Ana Sayfa
              </Link>
              <Link 
                href="/shop" 
                className="block px-3 py-2 text-gray-700 hover:text-[#70BB1B] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Mağaza
              </Link>
              <Link 
                href="/blog" 
                className="block px-3 py-2 text-gray-700 hover:text-[#70BB1B] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>
              <Link 
                href="/about" 
                className="block px-3 py-2 text-gray-700 hover:text-[#70BB1B] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Hakkımızda
              </Link>
              <Link 
                href="/contact" 
                className="block px-3 py-2 text-gray-700 hover:text-[#70BB1B] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                İletişim
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}