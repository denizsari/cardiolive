'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { CheckCircle, Package, Phone, Mail } from 'lucide-react';

export const dynamic = 'force-dynamic';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Hide confetti animation after 3 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            {/* Success Icon */}
            <div className="relative mb-8">
              <CheckCircle size={80} className="mx-auto text-green-500" />
              {showConfetti && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-ping absolute h-20 w-20 rounded-full bg-green-400 opacity-75"></div>
                </div>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Siparişiniz Başarıyla Alındı!
            </h1>
            
            {orderNumber && (
              <p className="text-lg text-gray-600 mb-8">
                Sipariş Numaranız: <span className="font-bold text-[#70BB1B]">#{orderNumber}</span>
              </p>
            )}

            <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Ne Olacak Şimdi?</h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="text-blue-600" size={24} />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Sipariş Hazırlanıyor</h3>
                  <p className="text-sm text-gray-600">
                    Siparişiniz en kısa sürede hazırlanacak ve kargoya verilecek.
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="text-yellow-600" size={24} />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Kargoya Verildi</h3>
                  <p className="text-sm text-gray-600">
                    Siparişiniz kargoya verildiğinde size bilgilendirme mesajı göndereceğiz.
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="text-green-600" size={24} />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Teslim Edildi</h3>
                  <p className="text-sm text-gray-600">
                    Siparişiniz adresinize teslim edilecek ve ödemenizi kapıda yapabilirsiniz.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">İletişim Bilgileri</h3>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="flex items-center gap-3">
                  <Phone className="text-[#70BB1B]" size={20} />
                  <div>
                    <p className="font-medium">Telefon</p>
                    <p className="text-gray-600">0850 123 45 67</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="text-[#70BB1B]" size={20} />
                  <div>
                    <p className="font-medium">E-posta</p>
                    <p className="text-gray-600">info@cardiolive.com</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Herhangi bir sorunuz varsa, yukarıdaki iletişim kanallarından bize ulaşabilirsiniz.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/orders"
                className="inline-flex items-center px-6 py-3 bg-[#70BB1B] text-white font-medium rounded-lg hover:bg-[#5ea516] transition-colors"
              >
                Siparişlerimi Görüntüle
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Alışverişe Devam Et
              </Link>
            </div>
          </div>
        </div>      </main>
      <Footer />
    </>
  );
}

// Main component with Suspense wrapper
export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
