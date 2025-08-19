import { useState, useEffect } from "react";
import { usePWA } from "../hooks/usePWA";
import { PWADebug } from "./PWADebug";

export function PWAFeatures() {
  const { isInstalled, isInstallable, installApp } = usePWA();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cacheSize, setCacheSize] = useState<string>("Calculating...");

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Calculate cache size
    if ('caches' in window) {
      caches.keys().then(async (cacheNames) => {
        let totalSize = 0;
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const requests = await cache.keys();
          for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
              const blob = await response.blob();
              totalSize += blob.size;
            }
          }
        }
        setCacheSize(totalSize > 0 ? `${(totalSize / 1024 / 1024).toFixed(2)} MB` : "0 MB");
      }).catch(() => {
        setCacheSize("Unable to calculate");
      });
    } else {
      setCacheSize("Not supported");
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const clearCache = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        setCacheSize("0 MB");
        alert("Cache cleared successfully!");
      } catch (error) {
        console.error("Failed to clear cache:", error);
        alert("Failed to clear cache");
      }
    }
  };

  const refreshApp = () => {
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          📱 Progressive Web App Features
        </h1>
        <p className="text-lg text-gray-600">
          Manage your app installation and offline capabilities
        </p>
      </div>

      {/* Installation Status */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">📲</span>
          Installation Status
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">App Installation</h3>
              <p className="text-sm text-gray-600">
                {isInstalled ? "App is installed on your device" : 
                 isInstallable ? "App can be installed" : "Installation not available"}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`w-3 h-3 rounded-full ${
                isInstalled ? "bg-green-500" : isInstallable ? "bg-yellow-500" : "bg-gray-400"
              }`}></span>
              {isInstallable && !isInstalled && (
                <button
                  onClick={installApp}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Install App
                </button>
              )}
              {!isInstallable && !isInstalled && navigator.userAgent.includes('Chrome') && (
                <div className="text-xs text-gray-500">
                  Chrome requires multiple visits
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Connection Status</h3>
              <p className="text-sm text-gray-600">
                {isOnline ? "Connected to the internet" : "Offline mode active"}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`w-3 h-3 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`}></span>
              <span className="text-sm font-medium text-gray-700">
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cache Management */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">💾</span>
          Cache Management
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Cached Data</h3>
              <p className="text-sm text-gray-600">
                Current cache size: {cacheSize}
              </p>
            </div>
            <button
              onClick={clearCache}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear Cache
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">App Refresh</h3>
              <p className="text-sm text-gray-600">
                Reload the app to get the latest updates
              </p>
            </div>
            <button
              onClick={refreshApp}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh App
            </button>
          </div>
        </div>
      </div>

      {/* PWA Features */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">✨</span>
          PWA Features
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-medium text-purple-900 mb-2">🚀 Fast Loading</h3>
            <p className="text-sm text-purple-700">
              App loads instantly with cached resources
            </p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">📱 Native Feel</h3>
            <p className="text-sm text-blue-700">
              Works like a native app when installed
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2">🔄 Auto Updates</h3>
            <p className="text-sm text-green-700">
              Automatically updates in the background
            </p>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg">
            <h3 className="font-medium text-orange-900 mb-2">💾 Offline Ready</h3>
            <p className="text-sm text-orange-700">
              Basic functionality works offline
            </p>
          </div>
        </div>
      </div>

      {/* Installation Instructions */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">📖</span>
          Installation Guide
        </h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">📱 On Mobile (iOS/Android)</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 ml-4">
              <li>Open this app in Safari (iOS) or Chrome (Android)</li>
              <li>Tap the share button or menu (⋯)</li>
              <li>Select "Add to Home Screen"</li>
              <li>Confirm the installation</li>
            </ol>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">💻 On Desktop</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 ml-4">
              <li>Look for the install icon in your browser's address bar</li>
              <li>Click the install button when it appears</li>
              <li>Or use the "Install App" button above if available</li>
              <li>The app will be added to your applications</li>
            </ol>
          </div>
        </div>
      </div>
      
      {/* Debug Component */}
      <PWADebug />
    </div>
  );
}
