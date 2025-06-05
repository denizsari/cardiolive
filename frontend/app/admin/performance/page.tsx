'use client';

import { useState, useEffect } from 'react';
import { Activity, Clock, Zap, Database, Server, Monitor } from 'lucide-react';
import { useIsClient } from '@/utils/ssr';

interface PerformanceMetrics {
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
  totalBlockingTime: number;
}

interface SystemMetrics {
  memoryUsage: number;
  loadTime: number;
  responseTime: number;
  errorRate: number;
}

export default function PerformanceDashboard() {
  const isClient = useIsClient();
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    firstInputDelay: 0,
    cumulativeLayoutShift: 0,
    timeToInteractive: 0,
    totalBlockingTime: 0,
  });

  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    memoryUsage: 0,
    loadTime: 0,
    responseTime: 0,
    errorRate: 0,
  });

  useEffect(() => {
    // Web Vitals metrikleri
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        switch (entry.entryType) {
          case 'paint':
            if (entry.name === 'first-contentful-paint') {
              setPerformanceMetrics(prev => ({
                ...prev,
                firstContentfulPaint: entry.startTime
              }));
            }
            break;
          case 'largest-contentful-paint':
            setPerformanceMetrics(prev => ({
              ...prev,
              largestContentfulPaint: entry.startTime
            }));
            break;        case 'first-input':
          const fidEntry = entry as PerformanceEventTiming;
          setPerformanceMetrics(prev => ({
            ...prev,
            firstInputDelay: fidEntry.processingStart - fidEntry.startTime
          }));
          break;
        }
      });
    });

    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input'] });    // Sistem metrikleri simülasyonu
    const updateSystemMetrics = () => {
      setSystemMetrics({
        memoryUsage: isClient ? Math.floor(Math.random() * 100) : 50,
        loadTime: isClient ? Math.floor(Math.random() * 3000) + 500 : 1000,
        responseTime: isClient ? Math.floor(Math.random() * 200) + 50 : 100,
        errorRate: isClient ? Math.random() * 5 : 1,
      });
    };

    updateSystemMetrics();
    const interval = setInterval(updateSystemMetrics, 5000);    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, [isClient]);

  const getScoreColor = (value: number, thresholds: { good: number; needs: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.needs) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Dashboard</h1>
          <p className="text-gray-600">Kardiyolive E-ticaret Platform Performans Metrikleri</p>
        </div>

        {/* Core Web Vitals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <Zap className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">First Contentful Paint</h3>
                <p className="text-sm text-gray-600">İlk içerik görüntüleme süresi</p>
              </div>
            </div>
            <div className={`text-3xl font-bold ${getScoreColor(performanceMetrics.firstContentfulPaint, { good: 1800, needs: 3000 })}`}>
              {formatTime(performanceMetrics.firstContentfulPaint)}
            </div>
            <div className="mt-2 text-sm text-gray-500">
              İyi: &lt;1.8s | Geliştirilmeli: &lt;3s
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <Monitor className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Largest Contentful Paint</h3>
                <p className="text-sm text-gray-600">En büyük içerik görüntüleme</p>
              </div>
            </div>
            <div className={`text-3xl font-bold ${getScoreColor(performanceMetrics.largestContentfulPaint, { good: 2500, needs: 4000 })}`}>
              {formatTime(performanceMetrics.largestContentfulPaint)}
            </div>
            <div className="mt-2 text-sm text-gray-500">
              İyi: &lt;2.5s | Geliştirilmeli: &lt;4s
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <Clock className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">First Input Delay</h3>
                <p className="text-sm text-gray-600">İlk etkileşim gecikmesi</p>
              </div>
            </div>
            <div className={`text-3xl font-bold ${getScoreColor(performanceMetrics.firstInputDelay, { good: 100, needs: 300 })}`}>
              {formatTime(performanceMetrics.firstInputDelay)}
            </div>
            <div className="mt-2 text-sm text-gray-500">
              İyi: &lt;100ms | Geliştirilmeli: &lt;300ms
            </div>
          </div>
        </div>

        {/* Sistem Metrikleri */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <Database className="h-6 w-6 text-blue-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Bellek Kullanımı</h3>
            </div>
            <div className="text-2xl font-bold text-gray-900">{systemMetrics.memoryUsage}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${systemMetrics.memoryUsage}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <Activity className="h-6 w-6 text-green-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Sayfa Yükleme</h3>
            </div>
            <div className="text-2xl font-bold text-gray-900">{formatTime(systemMetrics.loadTime)}</div>
            <div className="text-sm text-gray-500 mt-1">Ortalama yükleme süresi</div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <Server className="h-6 w-6 text-purple-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">API Yanıt</h3>
            </div>
            <div className="text-2xl font-bold text-gray-900">{systemMetrics.responseTime}ms</div>
            <div className="text-sm text-gray-500 mt-1">Ortalama yanıt süresi</div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <Monitor className="h-6 w-6 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Hata Oranı</h3>
            </div>
            <div className="text-2xl font-bold text-gray-900">{systemMetrics.errorRate.toFixed(2)}%</div>
            <div className="text-sm text-gray-500 mt-1">Son 24 saat</div>
          </div>
        </div>

        {/* Optimizasyon Önerileri */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Optimizasyon Önerileri</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
              <div>
                <h4 className="font-medium text-gray-900">Image Optimization Tamamlandı ✅</h4>
                <p className="text-gray-600 text-sm">Tüm Next.js Image componentleri ProductImage ile değiştirildi</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3"></div>
              <div>
                <h4 className="font-medium text-gray-900">Bundle Size Optimization</h4>
                <p className="text-gray-600 text-sm">Webpack bundle splitting konfigürasyonu optimize edilebilir</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
              <div>
                <h4 className="font-medium text-gray-900">Caching Strategy</h4>
                <p className="text-gray-600 text-sm">Redis cache implementasyonu ve CDN entegrasyonu</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
