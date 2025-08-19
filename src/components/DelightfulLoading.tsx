import React from 'react';

interface DelightfulLoadingProps {
  type?: 'wardrobe' | 'color-analysis' | 'outfit-building' | 'shopping' | 'camera';
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function DelightfulLoading({ 
  type = 'shopping', 
  message,
  size = 'md' 
}: DelightfulLoadingProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-2xl',
    md: 'w-16 h-16 text-4xl', 
    lg: 'w-24 h-24 text-6xl'
  };

  const animations = {
    wardrobe: {
      emoji: '👗',
      animation: 'animate-bounce',
      message: 'Organizing your wardrobe...',
      bgGradient: 'from-purple-100 to-pink-100'
    },
    'color-analysis': {
      emoji: '🎨',
      animation: 'animate-spin',
      message: 'Analyzing your perfect colors...',
      bgGradient: 'from-blue-100 to-indigo-100'
    },
    'outfit-building': {
      emoji: '✨',
      animation: 'animate-pulse',
      message: 'Creating your perfect look...',
      bgGradient: 'from-pink-100 to-purple-100'
    },
    shopping: {
      emoji: '🛍️',
      animation: 'animate-bounce',
      message: 'Finding amazing products...',
      bgGradient: 'from-green-100 to-emerald-100'
    },
    camera: {
      emoji: '📸',
      animation: 'animate-pulse',
      message: 'Processing your photo...',
      bgGradient: 'from-yellow-100 to-orange-100'
    }
  };

  const config = animations[type];

  return (
    <div className={`flex flex-col items-center justify-center p-8 bg-gradient-to-br ${config.bgGradient} rounded-2xl`}>
      {/* Animated Icon */}
      <div className={`${sizeClasses[size]} ${config.animation} flex items-center justify-center mb-4`}>
        <span>{config.emoji}</span>
      </div>
      
      {/* Shimmer Effect */}
      <div className="relative overflow-hidden bg-gray-200 rounded-full h-2 w-32 mb-4">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer" 
             style={{
               animation: 'shimmer 1.5s infinite',
               transform: 'translateX(-100%)'
             }} />
      </div>
      
      {/* Message */}
      <p className="text-gray-700 text-center font-medium">
        {message || config.message}
      </p>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="animate-float-1 absolute top-4 left-4 text-2xl opacity-20">
          {type === 'wardrobe' ? '👔' : type === 'color-analysis' ? '🌈' : '💫'}
        </div>
        <div className="animate-float-2 absolute top-8 right-8 text-xl opacity-30">
          {type === 'shopping' ? '💎' : type === 'outfit-building' ? '👠' : '✨'}
        </div>
        <div className="animate-float-3 absolute bottom-6 left-8 text-lg opacity-25">
          {type === 'camera' ? '🎭' : '🦋'}
        </div>
      </div>
    </div>
  );
}

// Skeleton components for different content types
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
      <div className="h-64 bg-gradient-to-br from-gray-200 to-gray-300" />
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded mb-2" />
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
        <div className="h-8 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export function OutfitCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
      <div className="flex space-x-3 mb-3">
        <div className="w-12 h-12 bg-gray-200 rounded" />
        <div className="w-12 h-12 bg-gray-200 rounded" />
        <div className="w-12 h-12 bg-gray-200 rounded" />
      </div>
      <div className="h-4 bg-gray-200 rounded mb-2" />
      <div className="h-3 bg-gray-200 rounded w-3/4" />
    </div>
  );
}

export function ChatMessageSkeleton() {
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-xs bg-gray-100 rounded-2xl p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded mb-2" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
  );
}