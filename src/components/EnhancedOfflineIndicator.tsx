import { useState, useEffect } from 'react';
import { hapticFeedback, hapticPatterns, isMobile } from '../lib/mobile-utils';

interface OfflineIndicatorProps {
  showWhenOnline?: boolean;
  position?: 'top' | 'bottom';
  className?: string;
}

interface ConnectionInfo {
  isOnline: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  lastOnlineTime?: Date;
  queuedUploads?: number;
}

export function EnhancedOfflineIndicator({ 
  showWhenOnline = false,
  position = 'top',
  className = ''
}: OfflineIndicatorProps) {
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({
    isOnline: navigator.onLine,
    lastOnlineTime: navigator.onLine ? new Date() : undefined
  });
  
  const [showIndicator, setShowIndicator] = useState(false);
  const [queuedUploads, setQueuedUploads] = useState(0);

  // Monitor network status
  useEffect(() => {
    const updateNetworkStatus = () => {
      const isOnline = navigator.onLine;
      const now = new Date();
      
      setConnectionInfo(prev => ({
        ...prev,
        isOnline,
        lastOnlineTime: isOnline ? now : prev.lastOnlineTime
      }));

      // Haptic feedback for network changes
      if (isOnline !== connectionInfo.isOnline) {
        hapticFeedback(isOnline ? hapticPatterns.success : hapticPatterns.warning);
      }

      // Show indicator immediately on offline, delay for online
      if (!isOnline) {
        setShowIndicator(true);
      } else if (showWhenOnline) {
        setShowIndicator(true);
        // Hide online indicator after 3 seconds
        setTimeout(() => setShowIndicator(false), 3000);
      } else {
        setShowIndicator(false);
      }
    };

    // Monitor connection API
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
    
    if (connection) {
      const updateConnectionInfo = () => {
        setConnectionInfo(prev => ({
          ...prev,
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        }));
      };

      connection.addEventListener('change', updateConnectionInfo);
      updateConnectionInfo();

      return () => {
        connection.removeEventListener('change', updateConnectionInfo);
      };
    }

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    // Initial check
    updateNetworkStatus();

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, [connectionInfo.isOnline, showWhenOnline]);

  // Monitor service worker for queued uploads
  useEffect(() => {
    const checkQueuedUploads = async () => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        try {
          const messageChannel = new MessageChannel();
          
          const response = await new Promise((resolve, reject) => {
            messageChannel.port1.onmessage = (event) => {
              resolve(event.data);
            };
            
            navigator.serviceWorker.controller?.postMessage(
              { type: 'GET_CACHE_STATUS' },
              [messageChannel.port2]
            );
            
            setTimeout(() => reject(new Error('Timeout')), 2000);
          });

          const cacheStatus = response as any;
          setQueuedUploads(cacheStatus?.offlineQueue || 0);
        } catch (error) {
          // Silently fail
        }
      }
    };

    checkQueuedUploads();
    
    // Check every 10 seconds
    const interval = setInterval(checkQueuedUploads, 10000);
    return () => clearInterval(interval);
  }, []);

  // Listen for service worker messages
  useEffect(() => {
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      const { type, data } = event.data || {};
      
      if (type === 'OFFLINE_UPLOAD_SUCCESS') {
        setQueuedUploads(prev => Math.max(0, prev - 1));
        hapticFeedback(hapticPatterns.light);
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
      
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      };
    }
  }, []);

  // Calculate offline duration
  const getOfflineDuration = (): string => {
    if (connectionInfo.isOnline || !connectionInfo.lastOnlineTime) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - connectionInfo.lastOnlineTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m offline`;
    } else if (diffMins > 0) {
      return `${diffMins}m offline`;
    } else {
      return 'Just went offline';
    }
  };

  // Get connection quality indicator
  const getConnectionQuality = (): { text: string; color: string; icon: string } => {
    if (!connectionInfo.isOnline) {
      return { text: 'Offline', color: 'bg-red-500', icon: '📵' };
    }
    
    if (connectionInfo.effectiveType) {
      switch (connectionInfo.effectiveType) {
        case '4g':
          return { text: 'Excellent', color: 'bg-green-500', icon: '📶' };
        case '3g':
          return { text: 'Good', color: 'bg-yellow-500', icon: '📶' };
        case '2g':
        case 'slow-2g':
          return { text: 'Slow', color: 'bg-orange-500', icon: '📶' };
        default:
          return { text: 'Online', color: 'bg-blue-500', icon: '🌐' };
      }
    }
    
    return { text: 'Online', color: 'bg-green-500', icon: '🌐' };
  };

  if (!showIndicator && connectionInfo.isOnline) return null;

  const { text, color, icon } = getConnectionQuality();
  const positionClasses = position === 'top' 
    ? 'top-0 left-0 right-0' 
    : 'bottom-0 left-0 right-0';

  return (
    <div className={`fixed ${positionClasses} z-40 ${className}`}>
      <div className={`${color} text-white text-center py-2 px-4 transition-all duration-300`}>
        <div className="flex items-center justify-center space-x-2 text-sm">
          <span>{icon}</span>
          <span className="font-medium">{text}</span>
          
          {!connectionInfo.isOnline && (
            <>
              <span>•</span>
              <span className="text-xs opacity-90">
                {getOfflineDuration()}
              </span>
            </>
          )}
          
          {connectionInfo.saveData && (
            <>
              <span>•</span>
              <span className="text-xs opacity-90">Data Saver</span>
            </>
          )}
          
          {queuedUploads > 0 && (
            <>
              <span>•</span>
              <span className="text-xs opacity-90">
                {queuedUploads} queued upload{queuedUploads !== 1 ? 's' : ''}
              </span>
            </>
          )}
        </div>
        
        {/* Additional info for mobile */}
        {isMobile() && !connectionInfo.isOnline && (
          <div className="text-xs opacity-80 mt-1">
            Limited functionality available • Uploads will sync when online
          </div>
        )}
        
        {/* Connection details for developers/debug mode */}
        {process.env.NODE_ENV === 'development' && connectionInfo.isOnline && (
          <div className="text-xs opacity-75 mt-1">
            {connectionInfo.downlink && `${connectionInfo.downlink}Mbps`}
            {connectionInfo.rtt && ` • ${connectionInfo.rtt}ms RTT`}
            {connectionInfo.effectiveType && ` • ${connectionInfo.effectiveType}`}
          </div>
        )}
      </div>
    </div>
  );
}

// Compact version for mobile status bars
export function CompactOfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queuedUploads, setQueuedUploads] = useState(0);

  useEffect(() => {
    const updateStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  useEffect(() => {
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      const { type } = event.data || {};
      
      if (type === 'OFFLINE_UPLOAD_SUCCESS') {
        setQueuedUploads(prev => Math.max(0, prev - 1));
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
      
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      };
    }
  }, []);

  if (isOnline && queuedUploads === 0) return null;

  return (
    <div className="flex items-center space-x-1 text-xs">
      {!isOnline && (
        <span className="flex items-center space-x-1 text-red-600">
          <span>📵</span>
          <span>Offline</span>
        </span>
      )}
      
      {queuedUploads > 0 && (
        <span className="flex items-center space-x-1 text-orange-600">
          <span>⏳</span>
          <span>{queuedUploads}</span>
        </span>
      )}
    </div>
  );
}

export default EnhancedOfflineIndicator;