import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { hapticFeedback, hapticPatterns } from '../lib/mobile-utils';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'celebration' | 'achievement';
  title: string;
  message?: string;
  icon?: string;
  duration?: number;
  actions?: NotificationAction[];
  progress?: number;
  persistent?: boolean;
}

interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary';
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  celebrateAction: (action: string, details?: any) => void;
  showAchievement: (achievement: Achievement) => void;
}

interface Achievement {
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Haptic feedback based on type
    switch (notification.type) {
      case 'success':
      case 'achievement':
        hapticFeedback(hapticPatterns.success);
        break;
      case 'error':
        hapticFeedback(hapticPatterns.error);
        break;
      case 'celebration':
        hapticFeedback(hapticPatterns.impact);
        break;
      default:
        hapticFeedback(hapticPatterns.light);
    }
    
    // Auto-remove non-persistent notifications
    if (!notification.persistent) {
      const duration = notification.duration || (notification.type === 'error' ? 5000 : 3000);
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const celebrateAction = (action: string, details?: any) => {
    const celebrations: Record<string, Omit<Notification, 'id'>> = {
      'item-favorited': {
        type: 'celebration',
        title: 'Added to Favorites!',
        message: 'You\'ll find this in your favorites collection',
        icon: '💖',
        duration: 2000
      },
      'outfit-saved': {
        type: 'celebration',
        title: 'Outfit Saved!',
        message: `"${details?.name}" is now in your wardrobe`,
        icon: '✨',
        duration: 2500
      },
      'wardrobe-item-added': {
        type: 'celebration',
        title: 'Added to Wardrobe!',
        message: 'Your personal collection is growing',
        icon: '👔',
        duration: 2000
      },
      'color-analysis-complete': {
        type: 'achievement',
        title: 'Color Analysis Complete!',
        message: `You're a ${details?.seasonalType}! Time to explore your perfect colors`,
        icon: '🎨',
        duration: 4000
      },
      'product-shared': {
        type: 'success',
        title: 'Shared Successfully!',
        message: 'Your friends will love this find',
        icon: '📤',
        duration: 2000
      },
      'outfit-scheduled': {
        type: 'success',
        title: 'Outfit Scheduled!',
        message: 'Your look is planned and ready',
        icon: '📅',
        duration: 2000
      }
    };

    const celebration = celebrations[action];
    if (celebration) {
      addNotification(celebration);
    }
  };

  const showAchievement = (achievement: Achievement) => {
    const rarityConfig = {
      common: { gradient: 'from-gray-400 to-gray-600', sparkles: '✨' },
      rare: { gradient: 'from-blue-400 to-blue-600', sparkles: '💫' },
      epic: { gradient: 'from-purple-400 to-purple-600', sparkles: '🌟' },
      legendary: { gradient: 'from-yellow-400 to-yellow-600', sparkles: '⭐' }
    };

    const config = rarityConfig[achievement.rarity];
    
    addNotification({
      type: 'achievement',
      title: `${config.sparkles} Achievement Unlocked!`,
      message: `${achievement.title}: ${achievement.description}`,
      icon: achievement.icon,
      duration: 5000,
      persistent: false
    });
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      celebrateAction,
      showAchievement
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map(notification => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

function NotificationCard({ 
  notification, 
  onClose 
}: { 
  notification: Notification; 
  onClose: () => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const getNotificationStyles = () => {
    const baseStyles = "relative overflow-hidden rounded-xl shadow-lg backdrop-blur-sm border";
    
    switch (notification.type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-green-200 text-green-800`;
      case 'error':
        return `${baseStyles} bg-red-50 border-red-200 text-red-800`;
      case 'celebration':
        return `${baseStyles} bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-800`;
      case 'achievement':
        return `${baseStyles} bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 text-yellow-800`;
      default:
        return `${baseStyles} bg-white border-gray-200 text-gray-800`;
    }
  };

  const getAnimationClasses = () => {
    if (isExiting) return 'animate-slide-out-right';
    if (isVisible) return 'animate-slide-in-right';
    return 'opacity-0 translate-x-full';
  };

  return (
    <div className={`${getNotificationStyles()} ${getAnimationClasses()} transition-all duration-300 p-4`}>
      {/* Celebration particles for special notifications */}
      {(notification.type === 'celebration' || notification.type === 'achievement') && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-celebration"
              style={{
                left: `${20 + i * 10}%`,
                top: `${20 + (i % 3) * 20}%`,
                animationDelay: `${i * 0.1}s`,
                '--rotation': `${i * 45}deg`
              } as any}
            />
          ))}
        </div>
      )}

      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          {notification.icon ? (
            <span className="text-2xl">{notification.icon}</span>
          ) : (
            <div className={`w-6 h-6 rounded-full ${
              notification.type === 'success' ? 'bg-green-500' :
              notification.type === 'error' ? 'bg-red-500' :
              notification.type === 'celebration' ? 'bg-purple-500' :
              notification.type === 'achievement' ? 'bg-yellow-500' :
              'bg-blue-500'
            }`} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
          {notification.message && (
            <p className="text-sm opacity-90 leading-relaxed">{notification.message}</p>
          )}
          
          {/* Progress bar */}
          {notification.progress !== undefined && (
            <div className="mt-2 bg-white bg-opacity-30 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-white bg-opacity-80 transition-all duration-300"
                style={{ width: `${notification.progress}%` }}
              />
            </div>
          )}

          {/* Actions */}
          {notification.actions && notification.actions.length > 0 && (
            <div className="mt-3 flex space-x-2">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    action.action();
                    if (!notification.persistent) handleClose();
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    action.variant === 'primary' 
                      ? 'bg-white bg-opacity-90 text-gray-800 hover:bg-opacity-100'
                      : 'bg-white bg-opacity-30 hover:bg-opacity-50'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 w-6 h-6 rounded-full bg-white bg-opacity-30 hover:bg-opacity-50 flex items-center justify-center text-xs font-bold transition-colors"
        >
          ×
        </button>
      </div>

      {/* Glow effect for special notifications */}
      {notification.type === 'achievement' && (
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-20 animate-glow" />
      )}
    </div>
  );
}

// Achievement definitions
export const achievements: Record<string, Achievement> = {
  'first-favorite': {
    title: 'First Love',
    description: 'Added your first item to favorites',
    icon: '💖',
    rarity: 'common'
  },
  'color-expert': {
    title: 'Color Expert',
    description: 'Completed your seasonal color analysis',
    icon: '🎨',
    rarity: 'rare'
  },
  'outfit-master': {
    title: 'Outfit Master',
    description: 'Created 5 amazing outfit combinations',
    icon: '👗',
    rarity: 'rare'
  },
  'wardrobe-curator': {
    title: 'Wardrobe Curator',
    description: 'Added 10 items to your personal wardrobe',
    icon: '👔',
    rarity: 'epic'
  },
  'social-butterfly': {
    title: 'Social Butterfly',
    description: 'Shared 10 items with friends',
    icon: '🦋',
    rarity: 'epic'
  },
  'style-legend': {
    title: 'Style Legend',
    description: 'Reached 100 favorites and became a true StyleSeason expert',
    icon: '👑',
    rarity: 'legendary'
  }
};

// Helper hook for easy celebration
export function useCelebrations() {
  const { celebrateAction, showAchievement } = useNotifications();
  
  const celebrate = (action: string, details?: any) => {
    celebrateAction(action, details);
    
    // Check for achievements
    // This would typically integrate with your app's state management
    // to track user progress and unlock achievements
  };
  
  return { celebrate, showAchievement };
}