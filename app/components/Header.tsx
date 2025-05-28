import Link from 'next/link';
import { Search, ShoppingCart } from 'lucide-react';

export default function Header() {
  return (
    <header className="w-full bg-transparent py-6 px-8 flex items-center justify-between">
      {/* Sol: Logo/Marka */}
      <div className="text-2xl font-bold text-[var(--color-foreground)]">
        <Link href="/">ZeytinYağı</Link>
      </div>

      {/* Orta: Menü */}
      <nav className="flex-1 flex justify-center space-x-10">
        <Link href="/" className="hover:underline font-normal" style={{fontFamily: 'var(--font-inter)'}}>Home</Link>
        <Link href="/shop" className="hover:underline font-normal" style={{fontFamily: 'var(--font-inter)'}}>Shop</Link>
        <Link href="/products" className="hover:underline font-normal" style={{fontFamily: 'var(--font-inter)'}}>Products</Link>
        <Link href="/about" className="hover:underline font-normal" style={{fontFamily: 'var(--font-inter)'}}>About Us</Link>
        <Link href="/contact" className="hover:underline font-normal" style={{fontFamily: 'var(--font-inter)'}}>Contact</Link>
      </nav>

      {/* Sağ: Hesap ve Sepet */}
      <div className="flex items-center space-x-6">
        <Link href="/account" className="flex items-center space-x-1">
          <span>My Account</span>
        </Link>
        <button aria-label="Search" className="text-xl">
          <Search size={24} />
        </button>
        <button aria-label="Cart" className="text-xl">
          <ShoppingCart size={24} />
        </button>
      </div>
    </header>
  );
}