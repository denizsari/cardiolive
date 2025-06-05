'use client';

import { useEffect, useState } from 'react';

// Type definitions for performance entries
interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
  processingEnd: number;
  cancelable: boolean;
}

interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface PerformanceMetrics {
  fcp: number | null; // First Contentful Paint
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  ttfb: number | null; // Time to First Byte
}

export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Function to get performance metrics
    const getMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        setMetrics(prev => ({
          ...prev,
          ttfb: navigation.responseStart - navigation.requestStart,
        }));
      }
    };

    // Get initial metrics
    getMetrics();

    // Core Web Vitals observer
    if ('PerformanceObserver' in window) {
      // FCP Observer
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          setMetrics(prev => ({ ...prev, fcp: fcpEntry.startTime }));
        }
      });

      try {
        fcpObserver.observe({ entryTypes: ['paint'] });
      } catch (e) {
        console.warn('FCP observer failed:', e);
      }

      // LCP Observer
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
        }
      });

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP observer failed:', e);
      }      // FID Observer
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fidEntry = entries[0] as PerformanceEventTiming;
        if (fidEntry && fidEntry.processingStart !== undefined) {
          setMetrics(prev => ({ ...prev, fid: fidEntry.processingStart - fidEntry.startTime }));
        }
      });

      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('FID observer failed:', e);
      }      // CLS Observer
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const layoutShiftEntry = entry as LayoutShiftEntry;
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value;
            setMetrics(prev => ({ ...prev, cls: clsValue }));
          }
        });
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('CLS observer failed:', e);
      }

      // Cleanup
      return () => {
        fcpObserver.disconnect();
        lcpObserver.disconnect();
        fidObserver.disconnect();
        clsObserver.disconnect();
      };
    }
  }, []);

  return metrics;
}

// Performance monitoring component
export function PerformanceMonitor({ 
  showInDev = false,
  onMetricsUpdate
}: {
  showInDev?: boolean;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}) {
  const metrics = usePerformanceMonitoring();
  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (onMetricsUpdate) {
      onMetricsUpdate(metrics);
    }
  }, [metrics, onMetricsUpdate]);  // Send metrics to analytics
  useEffect(() => {
    if (metrics.lcp && metrics.fcp && metrics.cls !== null) {
      // Send to analytics service
      const windowWithGtag = window as typeof window & { gtag?: (...args: unknown[]) => void };
      if (typeof window !== 'undefined' && windowWithGtag.gtag) {
        windowWithGtag.gtag('event', 'core_web_vitals', {
          fcp: Math.round(metrics.fcp),
          lcp: Math.round(metrics.lcp),
          fid: metrics.fid ? Math.round(metrics.fid) : null,
          cls: Math.round(metrics.cls * 1000) / 1000,
          ttfb: metrics.ttfb ? Math.round(metrics.ttfb) : null,
        });
      }
    }
  }, [metrics]);

  if (!showInDev && isDev) {
    return null;
  }

  const getScoreColor = (metric: string, value: number) => {
    const thresholds = {
      fcp: { good: 1800, poor: 3000 },
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      ttfb: { good: 800, poor: 1800 },
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'text-gray-600';

    if (value <= threshold.good) return 'text-green-600';
    if (value <= threshold.poor) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isDev && !showInDev) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 text-xs max-w-xs z-50">
      <h3 className="font-semibold mb-2">Performance Metrics</h3>
      <div className="space-y-1">
        {metrics.fcp && (
          <div className={`flex justify-between ${getScoreColor('fcp', metrics.fcp)}`}>
            <span>FCP:</span>
            <span>{Math.round(metrics.fcp)}ms</span>
          </div>
        )}
        {metrics.lcp && (
          <div className={`flex justify-between ${getScoreColor('lcp', metrics.lcp)}`}>
            <span>LCP:</span>
            <span>{Math.round(metrics.lcp)}ms</span>
          </div>
        )}
        {metrics.fid && (
          <div className={`flex justify-between ${getScoreColor('fid', metrics.fid)}`}>
            <span>FID:</span>
            <span>{Math.round(metrics.fid)}ms</span>
          </div>
        )}
        {metrics.cls !== null && (
          <div className={`flex justify-between ${getScoreColor('cls', metrics.cls)}`}>
            <span>CLS:</span>
            <span>{Math.round(metrics.cls * 1000) / 1000}</span>
          </div>
        )}
        {metrics.ttfb && (
          <div className={`flex justify-between ${getScoreColor('ttfb', metrics.ttfb)}`}>
            <span>TTFB:</span>
            <span>{Math.round(metrics.ttfb)}ms</span>
          </div>
        )}
      </div>
    </div>
  );
}
