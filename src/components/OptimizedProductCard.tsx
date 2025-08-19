import React, { useState, useCallback } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface ProductCardProps {
  product: {
    _id: Id<'products'>;
    name: string;
    price: number;
    retailer: string;
    colors: string[];
    seasonalTypes: string[];
    imageUrls: string[];
    amazonUrl?: string;
    retailerUrl?: string;
  };
  onToggleFavorite: () => void;
  onShare: () => void;
  onViewDetails: () => void;
}

// Memoized ProductCard component with lazy loading
export const OptimizedProductCard = React.memo(({ 
  product, 
  onToggleFavorite, 
  onShare, 
  onViewDetails 
}: ProductCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Early return if product is invalid
  if (!product || typeof product !== 'object' || !product._id) {
    return null;
  }

  const isFavorited = useQuery(api.products.isProductFavorited, { productId: product._id });

  const getSeasonalTypeColor = useCallback((type: string) => {
    const colors: Record<string, string> = {
      Winter: "bg-blue-100 text-blue-800",
      Spring: "bg-green-100 text-green-800",
      Summer: "bg-yellow-100 text-yellow-800",
      Autumn: "bg-orange-100 text-orange-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  }, []);

  // Safely process product arrays
  const colors = Array.isArray(product.colors) ? product.colors.filter((color: any) => color && typeof color === 'string') : [];
  const seasonalTypes = Array.isArray(product.seasonalTypes) ? product.seasonalTypes.filter((type: any) => type && typeof type === 'string') : [];
  const imageUrls = Array.isArray(product.imageUrls) ? product.imageUrls.filter((url: any) => url && typeof url === 'string') : [];

  // Memoized event handlers to prevent re-renders
  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite();
  }, [onToggleFavorite]);

  const handleShareClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onShare();
  }, [onShare]);

  const handleShopClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Product Image with Lazy Loading */}
      <div 
        className="relative h-64 bg-gray-100 cursor-pointer"
        onClick={onViewDetails}
      >
        {imageUrls.length > 0 && !imageError ? (
          <>
            {/* Placeholder while loading */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
                <div className="text-gray-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            )}
            <img
              src={imageUrls[0]}
              alt={product.name || 'Product'}
              className={`w-full h-full object-cover transition-all duration-200 ${
                imageLoaded ? 'opacity-100 hover:scale-105' : 'opacity-0'
              }`}
              loading="lazy"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
            <span className="text-4xl">👗</span>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex space-x-2">
          <button
            onClick={handleFavoriteClick}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isFavorited
                ? "bg-pink-100 text-pink-600"
                : "bg-white/80 text-gray-600 hover:bg-pink-100 hover:text-pink-600"
            }`}
            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorited ? "❤️" : "🤍"}
          </button>
          <button
            onClick={handleShareClick}
            className="w-8 h-8 rounded-full bg-white/80 text-gray-600 hover:bg-purple-100 hover:text-purple-600 flex items-center justify-center transition-colors"
            aria-label="Share product"
          >
            📤
          </button>
        </div>

        {/* View Details Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center pointer-events-none">
          <div className="opacity-0 hover:opacity-100 transition-opacity duration-200">
            <span className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium shadow-lg">
              View Details
            </span>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 pb-6 cursor-pointer" onClick={onViewDetails}>
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-purple-600 transition-colors">
          {product.name || 'Unnamed Product'}
        </h3>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-purple-600">
            ${product.price || '0'}
          </span>
          <span className="text-sm text-gray-500">{product.retailer || 'Unknown'}</span>
        </div>

        {/* Colors */}
        {colors.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {colors.slice(0, 4).map((color: string, index: number) => (
              <span
                key={`${color}-${index}`}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
              >
                {color}
              </span>
            ))}
            {colors.length > 4 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                +{colors.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Seasonal Types */}
        {seasonalTypes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {seasonalTypes.map((type: string, index: number) => (
              <span
                key={`${type}-${index}`}
                className={`px-2 py-1 rounded text-xs ${getSeasonalTypeColor(type)}`}
              >
                {type}
              </span>
            ))}
          </div>
        )}

        {/* Shop Button */}
        <a
          href={product.amazonUrl || product.retailerUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleShopClick}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-center block"
        >
          {product.amazonUrl ? 'Shop on Amazon' : 'Shop Now'}
        </a>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  // Only re-render if these specific props change
  return (
    prevProps.product._id === nextProps.product._id &&
    prevProps.product.name === nextProps.product.name &&
    prevProps.product.price === nextProps.product.price &&
    JSON.stringify(prevProps.product.imageUrls) === JSON.stringify(nextProps.product.imageUrls) &&
    prevProps.onToggleFavorite === nextProps.onToggleFavorite &&
    prevProps.onShare === nextProps.onShare &&
    prevProps.onViewDetails === nextProps.onViewDetails
  );
});

OptimizedProductCard.displayName = 'OptimizedProductCard';

// Lazy loading image component for additional optimization
export const LazyImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
}> = React.memo(({ src, alt, className = '', fallback }) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before the image enters viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {!hasLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
      {isIntersecting && !hasError && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            hasLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setHasLoaded(true)}
          onError={() => {
            setHasError(true);
            setHasLoaded(true);
          }}
        />
      )}
      {hasError && fallback}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';