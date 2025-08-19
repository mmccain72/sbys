import React, { useState } from 'react';
import { hapticFeedback, hapticPatterns } from '../lib/mobile-utils';

interface DelightfulButtonProps {
  children: React.ReactNode;
  onClick?: () => void | Promise<void>;
  variant?: 'primary' | 'secondary' | 'success' | 'favorite' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  hapticType?: keyof typeof hapticPatterns;
  celebrateOnClick?: boolean;
  icon?: string;
  href?: string;
}

export function DelightfulButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  hapticType = 'light',
  celebrateOnClick = false,
  icon,
  href
}: DelightfulButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl',
    secondary: 'bg-white text-gray-700 border-2 border-gray-300 hover:border-purple-500 hover:text-purple-600',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600',
    favorite: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const handleClick = async () => {
    if (disabled || loading) return;

    // Haptic feedback
    hapticFeedback(hapticPatterns[hapticType]);
    
    // Visual feedback
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);

    // Celebration effect
    if (celebrateOnClick) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 1000);
    }

    // Execute click handler
    if (onClick) {
      await onClick();
    }
  };

  const baseClasses = `
    relative overflow-hidden rounded-lg font-medium transition-all duration-200 
    transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-purple-300
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    ${variants[variant]} ${sizes[size]} ${className}
  `;

  const buttonContent = (
    <>
      {/* Ripple effect */}
      <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-200" />
      
      {/* Celebration particles */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-celebration"
              style={{
                left: '50%',
                top: '50%',
                animationDelay: `${i * 0.1}s`,
                transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateY(-20px)`
              }}
            />
          ))}
        </div>
      )}

      <div className={`flex items-center justify-center space-x-2 ${isPressed ? 'scale-95' : ''} transition-transform`}>
        {loading ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : icon ? (
          <span className="text-lg">{icon}</span>
        ) : null}
        <span>{children}</span>
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={baseClasses}
        onClick={handleClick}
      >
        {buttonContent}
      </a>
    );
  }

  return (
    <button
      className={baseClasses}
      onClick={handleClick}
      disabled={disabled || loading}
    >
      {buttonContent}
    </button>
  );
}

// Specialized button variants
export function FavoriteButton({ 
  isFavorited, 
  onToggle,
  count,
  size = 'md'
}: { 
  isFavorited: boolean; 
  onToggle: () => void;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <DelightfulButton
      onClick={onToggle}
      variant={isFavorited ? 'favorite' : 'secondary'}
      size={size}
      icon={isFavorited ? '❤️' : '🤍'}
      hapticType={isFavorited ? 'success' : 'light'}
      celebrateOnClick={!isFavorited}
      className="transition-all duration-300"
    >
      {count !== undefined && count > 0 && (
        <span className="ml-1 text-sm opacity-75">{count}</span>
      )}
    </DelightfulButton>
  );
}

export function ShareButton({ 
  onShare,
  count,
  size = 'md'
}: { 
  onShare: () => void;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <DelightfulButton
      onClick={onShare}
      variant="secondary"
      size={size}
      icon="📤"
      hapticType="medium"
    >
      Share {count !== undefined && count > 0 && (
        <span className="ml-1 text-sm opacity-75">{count}</span>
      )}
    </DelightfulButton>
  );
}

export function AddToOutfitButton({ 
  onAdd,
  isAdded = false,
  size = 'md'
}: { 
  onAdd: () => void;
  isAdded?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <DelightfulButton
      onClick={onAdd}
      variant={isAdded ? 'success' : 'primary'}
      size={size}
      icon={isAdded ? '✅' : '✨'}
      hapticType={isAdded ? 'success' : 'medium'}
      celebrateOnClick={!isAdded}
    >
      {isAdded ? 'Added to Outfit' : 'Add to Outfit'}
    </DelightfulButton>
  );
}