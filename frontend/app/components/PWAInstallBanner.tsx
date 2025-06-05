'use client';

import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

export default function PWAInstallBanner() {
  const { isInstallable, isInstalled, installPWA } = usePWA();
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Daha önce dismiss edilmiş mi kontrol et
    const wasDismissed = localStorage.getItem('pwa-banner-dismissed');
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    // Banner gösterme koşulları
    if (isInstallable && !isInstalled && !dismissed) {
      // 3 saniye sonra banner göster
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, dismissed]);

  const handleInstall = async () => {
    const installed = await installPWA();
    if (installed) {
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem('pwa-banner-dismissed', 'true');
  };

  if (!showBanner || isInstalled) {
    return null;
  }

  return (
    <>
      {/* Mobile Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-[#70BB1B] to-[#5a9916] text-white p-4 shadow-lg md:hidden transform transition-transform duration-300 ease-in-out">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Smartphone className="h-8 w-8" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold">Kardiyolive Uygulaması</h3>
              <p className="text-sm opacity-90">Telefona yükleyerek daha hızlı alışveriş yapın</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleInstall}
              className="bg-white text-[#70BB1B] px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors flex items-center space-x-1"
            >
              <Download className="h-4 w-4" />
              <span>Yükle</span>
            </button>
            <button
              onClick={handleDismiss}
              className="text-white hover:text-gray-200 transition-colors p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Banner */}
      <div className="fixed top-20 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-6 max-w-sm hidden md:block transform transition-transform duration-300 ease-in-out">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 bg-[#70BB1B] p-2 rounded-lg">
              <Monitor className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Masaüstü Uygulaması</h3>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <p className="text-gray-600 mb-4">
          Kardiyolive'i bilgisayarınıza yükleyerek daha hızlı erişim sağlayın.
        </p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Çevrimdışı erişim
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Hızlı yükleme
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Masaüstü bildirimleri
          </div>
        </div>
        
        <button
          onClick={handleInstall}
          className="w-full bg-[#70BB1B] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#5a9916] transition-colors flex items-center justify-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Şimdi Yükle</span>
        </button>
      </div>
    </>
  );
}

// Offline indicator komponenti
export function OfflineIndicator() {
  const { isOnline } = usePWA();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white py-2 px-4 text-center text-sm">
      <div className="flex items-center justify-center space-x-2">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <span>Çevrimdışı mode - Bağlantı bekleniyor</span>
      </div>
    </div>
  );
}

// Update available komponenti
export function UpdateAvailableBanner() {
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SW_UPDATE_AVAILABLE') {
        setShowUpdateBanner(true);
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleUpdate = () => {
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowUpdateBanner(false);
  };

  if (!showUpdateBanner) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-blue-500 text-white py-3 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <Download className="h-5 w-5" />
          </div>
          <div>
            <span className="font-medium">Yeni güncelleme mevcut!</span>
            <span className="ml-2 text-sm opacity-90">Yeni özellikler ve iyileştirmeler</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleUpdate}
            className="bg-white text-blue-500 px-4 py-1 rounded font-medium text-sm hover:bg-gray-100 transition-colors"
          >
            Güncelle
          </button>
          <button
            onClick={handleDismiss}
            className="text-white hover:text-gray-200 transition-colors p-1"
          >
            <X className="h-4 w-4" />
          </button>        </div>
      </div>
    </div>
  );
}

export { PWAInstallBanner };
