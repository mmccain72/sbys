import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone || isInWebAppiOS);

    console.log('PWA Hook: Checking install status', {
      isStandalone,
      isInWebAppiOS,
      userAgent: navigator.userAgent,
      isChrome: navigator.userAgent.includes('Chrome')
    });

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWA Hook: beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA Hook: App installed');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Chrome-specific: Check if service worker is ready
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        console.log('PWA Hook: Service Worker is ready');
      }).catch((error) => {
        console.error('PWA Hook: Service Worker error', error);
      });
    }

    // Chrome-specific: Force check for installability after a delay
    setTimeout(() => {
      if (!isInstallable && !isInstalled) {
        console.log('PWA Hook: Checking Chrome installability criteria');
        // In Chrome, the app needs to meet specific criteria
        // Log current state for debugging
        console.log('PWA Hook: Current state', {
          hasServiceWorker: 'serviceWorker' in navigator,
          hasManifest: document.querySelector('link[rel="manifest"]') !== null,
          isHTTPS: location.protocol === 'https:' || location.hostname === 'localhost',
          userAgent: navigator.userAgent
        });
      }
    }, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      console.log('PWA Hook: No deferred prompt available');
      return false;
    }

    try {
      console.log('PWA Hook: Showing install prompt');
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log('PWA Hook: User choice:', outcome);
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('PWA Hook: Error installing app:', error);
      return false;
    }
  };

  return {
    isInstallable,
    isInstalled,
    isOnline,
    installApp
  };
}
