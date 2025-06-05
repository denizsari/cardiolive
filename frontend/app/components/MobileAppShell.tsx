'use client';

import { useState, useEffect } from 'react';
import { useIsMobile } from '../hooks/useMediaQuery';
import { Menu, X, Search, ShoppingCart, User, Home, Package, Heart } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '../contexts/CartContext';

interface MobileAppShellProps {
  children: React.ReactNode;
}

export function MobileAppShell({ children }: MobileAppShellProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useIsMobile();
  const { getTotalItems } = useCart();

  const totalItems = getTotalItems();

  useEffect(() => {
    // Prevent body scroll when menu is open
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  if (!isMobile) {
    return <>{children}</>;
  }

  const navigationItems = [
    { href: '/', icon: Home, label: 'Ana Sayfa' },
    { href: '/products', icon: Package, label: 'Ürünler' },
    { href: '/wishlist', icon: Heart, label: 'Favoriler' },
    { href: '/account', icon: User, label: 'Hesabım' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-40 safe-area-top">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Menu Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 -ml-2 touch-manipulation"
            aria-label="Menüyü aç"
          >
            <Menu className="w-6 h-6 text-slate-700" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex-1 flex justify-center">
            <span className="text-xl font-bold text-red-600">CardioLive</span>
          </Link>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 touch-manipulation"
              aria-label="Arama"
            >
              <Search className="w-5 h-5 text-slate-700" />
            </button>
            
            <Link
              href="/cart"
              className="p-2 touch-manipulation relative"
              aria-label="Sepet"
            >
              <ShoppingCart className="w-5 h-5 text-slate-700" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-14 pb-16">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center flex-1 py-2 touch-manipulation"
              >
                <Icon className="w-5 h-5 text-slate-600 mb-1" />
                <span className="text-xs text-slate-600">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Side Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">Menü</h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 -mr-2 touch-manipulation"
                aria-label="Menüyü kapat"
              >
                <X className="w-6 h-6 text-slate-700" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="py-4">
              <Link
                href="/categories"
                className="flex items-center px-4 py-3 text-slate-700 hover:bg-slate-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <Package className="w-5 h-5 mr-3" />
                Kategoriler
              </Link>
              <Link
                href="/about"
                className="flex items-center px-4 py-3 text-slate-700 hover:bg-slate-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="w-5 h-5 mr-3" />
                Hakkımızda
              </Link>
              <Link
                href="/contact"
                className="flex items-center px-4 py-3 text-slate-700 hover:bg-slate-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="w-5 h-5 mr-3" />
                İletişim
              </Link>
              <Link
                href="/blog"
                className="flex items-center px-4 py-3 text-slate-700 hover:bg-slate-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="w-5 h-5 mr-3" />
                Blog
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-white z-50">
          <div className="flex items-center p-4 border-b border-slate-200">
            <button
              onClick={() => setIsSearchOpen(false)}
              className="p-2 -ml-2 mr-2 touch-manipulation"
              aria-label="Aramayı kapat"
            >
              <X className="w-6 h-6 text-slate-700" />
            </button>
            <input
              type="text"
              placeholder="Ürün ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              autoFocus
            />          </div>
          
          <div className="p-4">
            {searchQuery ? (
              <div>
                <p className="text-slate-600 mb-4">&quot;{searchQuery}&quot; için sonuçlar:</p>
                {/* Search results would go here */}
                <p className="text-slate-500 text-center py-8">Arama sonucu bulunamadı.</p>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold text-slate-800 mb-4">Popüler Aramalar</h3>
                <div className="space-y-2">
                  {['Stethoskop', 'Tansiyon Aleti', 'EKG', 'Termometre'].map((term) => (
                    <button
                      key={term}
                      onClick={() => setSearchQuery(term)}
                      className="block w-full text-left px-3 py-2 text-slate-600 hover:bg-slate-50 rounded"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
