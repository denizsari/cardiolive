'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Bir Hata Oluştu
          </h1>
          <p className="text-lg text-gray-600">
            Beklenmedik bir sorun yaşandı. Lütfen tekrar deneyin.
          </p>
        </div>

        {/* Error Details */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 p-4 bg-gray-100 rounded-lg text-left">
            <h3 className="font-medium text-gray-900 mb-2">Hata Detayları (Geliştirme Modu):</h3>
            <p className="text-sm text-gray-600 font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-gray-500 mt-2">
                Hata ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4 mb-8">
          <button
            onClick={reset}
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors w-full sm:w-auto"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Tekrar Dene
          </button>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Home className="h-4 w-4 mr-2" />
              Ana Sayfa
            </Link>
            
            <Link
              href="/contact"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Mail className="h-4 w-4 mr-2" />
              Destek
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-2">Ne Yapabilirsiniz?</h3>
          <ul className="text-sm text-gray-600 space-y-1 text-left">
            <li>• Sayfayı yenileyin</li>
            <li>• İnternet bağlantınızı kontrol edin</li>
            <li>• Biraz bekleyin ve tekrar deneyin</li>
            <li>• Sorun devam ederse destek ekibimizle iletişime geçin</li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Yardıma mı ihtiyacınız var?{' '}
            <Link href="/contact" className="text-blue-600 hover:text-blue-800 transition-colors">
              Bizimle iletişime geçin
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
