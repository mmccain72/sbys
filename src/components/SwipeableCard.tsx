import React, { useState, useRef, useEffect } from 'react';
import { hapticFeedback, hapticPatterns, detectSwipe, isMobile } from '../lib/mobile-utils';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  className?: string;
  swipeThreshold?: number;
  hapticEnabled?: boolean;
  leftActionIcon?: string;
  rightActionIcon?: string;
  leftActionColor?: string;
  rightActionColor?: string;
  showSwipeHints?: boolean;
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onTap,
  onDoubleTap,
  onLongPress,
  disabled = false,
  className = '',
  swipeThreshold = 80,
  hapticEnabled = true,
  leftActionIcon = '❤️',
  rightActionIcon = '📤',
  leftActionColor = 'bg-pink-500',
  rightActionColor = 'bg-blue-500',
  showSwipeHints = true
}: SwipeableCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showLeftAction, setShowLeftAction] = useState(false);
  const [showRightAction, setShowRightAction] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [showHints, setShowHints] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const startTime = useRef(0);
  const longPressTimer = useRef<NodeJS.Timeout>();
  const doubleTapTimer = useRef<NodeJS.Timeout>();
  const hintsTimer = useRef<NodeJS.Timeout>();

  // Show hints after a delay if swipe actions are available
  useEffect(() => {
    if (showSwipeHints && (onSwipeLeft || onSwipeRight) && isMobile()) {
      hintsTimer.current = setTimeout(() => {
        setShowHints(true);
        setTimeout(() => setShowHints(false), 3000);
      }, 2000);
    }
    
    return () => {
      if (hintsTimer.current) clearTimeout(hintsTimer.current);
    };
  }, [showSwipeHints, onSwipeLeft, onSwipeRight]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    
    const touch = e.touches[0];
    startPos.current = { x: touch.clientX, y: touch.clientY };
    startTime.current = Date.now();
    setIsDragging(true);
    
    if (hapticEnabled) {
      hapticFeedback(hapticPatterns.light);
    }

    // Start long press timer
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        if (hapticEnabled) {
          hapticFeedback(hapticPatterns.heavy);
        }
        onLongPress();
        setIsDragging(false);
      }, 500);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || disabled) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - startPos.current.x;
    const deltaY = touch.clientY - startPos.current.y;
    
    // Clear long press if user moves
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    // Only allow horizontal swipes if we have horizontal actions
    if (onSwipeLeft || onSwipeRight) {
      setDragOffset({ x: deltaX * 0.8, y: 0 }); // Add resistance
      
      // Show action hints
      if (Math.abs(deltaX) > 20) {
        setShowLeftAction(deltaX > 0 && !!onSwipeRight);
        setShowRightAction(deltaX < 0 && !!onSwipeLeft);
        
        // Haptic feedback at threshold
        if (Math.abs(deltaX) > swipeThreshold && hapticEnabled) {
          hapticFeedback(hapticPatterns.medium);
        }
      }
    } else if (onSwipeUp || onSwipeDown) {
      setDragOffset({ x: 0, y: deltaY * 0.8 });
    }

    // Prevent scrolling during horizontal swipes
    if (Math.abs(deltaX) > Math.abs(deltaY) && (onSwipeLeft || onSwipeRight)) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging || disabled) return;
    
    const touch = e.changedTouches[0];
    const endTime = Date.now();
    
    // Clear timers
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    // Detect swipe
    const swipe = detectSwipe(
      { clientX: startPos.current.x, clientY: startPos.current.y } as Touch,
      touch,
      startTime.current,
      endTime
    );

    if (swipe && swipe.distance > swipeThreshold) {
      // Execute swipe action
      if (hapticEnabled) {
        hapticFeedback(hapticPatterns.success);
      }
      
      switch (swipe.direction) {
        case 'left':
          onSwipeLeft?.();
          break;
        case 'right':
          onSwipeRight?.();
          break;
        case 'up':
          onSwipeUp?.();
          break;
        case 'down':
          onSwipeDown?.();
          break;
      }
    } else {
      // Handle tap/double tap
      const duration = endTime - startTime.current;
      const distance = Math.sqrt(
        Math.pow(touch.clientX - startPos.current.x, 2) +
        Math.pow(touch.clientY - startPos.current.y, 2)
      );
      
      if (duration < 300 && distance < 10) {
        setTapCount(prev => prev + 1);
        
        if (doubleTapTimer.current) {
          clearTimeout(doubleTapTimer.current);
        }
        
        doubleTapTimer.current = setTimeout(() => {
          if (tapCount === 1) {
            if (hapticEnabled) {
              hapticFeedback(hapticPatterns.light);
            }
            onTap?.();
          } else if (tapCount >= 2) {
            if (hapticEnabled) {
              hapticFeedback(hapticPatterns.medium);
            }
            onDoubleTap?.();
          }
          setTapCount(0);
        }, 300);
      }
    }

    // Reset state
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
    setShowLeftAction(false);
    setShowRightAction(false);
  };

  const cardStyle = {
    transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) ${
      isDragging ? 'scale(1.02)' : 'scale(1)'
    }`,
    transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  return (
    <div className="relative overflow-hidden">
      {/* Left action background */}
      {onSwipeRight && (
        <div className={`absolute inset-y-0 left-0 ${leftActionColor} flex items-center justify-start pl-6 transition-all duration-200 ${
          showLeftAction ? 'w-full opacity-100' : 'w-0 opacity-0'
        }`}>
          <span className="text-white text-2xl">{leftActionIcon}</span>
        </div>
      )}
      
      {/* Right action background */}
      {onSwipeLeft && (
        <div className={`absolute inset-y-0 right-0 ${rightActionColor} flex items-center justify-end pr-6 transition-all duration-200 ${
          showRightAction ? 'w-full opacity-100' : 'w-0 opacity-0'
        }`}>
          <span className="text-white text-2xl">{rightActionIcon}</span>
        </div>
      )}

      {/* Main card */}
      <div
        ref={cardRef}
        className={`relative bg-white z-10 ${className} ${
          isDragging ? 'shadow-2xl' : 'shadow-lg'
        } transition-shadow duration-200`}
        style={cardStyle}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
        
        {/* Swipe hints */}
        {showHints && isMobile() && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 animate-slide-in-up">
            <div className="bg-white rounded-lg p-4 mx-4 text-center">
              <p className="text-sm text-gray-700 mb-2">Swipe gestures:</p>
              <div className="flex justify-center space-x-4 text-xs">
                {onSwipeRight && (
                  <div className="flex items-center">
                    <span className="mr-1">{leftActionIcon}</span>
                    <span>Right</span>
                  </div>
                )}
                {onSwipeLeft && (
                  <div className="flex items-center">
                    <span className="mr-1">{rightActionIcon}</span>
                    <span>Left</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Specialized swipeable components
export function SwipeableProductCard({
  product,
  onFavorite,
  onShare,
  onView,
  className = ''
}: {
  product: any;
  onFavorite: () => void;
  onShare: () => void;
  onView: () => void;
  className?: string;
}) {
  return (
    <SwipeableCard
      onSwipeRight={onFavorite}
      onSwipeLeft={onShare}
      onTap={onView}
      leftActionIcon="💖"
      rightActionIcon="📤"
      leftActionColor="bg-pink-500"
      rightActionColor="bg-blue-500"
      className={className}
      showSwipeHints={true}
    >
      <div className="p-4">
        {product.imageUrls?.[0] && (
          <img
            src={product.imageUrls[0]}
            alt={product.name}
            className="w-full h-48 object-cover rounded-lg mb-3"
          />
        )}
        <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
        <p className="text-purple-600 font-bold">${product.price}</p>
      </div>
    </SwipeableCard>
  );
}

export function SwipeableOutfitCard({
  outfit,
  onEdit,
  onDelete,
  onSchedule,
  className = ''
}: {
  outfit: any;
  onEdit: () => void;
  onDelete: () => void;
  onSchedule: () => void;
  className?: string;
}) {
  return (
    <SwipeableCard
      onSwipeRight={onEdit}
      onSwipeLeft={onDelete}
      onTap={onSchedule}
      leftActionIcon="✏️"
      rightActionIcon="🗑️"
      leftActionColor="bg-blue-500"
      rightActionColor="bg-red-500"
      className={className}
    >
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2">{outfit.name}</h3>
        <div className="flex space-x-2">
          {outfit.products?.slice(0, 3).map((product: any, index: number) => (
            <div key={index} className="w-12 h-12 bg-gray-200 rounded-lg">
              {product.imageUrls?.[0] && (
                <img
                  src={product.imageUrls[0]}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </SwipeableCard>
  );
}

// Hook for managing swipe gestures
export function useSwipeGestures(
  elementRef: React.RefObject<HTMLElement>,
  handlers: {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
  },
  options: {
    threshold?: number;
    hapticEnabled?: boolean;
  } = {}
) {
  const { threshold = 80, hapticEnabled = true } = options;
  const startPos = useRef({ x: 0, y: 0 });
  const startTime = useRef(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !isMobile()) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startPos.current = { x: touch.clientX, y: touch.clientY };
      startTime.current = Date.now();
      
      if (hapticEnabled) {
        hapticFeedback(hapticPatterns.light);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      const endTime = Date.now();
      
      const swipe = detectSwipe(
        { clientX: startPos.current.x, clientY: startPos.current.y } as Touch,
        touch,
        startTime.current,
        endTime
      );

      if (swipe && swipe.distance > threshold) {
        if (hapticEnabled) {
          hapticFeedback(hapticPatterns.medium);
        }
        
        switch (swipe.direction) {
          case 'left':
            handlers.onSwipeLeft?.();
            break;
          case 'right':
            handlers.onSwipeRight?.();
            break;
          case 'up':
            handlers.onSwipeUp?.();
            break;
          case 'down':
            handlers.onSwipeDown?.();
            break;
        }
      }
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handlers, threshold, hapticEnabled]);
}