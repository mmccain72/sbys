import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  networkStatus: 'online' | 'offline';
  connectionType?: string;
  batteryLevel?: number;
  isCharging?: boolean;
  cacheStatus?: {
    coreFiles: number;
    images: number;
    apiResponses: number;
    offlineQueue: number;
    totalCached: number;
  };
}

interface PWAPerformanceMonitorProps {
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  showDebugInfo?: boolean;
}

export function PWAPerformanceMonitor({ 
  onMetricsUpdate, 
  showDebugInfo = false 
}: PWAPerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    networkStatus: navigator.onLine ? 'online' : 'offline'
  });
  
  const [showMonitor, setShowMonitor] = useState(showDebugInfo);

  // Core Web Vitals measurement
  useEffect(() => {
    const measureWebVitals = async () => {
      try {
        // Dynamic import for Web Vitals
        const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');
        
        const updateMetric = (name: string, value: number) => {
          setMetrics(prev => {
            const updated = { ...prev, [name.toLowerCase()]: value };
            onMetricsUpdate?.(updated);
            return updated;
          });
        };

        getCLS(({ value }) => updateMetric('cls', value));
        getFID(({ value }) => updateMetric('fid', value));
        getFCP(({ value }) => updateMetric('fcp', value));
        getLCP(({ value }) => updateMetric('lcp', value));
        getTTFB(({ value }) => updateMetric('ttfb', value));
        
      } catch (error) {
        console.warn('Web Vitals not available:', error);
        
        // Fallback to Performance API
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
              setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
            }
            if (entry.entryType === 'largest-contentful-paint') {
              setMetrics(prev => ({ ...prev, lcp: entry.startTime }));
            }
          });
        });
        
        try {
          observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
        } catch (e) {
          console.warn('Performance Observer not supported:', e);
        }
      }
    };

    measureWebVitals();
  }, [onMetricsUpdate]);

  // Network status monitoring
  useEffect(() => {
    const updateNetworkStatus = () => {
      const status = navigator.onLine ? 'online' : 'offline';
      setMetrics(prev => ({ ...prev, networkStatus: status }));
    };

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  // Connection API monitoring
  useEffect(() => {
    const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection;
    
    if (connection) {
      const updateConnection = () => {
        setMetrics(prev => ({ 
          ...prev, 
          connectionType: connection.effectiveType 
        }));
      };

      connection.addEventListener('change', updateConnection);
      updateConnection();

      return () => {
        connection.removeEventListener('change', updateConnection);
      };
    }
  }, []);

  // Battery API monitoring
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBattery = () => {
          setMetrics(prev => ({
            ...prev,
            batteryLevel: battery.level,
            isCharging: battery.charging
          }));
        };

        battery.addEventListener('chargingchange', updateBattery);
        battery.addEventListener('levelchange', updateBattery);
        updateBattery();

        return () => {
          battery.removeEventListener('chargingchange', updateBattery);
          battery.removeEventListener('levelchange', updateBattery);
        };
      }).catch(() => {
        console.log('Battery API not available');
      });
    }
  }, []);

  // Service Worker cache status
  useEffect(() => {
    const getCacheStatus = async () => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        try {
          const messageChannel = new MessageChannel();
          
          const response = await new Promise((resolve, reject) => {
            messageChannel.port1.onmessage = (event) => {
              if (event.data.error) {
                reject(new Error(event.data.error));
              } else {
                resolve(event.data);
              }
            };
            
            navigator.serviceWorker.controller?.postMessage(
              { type: 'GET_CACHE_STATUS' },
              [messageChannel.port2]
            );
            
            // Timeout after 5 seconds
            setTimeout(() => reject(new Error('Timeout')), 5000);
          });

          setMetrics(prev => ({ ...prev, cacheStatus: response as any }));
        } catch (error) {
          console.warn('Failed to get cache status:', error);
        }
      }
    };

    getCacheStatus();
    
    // Update cache status every 30 seconds
    const interval = setInterval(getCacheStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Performance scoring
  const getPerformanceScore = (): { score: number; grade: string; color: string } => {
    let score = 100;
    
    // LCP scoring (2.5s = good, 4s = needs improvement)
    if (metrics.lcp) {
      if (metrics.lcp > 4000) score -= 30;
      else if (metrics.lcp > 2500) score -= 15;
    }
    
    // FID scoring (100ms = good, 300ms = needs improvement)
    if (metrics.fid) {
      if (metrics.fid > 300) score -= 25;
      else if (metrics.fid > 100) score -= 10;
    }
    
    // CLS scoring (0.1 = good, 0.25 = needs improvement)
    if (metrics.cls) {
      if (metrics.cls > 0.25) score -= 25;
      else if (metrics.cls > 0.1) score -= 10;
    }
    
    // Network penalty
    if (metrics.networkStatus === 'offline') score -= 10;
    if (metrics.connectionType === 'slow-2g' || metrics.connectionType === '2g') score -= 5;
    
    // Battery bonus/penalty
    if (metrics.batteryLevel && metrics.batteryLevel < 0.2) score -= 5;
    if (metrics.isCharging) score += 2;
    
    const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
    const color = score >= 90 ? '#10b981' : score >= 80 ? '#f59e0b' : score >= 70 ? '#f97316' : '#ef4444';
    
    return { score: Math.max(0, score), grade, color };
  };

  if (!showMonitor) {
    return (
      <button
        onClick={() => setShowMonitor(true)}
        className="fixed bottom-4 right-4 z-50 bg-purple-600 text-white p-2 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
        title="Show Performance Monitor"
        aria-label="Show Performance Monitor"
      >
        📊
      </button>
    );
  }

  const { score, grade, color } = getPerformanceScore();

  return (
    <div className="fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">PWA Performance</h3>
        <button
          onClick={() => setShowMonitor(false)}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Close Performance Monitor"
        >
          ×
        </button>
      </div>
      
      {/* Performance Score */}
      <div className="mb-4 text-center">
        <div 
          className="text-3xl font-bold mb-1"
          style={{ color }}
        >
          {grade}
        </div>
        <div className="text-sm text-gray-600">Score: {score}/100</div>
      </div>
      
      {/* Core Web Vitals */}
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span>LCP:</span>
          <span className={metrics.lcp ? (metrics.lcp <= 2500 ? 'text-green-600' : metrics.lcp <= 4000 ? 'text-yellow-600' : 'text-red-600') : 'text-gray-400'}>
            {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : 'measuring...'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>FID:</span>
          <span className={metrics.fid ? (metrics.fid <= 100 ? 'text-green-600' : metrics.fid <= 300 ? 'text-yellow-600' : 'text-red-600') : 'text-gray-400'}>
            {metrics.fid ? `${Math.round(metrics.fid)}ms` : 'measuring...'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>CLS:</span>
          <span className={metrics.cls ? (metrics.cls <= 0.1 ? 'text-green-600' : metrics.cls <= 0.25 ? 'text-yellow-600' : 'text-red-600') : 'text-gray-400'}>
            {metrics.cls ? metrics.cls.toFixed(3) : 'measuring...'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>FCP:</span>
          <span className="text-gray-600">
            {metrics.fcp ? `${Math.round(metrics.fcp)}ms` : 'measuring...'}
          </span>
        </div>
      </div>
      
      <hr className="my-3" />
      
      {/* System Status */}
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span>Network:</span>
          <span className={`${metrics.networkStatus === 'online' ? 'text-green-600' : 'text-red-600'}`}>
            {metrics.networkStatus} {metrics.connectionType && `(${metrics.connectionType})`}
          </span>
        </div>
        
        {metrics.batteryLevel !== undefined && (
          <div className="flex justify-between">
            <span>Battery:</span>
            <span className={`${metrics.batteryLevel < 0.2 ? 'text-red-600' : 'text-gray-600'}`}>
              {Math.round(metrics.batteryLevel * 100)}% {metrics.isCharging ? '🔌' : ''}
            </span>
          </div>
        )}
        
        {metrics.cacheStatus && (
          <div className="flex justify-between">
            <span>Cache:</span>
            <span className="text-gray-600">
              {metrics.cacheStatus.totalCached} items
              {metrics.cacheStatus.offlineQueue > 0 && (
                <span className="text-orange-600"> ({metrics.cacheStatus.offlineQueue} queued)</span>
              )}
            </span>
          </div>
        )}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}

export default PWAPerformanceMonitor;