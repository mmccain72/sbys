import { useState, useRef, useEffect } from 'react';
import { createIntersectionObserver, isMobile } from '../lib/mobile-utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  blurDataURL?: string;
  quality?: number;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  sizes?: string;
  loading?: 'lazy' | 'eager';
}

export function LazyImage({
  src,
  alt,
  className = '',
  style,
  placeholder,
  blurDataURL,
  quality = 85,
  priority = false,
  onLoad,
  onError,
  sizes = '100vw',
  loading = 'lazy'
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate optimized image URL based on device capabilities
  const getOptimizedSrc = (originalSrc: string): string => {
    if (!originalSrc) return '';
    
    // If it's a data URL, return as-is
    if (originalSrc.startsWith('data:')) return originalSrc;
    
    // For external URLs, add optimization parameters if possible
    const url = new URL(originalSrc, window.location.origin);
    
    // Mobile optimization
    if (isMobile()) {
      url.searchParams.set('w', '800');
      url.searchParams.set('q', quality.toString());
      url.searchParams.set('f', 'webp');
    } else {
      url.searchParams.set('w', '1200');
      url.searchParams.set('q', quality.toString());
      url.searchParams.set('f', 'webp');
    }
    
    return url.toString();
  };

  // Setup intersection observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    observerRef.current = createIntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority]);

  // Load image when in view
  useEffect(() => {
    if (!isInView || !src) return;

    const optimizedSrc = getOptimizedSrc(src);
    
    // Preload the image
    const img = new Image();
    
    img.onload = () => {
      setCurrentSrc(optimizedSrc);
      setIsLoaded(true);
      onLoad?.();
    };
    
    img.onerror = () => {
      setError(true);
      onError?.();
      // Fallback to original src
      setCurrentSrc(src);
    };
    
    img.src = optimizedSrc;
  }, [isInView, src, quality, onLoad, onError]);

  // Generate placeholder styles
  const placeholderStyle: React.CSSProperties = {
    backgroundColor: '#f3f4f6',
    backgroundImage: blurDataURL ? `url(${blurDataURL})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: blurDataURL ? 'blur(5px)' : undefined,
    transition: 'all 0.3s ease',
    ...style
  };

  const imageStyle: React.CSSProperties = {
    opacity: isLoaded ? 1 : 0,
    transition: 'opacity 0.3s ease',
    ...style
  };

  // Error fallback
  if (error && !currentSrc) {
    return (
      <div
        ref={imgRef}
        className={`${className} flex items-center justify-center bg-gray-100 text-gray-400`}
        style={{ ...style, minHeight: '200px' }}
        role="img"
        aria-label={alt}
      >
        <svg
          className="w-12 h-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* Placeholder */}
      {!isLoaded && (
        <div
          className={`${className} absolute inset-0`}
          style={placeholderStyle}
        >
          {placeholder && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-gray-500 text-sm">{placeholder}</span>
            </div>
          )}
          {/* Loading animation */}
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        </div>
      )}
      
      {/* Actual image */}
      {isInView && (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          className={className}
          style={imageStyle}
          loading={loading}
          sizes={sizes}
          decoding="async"
          onLoad={() => {
            setIsLoaded(true);
            onLoad?.();
          }}
          onError={() => {
            setError(true);
            onError?.();
          }}
        />
      )}
    </div>
  );
}

// Higher-order component for wardrobe images
export function WardrobeImage({ 
  src, 
  alt, 
  className = "w-full h-full object-cover",
  ...props 
}: LazyImageProps) {
  return (
    <LazyImage
      src={src}
      alt={alt}
      className={className}
      quality={isMobile() ? 75 : 85}
      placeholder="Loading..."
      {...props}
    />
  );
}

// Product image component with specific optimizations
export function ProductImage({ 
  src, 
  alt, 
  className = "w-full h-48 object-cover",
  ...props 
}: LazyImageProps) {
  return (
    <LazyImage
      src={src}
      alt={alt}
      className={className}
      quality={80}
      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
      {...props}
    />
  );
}

export default LazyImage;