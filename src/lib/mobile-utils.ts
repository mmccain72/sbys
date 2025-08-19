// Mobile-first PWA utilities for enhanced user experience

// Device detection
export const isIOS = (): boolean => /iPad|iPhone|iPod/.test(navigator.userAgent);
export const isAndroid = (): boolean => /Android/.test(navigator.userAgent);
export const isMobile = (): boolean => isIOS() || isAndroid() || window.innerWidth <= 768;
export const isStandalone = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
};

// Touch and haptic feedback
export const supportsVibration = (): boolean => 'vibrate' in navigator;
export const hapticFeedback = (pattern: number | number[] = 50): void => {
  if (supportsVibration()) {
    navigator.vibrate(pattern);
  }
};

// Haptic patterns for different interactions
export const hapticPatterns = {
  light: 25,
  medium: 50,
  heavy: 100,
  success: [75, 25, 75],
  error: [100, 50, 100, 50, 100],
  warning: [50, 25, 50],
  selection: 25,
  impact: [50, 25, 100]
};

// Touch target size validation (minimum 44px for accessibility)
export const ensureMinTouchTarget = (element: HTMLElement): void => {
  const minSize = 44;
  const rect = element.getBoundingClientRect();
  
  if (rect.width < minSize || rect.height < minSize) {
    element.style.minWidth = `${minSize}px`;
    element.style.minHeight = `${minSize}px`;
  }
};

// Safe area handling for iOS notch
export const getSafeAreaInsets = () => {
  if (!isIOS()) return { top: 0, right: 0, bottom: 0, left: 0 };
  
  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue('--sat') || '0'),
    right: parseInt(style.getPropertyValue('--sar') || '0'),
    bottom: parseInt(style.getPropertyValue('--sab') || '0'),
    left: parseInt(style.getPropertyValue('--sal') || '0')
  };
};

// Network detection
export const getNetworkInfo = () => {
  const connection = (navigator as any).connection || 
                    (navigator as any).mozConnection || 
                    (navigator as any).webkitConnection;
  
  if (connection) {
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    };
  }
  
  return {
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
    saveData: false
  };
};

// Battery API
export const getBatteryInfo = async () => {
  if ('getBattery' in navigator) {
    try {
      const battery = await (navigator as any).getBattery();
      return {
        level: battery.level,
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime
      };
    } catch (error) {
      console.warn('Battery API not available:', error);
    }
  }
  return null;
};

// Camera capabilities
export const getCameraCapabilities = async () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return { supported: false };
  }
  
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    
    return {
      supported: true,
      deviceCount: videoDevices.length,
      hasEnvironmentCamera: videoDevices.some(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('environment')
      ),
      devices: videoDevices.map(device => ({
        id: device.deviceId,
        label: device.label,
        groupId: device.groupId
      }))
    };
  } catch (error) {
    return { supported: false, error: error.message };
  }
};

// Image optimization
export const optimizeImageForMobile = (
  canvas: HTMLCanvasElement,
  maxWidth: number = 1024,
  maxHeight: number = 1024,
  quality: number = 0.8
): string => {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');
  
  const { width, height } = canvas;
  let newWidth = width;
  let newHeight = height;
  
  // Calculate new dimensions
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    newWidth = width * ratio;
    newHeight = height * ratio;
  }
  
  // Create new canvas for optimized image
  const optimizedCanvas = document.createElement('canvas');
  optimizedCanvas.width = newWidth;
  optimizedCanvas.height = newHeight;
  
  const optimizedCtx = optimizedCanvas.getContext('2d');
  if (!optimizedCtx) throw new Error('Optimized canvas context not available');
  
  // Draw optimized image
  optimizedCtx.drawImage(canvas, 0, 0, newWidth, newHeight);
  
  // Return as WebP if supported, otherwise JPEG
  const format = optimizedCanvas.toDataURL('image/webp').indexOf('data:image/webp') === 0 
    ? 'image/webp' 
    : 'image/jpeg';
    
  return optimizedCanvas.toDataURL(format, quality);
};

// Service Worker communication
export const sendMessageToSW = (message: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!navigator.serviceWorker.controller) {
      reject(new Error('No service worker controller'));
      return;
    }
    
    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = (event) => {
      if (event.data.error) {
        reject(new Error(event.data.error));
      } else {
        resolve(event.data);
      }
    };
    
    navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
  });
};

// Cache management
export const preloadImages = async (urls: string[]): Promise<void> => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      await sendMessageToSW({
        type: 'PRELOAD_IMAGES',
        data: { urls }
      });
    } catch (error) {
      console.warn('Failed to preload images via SW:', error);
    }
  }
};

export const cacheWardrobeImage = async (url: string, id: string): Promise<void> => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      await sendMessageToSW({
        type: 'CACHE_WARDROBE_IMAGE',
        data: { url, id }
      });
    } catch (error) {
      console.warn('Failed to cache wardrobe image:', error);
    }
  }
};

// Gesture detection
export interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
  duration: number;
}

export const detectSwipe = (
  startTouch: Touch,
  endTouch: Touch,
  startTime: number,
  endTime: number
): SwipeGesture | null => {
  const deltaX = endTouch.clientX - startTouch.clientX;
  const deltaY = endTouch.clientY - startTouch.clientY;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  const duration = endTime - startTime;
  const velocity = distance / duration;
  
  // Minimum distance and velocity for swipe
  if (distance < 50 || velocity < 0.1) return null;
  
  // Determine direction
  let direction: 'left' | 'right' | 'up' | 'down';
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    direction = deltaX > 0 ? 'right' : 'left';
  } else {
    direction = deltaY > 0 ? 'down' : 'up';
  }
  
  return { direction, distance, velocity, duration };
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void | Promise<void>) => {
  const start = performance.now();
  
  const finish = () => {
    const end = performance.now();
    const duration = end - start;
    console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
    
    // Report to analytics if available
    if ((window as any).gtag) {
      (window as any).gtag('event', 'timing_complete', {
        name,
        value: Math.round(duration)
      });
    }
  };
  
  const result = fn();
  
  if (result instanceof Promise) {
    return result.then((value) => {
      finish();
      return value;
    }).catch((error) => {
      finish();
      throw error;
    });
  } else {
    finish();
    return result;
  }
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };
  
  return new IntersectionObserver(callback, defaultOptions);
};

// Orientation handling
export const getOrientation = (): 'portrait' | 'landscape' => {
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
};

export const onOrientationChange = (callback: (orientation: 'portrait' | 'landscape') => void) => {
  const handler = () => callback(getOrientation());
  
  window.addEventListener('orientationchange', handler);
  window.addEventListener('resize', handler);
  
  return () => {
    window.removeEventListener('orientationchange', handler);
    window.removeEventListener('resize', handler);
  };
};

// Device motion and stability
export const requestDeviceMotionPermission = async (): Promise<boolean> => {
  if (isIOS() && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
    try {
      const response = await (DeviceMotionEvent as any).requestPermission();
      return response === 'granted';
    } catch (error) {
      console.warn('Device motion permission denied:', error);
      return false;
    }
  }
  return true; // Already granted or not needed
};

export const isDeviceStable = (motion: DeviceMotionEvent): boolean => {
  if (!motion.accelerationIncludingGravity) return true;
  
  const { x = 0, y = 0, z = 0 } = motion.accelerationIncludingGravity;
  const totalAcceleration = Math.sqrt(x * x + y * y + z * z);
  
  // Consider stable if total acceleration is close to gravity (9.8 m/s²)
  return Math.abs(totalAcceleration - 9.8) < 2;
};

// Error reporting
export const reportError = (error: Error, context: string) => {
  console.error(`PWA Error in ${context}:`, error);
  
  // Report to analytics or error tracking service
  if ((window as any).gtag) {
    (window as any).gtag('event', 'exception', {
      description: `${context}: ${error.message}`,
      fatal: false
    });
  }
  
  // Could also send to Sentry, LogRocket, etc.
};

export default {
  isIOS,
  isAndroid,
  isMobile,
  isStandalone,
  hapticFeedback,
  hapticPatterns,
  ensureMinTouchTarget,
  getSafeAreaInsets,
  getNetworkInfo,
  getBatteryInfo,
  getCameraCapabilities,
  optimizeImageForMobile,
  sendMessageToSW,
  preloadImages,
  cacheWardrobeImage,
  detectSwipe,
  measurePerformance,
  createIntersectionObserver,
  getOrientation,
  onOrientationChange,
  requestDeviceMotionPermission,
  isDeviceStable,
  reportError
};