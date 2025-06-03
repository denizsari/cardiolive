'use client';

import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#70BB1B] text-white" style={{ fontFamily: 'var(--font-inter)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Üst Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* İletişim */}
          <div>
            <h3 className="text-lg font-semibold mb-4">İLETİŞİM</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                <a href="mailto:info@cardiolive.com" className="hover:underline">
                  info@cardiolive.com
                </a>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-2" />
                <a href="tel:+905415555575" className="hover:underline">
                  +90 541 555 55 75
                </a>
              </div>
            </div>
          </div>

          {/* Kurumsal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">KURUMSAL</h3>
            <ul className="space-y-2">              <li>
                <Link href="/about" className="hover:underline">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:underline">
                  İletişim
                </Link>
              </li>
              <li>
                <Link href="/kisisel-veriler-politikasi" className="hover:underline">
                  Kişisel Veriler Politikası
                </Link>
              </li>
            </ul>
          </div>

          {/* Yardım */}
          <div>
            <h3 className="text-lg font-semibold mb-4">YARDIM</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/iade-degisim" className="hover:underline">
                  İade & Değişim
                </Link>
              </li>              <li>
                <Link href="/sikca-sorulanlar" className="hover:underline">
                  Sıkça Sorulanlar
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Alt Kısım - Copyright */}
        <div className="text-center text-sm border-t border-white/20 pt-4">
          <p>Copyright 2024 - Tüm Hakları Saklıdır - Kredi kartı bilgileriniz SSL sertifikası ile korunmaktadır.</p>
        </div>
      </div>
    </footer>
  );
} 