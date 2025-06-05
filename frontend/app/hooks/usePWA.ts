'use client';

import { useEffect, useState } from 'react';

interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt | null>(null);

  useEffect(() => {
    // Service Worker kayıt
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
          
          // Update kontrolü
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // Yeni versiyon mevcut
                    showUpdateNotification();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.log('SW registration failed: ', error);
        });
    }

    // PWA install prompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);

    // PWA installed kontrolü
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Online/Offline durumu
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // İlk durum kontrolü
    setIsOnline(navigator.onLine);
    
    // Eğer standalone modda çalışıyorsa, PWA olarak yüklenmiş demektir
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installPWA = async () => {
    if (!installPrompt) return false;

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        setInstallPrompt(null);
        return true;
      }
    } catch (error) {
      console.error('PWA install error:', error);
    }
    
    return false;
  };

  const showUpdateNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Kardiyolive Güncellendi', {
        body: 'Yeni özellikler ve iyileştirmeler mevcut. Sayfayı yenileyin.',
        icon: '/icons/icon-192x192.png',
        tag: 'update-available'
      });
    }
  };

  return {
    isInstallable,
    isInstalled,
    isOnline,
    installPWA,
  };
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.log('Bu tarayıcı bildirim desteklemiyor');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Bildirim izni hatası:', error);
      return false;
    }
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (permission === 'granted') {
      new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge.png',
        ...options,
      });
    }
  };

  return {
    permission,
    requestPermission,
    showNotification,
    isSupported: 'Notification' in window,
  };
}

export function useOfflineQueue() {
  const [queueSize, setQueueSize] = useState(0);

  useEffect(() => {
    // Offline queue durumunu kontrol et
    const checkQueue = () => {
      // IndexedDB'den queue boyutunu al
      // Bu implementasyon basitleştirilmiştir
    };

    checkQueue();
    
    // Periyodik kontrol
    const interval = setInterval(checkQueue, 30000);
    
    return () => clearInterval(interval);
  }, []);
  const addToQueue = async (data: Record<string, unknown>, type: string) => {
    // Offline queue'ya ekle
    try {
      // IndexedDB'ye kaydet
      setQueueSize(prev => prev + 1);
      console.log('Added to offline queue:', { data, type });
    } catch (error) {
      console.error('Queue\'ya ekleme hatası:', error);
    }
  };

  const processQueue = async () => {
    // Queue'yu işle
    try {
      // Service Worker'a sync mesajı gönder
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SYNC_QUEUE'
        });
      }
    } catch (error) {
      console.error('Queue işleme hatası:', error);
    }
  };

  return {
    queueSize,
    addToQueue,
    processQueue,
  };
}
