import { useState, useRef, useEffect, ReactNode } from 'react';
import { hapticFeedback, hapticPatterns, isMobile, detectSwipe, getSafeAreaInsets } from '../lib/mobile-utils';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  snapPoints?: number[]; // Percentage heights [30, 60, 90]
  initialSnap?: number; // Index of initial snap point
  enableBackdropClose?: boolean;
  enableSwipeDown?: boolean;
  className?: string;
  backdropClassName?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [30, 60, 90],
  initialSnap = 1,
  enableBackdropClose = true,
  enableSwipeDown = true,
  className = '',
  backdropClassName = ''
}: BottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(initialSnap);
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [startY, setStartY] = useState(0);
  const [startTime, setStartTime] = useState(0);
  
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  
  const safeAreaInsets = getSafeAreaInsets();
  
  // Calculate sheet height based on snap point
  const getSheetHeight = (snapIndex: number): number => {
    return snapPoints[snapIndex] || snapPoints[0];
  };
  
  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enableSwipeDown) return;
    
    const touch = e.touches[0];
    setStartY(touch.clientY);
    setStartTime(Date.now());
    setIsDragging(true);
    hapticFeedback(hapticPatterns.light);
  };
  
  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !enableSwipeDown) return;
    
    const touch = e.touches[0];
    const deltaY = touch.clientY - startY;
    
    // Only allow downward dragging
    if (deltaY > 0) {
      setDragY(deltaY);
      e.preventDefault();
    }
  };
  
  // Handle touch end
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging || !enableSwipeDown) return;
    
    const touch = e.changedTouches[0];
    const endTime = Date.now();
    
    // Detect swipe gesture
    const swipe = detectSwipe(
      { clientX: 0, clientY: startY } as Touch,
      { clientX: 0, clientY: touch.clientY } as Touch,
      startTime,
      endTime
    );
    
    // Determine action based on swipe or drag distance
    const dragDistance = dragY;
    const threshold = window.innerHeight * 0.2; // 20% of screen height
    
    if (
      (swipe && swipe.direction === 'down' && swipe.velocity > 0.3) ||
      dragDistance > threshold
    ) {
      if (currentSnap > 0) {
        // Snap to next lower point
        setCurrentSnap(currentSnap - 1);
        hapticFeedback(hapticPatterns.medium);
      } else {
        // Close if at lowest point
        hapticFeedback(hapticPatterns.success);
        onClose();
      }
    } else if (dragDistance > 50) {
      // Small drag, snap to current position
      hapticFeedback(hapticPatterns.light);
    }
    
    // Reset drag state
    setIsDragging(false);
    setDragY(0);
    setStartY(0);
    setStartTime(0);
  };
  
  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (enableBackdropClose && e.target === backdropRef.current) {
      hapticFeedback(hapticPatterns.light);
      onClose();
    }
  };
  
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);
  
  // Reset snap when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentSnap(initialSnap);
    }
  }, [isOpen, initialSnap]);
  
  if (!isOpen) return null;
  
  const currentHeight = getSheetHeight(currentSnap);
  const transform = isDragging ? `translateY(${dragY}px)` : '';
  
  // Mobile-first: Use bottom sheet on mobile, modal on desktop
  if (!isMobile()) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={backdropRef}
          className={`absolute inset-0 bg-black bg-opacity-50 ${backdropClassName}`}
          onClick={handleBackdropClick}
        />
        <div className={`relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden ${className}`}>
          {title && (
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                <button
                  onClick={() => {
                    hapticFeedback(hapticPatterns.light);
                    onClose();
                  }}
                  className="text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            </div>
          )}
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            {children}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? 'bg-opacity-50' : 'bg-opacity-0'
        } ${backdropClassName}`}
        onClick={handleBackdropClick}
      />
      
      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl transition-all duration-300 ${className}`}
        style={{
          height: `${currentHeight}vh`,
          transform,
          paddingBottom: safeAreaInsets.bottom
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle */}
        {enableSwipeDown && (
          <div className="flex justify-center py-3">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>
        )}
        
        {/* Header */}
        {title && (
          <div className="px-6 pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              <button
                onClick={() => {
                  hapticFeedback(hapticPatterns.light);
                  onClose();
                }}
                className="text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close"
              >
                ×
              </button>
            </div>
          </div>
        )}
        
        {/* Content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto"
          style={{
            maxHeight: `${currentHeight - (title ? 20 : 10)}vh`
          }}
        >
          {children}
        </div>
        
        {/* Snap Point Indicators */}
        {snapPoints.length > 1 && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 space-y-2">
            {snapPoints.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentSnap(index);
                  hapticFeedback(hapticPatterns.light);
                }}
                className={`w-2 h-8 rounded-full transition-colors ${
                  index === currentSnap ? 'bg-purple-600' : 'bg-gray-300'
                }`}
                aria-label={`Snap to ${snapPoints[index]}% height`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Preset bottom sheet configurations
export function CameraBottomSheet({ isOpen, onClose, children }: { 
  isOpen: boolean; 
  onClose: () => void; 
  children: ReactNode;
}) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={[40, 70, 95]}
      initialSnap={2}
      title="Camera Capture"
      enableSwipeDown={true}
      className="camera-bottom-sheet"
    >
      {children}
    </BottomSheet>
  );
}

export function WardrobeBottomSheet({ isOpen, onClose, children }: { 
  isOpen: boolean; 
  onClose: () => void; 
  children: ReactNode;
}) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={[30, 60, 90]}
      initialSnap={1}
      title="My Wardrobe"
      enableSwipeDown={true}
      className="wardrobe-bottom-sheet"
    >
      {children}
    </BottomSheet>
  );
}

export function OutfitBottomSheet({ isOpen, onClose, children }: { 
  isOpen: boolean; 
  onClose: () => void; 
  children: ReactNode;
}) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={[25, 50, 85]}
      initialSnap={1}
      title="Outfit Builder"
      enableSwipeDown={true}
      className="outfit-bottom-sheet"
    >
      {children}
    </BottomSheet>
  );
}

export default BottomSheet;