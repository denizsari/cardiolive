'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, User, LogOut, Package, ChevronDown, Heart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface UserType {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

export default function Header() {
  const router = useRouter();
  const { getTotalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData && userData !== 'undefined') {
      try {
        const parsedUser = JSON.parse(userData);
        // Validate that parsed user has required properties
        if (parsedUser && typeof parsedUser === 'object' && parsedUser._id) {
          setUser(parsedUser);
        } else {
          console.warn('Invalid user data structure, clearing localStorage');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsUserMenuOpen(false);
    router.push('/');
    router.refresh();
  };
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsSearchOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white z-50 shadow-sm" style={{ fontFamily: 'var(--font-inter)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-[#70BB1B]">
            Cardiolive
          </Link>          {/* Masaüstü Menü */}
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
            <Link href="/track-order" className="text-gray-700 hover:text-[#70BB1B] transition-colors">
              Sipariş Takip
            </Link>
          </nav>          {/* Sağ: Arama, Sepet ve Hesap */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label="Search" 
                className="text-gray-700 hover:text-[#70BB1B] transition-colors"
              >
                <Search size={20} />
              </button>
              
              {/* Search Dropdown */}
              {isSearchOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border p-4 z-50">
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Ürün ara..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#70BB1B] focus:border-transparent"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#70BB1B] text-white rounded-lg hover:bg-[#5ea516] transition-colors"
                    >
                      Ara
                    </button>
                  </form>
                </div>              )}
            </div>
            
            {/* Wishlist Link */}
            <Link href="/wishlist" aria-label="Wishlist" className="text-gray-700 hover:text-[#70BB1B] transition-colors relative">
              <Heart size={20} />
            </Link>
            
            <Link href="/cart" aria-label="Cart" className="text-gray-700 hover:text-[#70BB1B] transition-colors relative">
              <ShoppingCart size={20} />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#70BB1B] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {!isLoading && (
              <div className="relative">
                {user ? (
                  <div>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-1 text-gray-700 hover:text-[#70BB1B] transition-colors"
                    >
                      <User size={20} />
                      <span className="hidden sm:block">{user.name}</span>
                      <ChevronDown size={16} />
                    </button>

                    {/* User Dropdown */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border">
                        <Link
                          href="/account"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={closeMenus}
                        >
                          <div className="flex items-center space-x-2">
                            <User size={16} />
                            <span>Hesabım</span>
                          </div>
                        </Link>
                        <Link
                          href="/orders"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={closeMenus}
                        >
                          <div className="flex items-center space-x-2">
                            <Package size={16} />
                            <span>Siparişlerim</span>
                          </div>
                        </Link>
                        {user.role === 'admin' && (
                          <Link
                            href="/admin"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={closeMenus}
                          >
                            <div className="flex items-center space-x-2">
                              <User size={16} />
                              <span>Admin Panel</span>
                            </div>
                          </Link>
                        )}
                        <hr className="my-1" />
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <LogOut size={16} />
                            <span>Çıkış Yap</span>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link
                      href="/login"
                      className="text-gray-700 hover:text-[#70BB1B] transition-colors text-sm"
                    >
                      Giriş
                    </Link>
                    <span className="text-gray-400">|</span>
                    <Link
                      href="/register"
                      className="text-gray-700 hover:text-[#70BB1B] transition-colors text-sm"
                    >
                      Kayıt
                    </Link>
                  </div>
                )}
              </div>
            )}

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
          </div>
        </div>

        {/* Mobil Menü */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link 
                href="/" 
                className="block px-3 py-2 text-gray-700 hover:text-[#70BB1B] transition-colors"
                onClick={closeMenus}
              >
                Ana Sayfa
              </Link>
              <Link 
                href="/products" 
                className="block px-3 py-2 text-gray-700 hover:text-[#70BB1B] transition-colors"
                onClick={closeMenus}
              >
                Mağaza
              </Link>
              <Link 
                href="/blog" 
                className="block px-3 py-2 text-gray-700 hover:text-[#70BB1B] transition-colors"
                onClick={closeMenus}
              >
                Blog
              </Link>
              <Link 
                href="/about" 
                className="block px-3 py-2 text-gray-700 hover:text-[#70BB1B] transition-colors"
                onClick={closeMenus}
              >
                Hakkımızda
              </Link>
              <Link 
                href="/contact" 
                className="block px-3 py-2 text-gray-700 hover:text-[#70BB1B] transition-colors"
                onClick={closeMenus}
              >
                İletişim
              </Link>
              
              {/* Mobil User Menu */}
              {user ? (
                <>
                  <hr className="my-2" />
                  <Link 
                    href="/account" 
                    className="block px-3 py-2 text-gray-700 hover:text-[#70BB1B] transition-colors"
                    onClick={closeMenus}
                  >
                    Hesabım
                  </Link>
                  <Link 
                    href="/orders" 
                    className="block px-3 py-2 text-gray-700 hover:text-[#70BB1B] transition-colors"
                    onClick={closeMenus}
                  >
                    Siparişlerim
                  </Link>
                  {user.role === 'admin' && (
                    <Link 
                      href="/admin" 
                      className="block px-3 py-2 text-gray-700 hover:text-[#70BB1B] transition-colors"
                      onClick={closeMenus}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-[#70BB1B] transition-colors"
                  >
                    Çıkış Yap
                  </button>
                </>
              ) : (
                <>
                  <hr className="my-2" />
                  <Link 
                    href="/login" 
                    className="block px-3 py-2 text-gray-700 hover:text-[#70BB1B] transition-colors"
                    onClick={closeMenus}
                  >
                    Giriş Yap
                  </Link>
                  <Link 
                    href="/register" 
                    className="block px-3 py-2 text-gray-700 hover:text-[#70BB1B] transition-colors"
                    onClick={closeMenus}
                  >
                    Kayıt Ol
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}