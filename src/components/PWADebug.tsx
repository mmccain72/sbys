import { useState, useEffect } from 'react';

export function PWADebug() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const checkPWAStatus = async () => {
      const info: any = {
        userAgent: navigator.userAgent,
        isChrome: navigator.userAgent.includes('Chrome'),
        isEdge: navigator.userAgent.includes('Edge'),
        hasServiceWorker: 'serviceWorker' in navigator,
        hasManifest: document.querySelector('link[rel="manifest"]') !== null,
        isHTTPS: location.protocol === 'https:' || location.hostname === 'localhost',
        isStandalone: window.matchMedia('(display-mode: standalone)').matches,
        isInWebAppiOS: (window.navigator as any).standalone === true,
        currentURL: window.location.href,
        manifestURL: document.querySelector('link[rel="manifest"]')?.getAttribute('href'),
      };

      // Check service worker status
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          info.serviceWorkerRegistered = !!registration;
          info.serviceWorkerActive = !!registration?.active;
          info.serviceWorkerScope = registration?.scope;
        } catch (error) {
          info.serviceWorkerError = error instanceof Error ? error.message : String(error);
        }
      }

      // Check manifest
      try {
        const manifestResponse = await fetch('/manifest.json');
        info.manifestAccessible = manifestResponse.ok;
        if (manifestResponse.ok) {
          const manifest = await manifestResponse.json();
          info.manifestValid = !!manifest.name;
          info.manifestIcons = manifest.icons?.length || 0;
        }
      } catch (error) {
        info.manifestError = error instanceof Error ? error.message : String(error);
      }

      setDebugInfo(info);
    };

    checkPWAStatus();
  }, []);

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 left-4 bg-red-500 text-white px-3 py-2 rounded-lg text-sm z-50"
      >
        PWA Debug
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">PWA Debug Information</h3>
          <button
            onClick={() => setShowDebug(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(debugInfo).map(([key, value]) => (
              <div key={key} className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-sm text-gray-700 mb-1">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </div>
                <div className="text-sm text-gray-900 font-mono break-all">
                  {typeof value === 'boolean' ? (
                    <span className={value ? 'text-green-600' : 'text-red-600'}>
                      {value ? '✓ True' : '✗ False'}
                    </span>
                  ) : (
                    String(value)
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Chrome PWA Requirements:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ HTTPS or localhost</li>
              <li>✓ Valid manifest.json</li>
              <li>✓ Service worker registered</li>
              <li>✓ Icons (192x192 minimum)</li>
              <li>✓ User engagement (visit multiple times)</li>
            </ul>
          </div>
          
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">Troubleshooting:</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Try visiting the site multiple times over several days</li>
              <li>• Clear browser cache and reload</li>
              <li>• Check Chrome DevTools &gt; Application &gt; Manifest</li>
              <li>• Ensure you're not in incognito mode</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
