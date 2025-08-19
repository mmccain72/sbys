// 🤏 STYLESSEASON 2025 GESTURE SYSTEM - Revolutionary Mobile Interactions

export interface GestureEvent {
  type: string;
  direction?: string;
  velocity?: number;
  distance?: number;
  element?: HTMLElement;
  data?: any;
}

export interface HapticPattern {
  type: 'success' | 'warning' | 'error' | 'selection' | 'impact' | 'notification';
  intensity?: number;
  duration?: number;
  pattern?: number[];
}

// 🎯 GESTURE VOCABULARY - Every swipe has meaning
export const gestureVocabulary = {
  // Product Card Interactions
  productCard: {
    swipeRight: {
      action: 'addToFavorites',
      feedback: 'Add to Style Vault ❤️',
      haptic: { type: 'success' as const, intensity: 70, duration: 100 },
      animation: 'slideOutRight',
      undo: true,
      undoText: 'Added to vault! Undo?'
    },
    swipeLeft: {
      action: 'notInterested',
      feedback: 'Not my vibe 👋',
      haptic: { type: 'selection' as const, intensity: 40, duration: 50 },
      animation: 'slideOutLeft',
      undo: true,
      undoText: 'Marked as not interested. Undo?'
    },
    swipeUp: {
      action: 'shareProduct',
      feedback: 'Share with tribe 📱',
      haptic: { type: 'impact' as const, intensity: 60, duration: 80 },
      animation: 'flyUp',
      undo: false
    },
    swipeDown: {
      action: 'saveForLater',
      feedback: 'Saved for later 📌',
      haptic: { type: 'selection' as const, intensity: 50, duration: 70 },
      animation: 'slideDown',
      undo: true,
      undoText: 'Saved for later. Undo?'
    },
    longPress: {
      action: 'showQuickActions',
      feedback: 'Quick actions menu',
      haptic: { type: 'impact' as const, intensity: 80, duration: 150 },
      animation: 'scaleUp',
      menu: ['Add to Outfit', 'Share', 'View Similar', 'Add to Wishlist']
    },
    doubleTap: {
      action: 'addToFavorites',
      feedback: 'Double tap love! ❤️❤️',
      haptic: { type: 'success' as const, pattern: [50, 30, 80] },
      animation: 'heartPop',
      undo: true
    },
    pinchOut: {
      action: 'viewFullscreen',
      feedback: 'Full screen view',
      haptic: { type: 'selection' as const, intensity: 30 },
      animation: 'zoomIn'
    },
    pinchIn: {
      action: 'exitFullscreen',
      feedback: 'Back to grid',
      haptic: { type: 'selection' as const, intensity: 30 },
      animation: 'zoomOut'
    }
  },

  // Outfit Creation Interactions
  outfitBuilder: {
    swipeRight: {
      action: 'approveItem',
      feedback: 'Perfect fit! ✨',
      haptic: { type: 'success' as const, intensity: 80, duration: 120 },
      animation: 'slideToOutfit'
    },
    swipeLeft: {
      action: 'rejectItem',
      feedback: 'Try something else 🔄',
      haptic: { type: 'warning' as const, intensity: 50, duration: 60 },
      animation: 'slideAway'
    },
    dragAndDrop: {
      action: 'organizeOutfit',
      feedback: 'Organizing your look...',
      haptic: { type: 'selection' as const, intensity: 40 },
      animation: 'magneticSnap'
    },
    shake: {
      action: 'shuffleOutfit',
      feedback: 'Shake for new inspiration! 🎲',
      haptic: { type: 'impact' as const, pattern: [100, 50, 100, 50, 100] },
      animation: 'shuffle'
    }
  },

  // Social Feed Interactions
  socialFeed: {
    swipeUp: {
      action: 'nextPost',
      feedback: 'Next look',
      haptic: { type: 'selection' as const, intensity: 30, duration: 40 },
      animation: 'slideUp'
    },
    swipeDown: {
      action: 'previousPost',
      feedback: 'Previous look',
      haptic: { type: 'selection' as const, intensity: 30, duration: 40 },
      animation: 'slideDown'
    },
    doubleTap: {
      action: 'likePost',
      feedback: 'Heart reaction! 💕',
      haptic: { type: 'success' as const, pattern: [60, 40, 80] },
      animation: 'heartBurst'
    },
    longPress: {
      action: 'showReactions',
      feedback: 'Choose reaction',
      haptic: { type: 'impact' as const, intensity: 70, duration: 100 },
      animation: 'reactionMenu',
      reactions: ['❤️', '🔥', '✨', '👑', '💎', '🦄']
    },
    swipeLeft: {
      action: 'sharePost',
      feedback: 'Share this look',
      haptic: { type: 'notification' as const, intensity: 60 },
      animation: 'shareModal'
    }
  },

  // Navigation Gestures
  navigation: {
    swipeFromLeft: {
      action: 'openSidebar',
      feedback: 'Navigation menu',
      haptic: { type: 'selection' as const, intensity: 50 },
      animation: 'slideInLeft'
    },
    swipeFromRight: {
      action: 'openQuickActions',
      feedback: 'Quick actions',
      haptic: { type: 'selection' as const, intensity: 50 },
      animation: 'slideInRight'
    },
    swipeFromBottom: {
      action: 'openCreateMenu',
      feedback: 'Create new look',
      haptic: { type: 'impact' as const, intensity: 80, duration: 100 },
      animation: 'slideUp'
    },
    threeFingerSwipeDown: {
      action: 'minimizeApp',
      feedback: 'Minimize app',
      haptic: { type: 'selection' as const, intensity: 40 }
    },
    twoFingerTap: {
      action: 'toggleDarkMode',
      feedback: 'Theme switched',
      haptic: { type: 'notification' as const, intensity: 60 },
      animation: 'themeTransition'
    }
  },

  // Global Gestures
  global: {
    pullToRefresh: {
      action: 'refreshContent',
      feedback: 'Refreshing your feed...',
      haptic: { type: 'impact' as const, intensity: 70, duration: 100 },
      animation: 'refreshSpinner'
    },
    shakeToUndo: {
      action: 'undoLastAction',
      feedback: 'Shake to undo',
      haptic: { type: 'warning' as const, pattern: [80, 50, 80] },
      animation: 'undoPrompt'
    },
    voiceActivation: {
      trigger: 'longPressHomeButton',
      action: 'activateVoiceSearch',
      feedback: 'Voice search activated 🎤',
      haptic: { type: 'impact' as const, intensity: 90, duration: 150 }
    }
  }
};

// 🎮 HAPTIC FEEDBACK SYSTEM
export class HapticFeedback {
  private static isSupported = 'vibrate' in navigator;
  private static isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  static trigger(pattern: HapticPattern): void {
    if (!this.isSupported) return;
    
    try {
      if (this.isIOS && 'webkitVibrate' in navigator) {
        // iOS specific vibration patterns
        this.triggerIOSHaptic(pattern);
      } else if ('vibrate' in navigator) {
        // Android/Standard vibration
        this.triggerStandardHaptic(pattern);
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }
  
  private static triggerIOSHaptic(pattern: HapticPattern): void {
    const intensity = pattern.intensity || 50;
    const duration = pattern.duration || 100;
    
    // Use iOS specific haptic types if available
    if ('hapticFeedback' in navigator && typeof navigator.hapticFeedback === 'object') {
      const hapticTypes = {
        'success': 'notificationSuccess',
        'warning': 'notificationWarning', 
        'error': 'notificationError',
        'selection': 'selectionChanged',
        'impact': 'impactMedium',
        'notification': 'notificationSuccess'
      };
      
      const hapticType = hapticTypes[pattern.type] || 'selectionChanged';
      (navigator as any).hapticFeedback[hapticType]?.();
    } else {
      // Fallback to vibration
      navigator.vibrate?.(duration);
    }
  }
  
  private static triggerStandardHaptic(pattern: HapticPattern): void {
    if (pattern.pattern) {
      navigator.vibrate?.(pattern.pattern);
    } else {
      const intensity = pattern.intensity || 50;
      const duration = pattern.duration || 100;
      
      // Create pattern based on type
      const patterns = {
        'success': [duration],
        'warning': [duration * 0.5, 50, duration * 0.5],
        'error': [duration, 100, duration, 100, duration],
        'selection': [30],
        'impact': [duration],
        'notification': [50, 50, 100]
      };
      
      navigator.vibrate?.(patterns[pattern.type] || [duration]);
    }
  }
}

// 🎨 GESTURE ANIMATIONS
export const gestureAnimations = {
  // Card animations
  slideOutRight: 'transform: translateX(100%) rotate(15deg); opacity: 0;',
  slideOutLeft: 'transform: translateX(-100%) rotate(-15deg); opacity: 0;',
  flyUp: 'transform: translateY(-200%) scale(0.8); opacity: 0;',
  slideDown: 'transform: translateY(20px); opacity: 0.7;',
  scaleUp: 'transform: scale(1.05); z-index: 10;',
  heartPop: 'animation: heartPop 0.6s ease-out;',
  zoomIn: 'transform: scale(1.2); z-index: 100;',
  zoomOut: 'transform: scale(1); z-index: 1;',
  
  // Outfit animations
  slideToOutfit: 'transform: translateX(50px) scale(0.9); opacity: 0.8;',
  slideAway: 'transform: translateX(-50px) scale(0.9); opacity: 0.5;',
  magneticSnap: 'animation: magneticSnap 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);',
  shuffle: 'animation: shuffle 0.8s ease-in-out;',
  
  // Social animations
  slideUp: 'transform: translateY(-100%);',
  heartBurst: 'animation: heartBurst 0.8s ease-out;',
  reactionMenu: 'animation: reactionMenu 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);',
  shareModal: 'animation: shareModal 0.5s ease-out;',
  
  // Navigation animations
  slideInLeft: 'transform: translateX(0); opacity: 1;',
  slideInRight: 'transform: translateX(0); opacity: 1;',
  themeTransition: 'animation: themeTransition 0.6s ease-in-out;',
  
  // Global animations
  refreshSpinner: 'animation: refreshSpinner 1s linear infinite;',
  undoPrompt: 'animation: undoPrompt 0.5s ease-out;'
};

// 🎪 GESTURE RECOGNIZER CLASS
export class GestureRecognizer {
  private element: HTMLElement;
  private callbacks: Map<string, Function> = new Map();
  private touchStart: { x: number; y: number; time: number } | null = null;
  private isLongPress = false;
  private longPressTimer: number | null = null;
  
  constructor(element: HTMLElement) {
    this.element = element;
    this.setupEventListeners();
  }
  
  private setupEventListeners(): void {
    // Touch events
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    
    // Mouse events for desktop
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.element.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.element.addEventListener('mouseup', this.handleMouseUp.bind(this));
    
    // Gesture events
    this.element.addEventListener('gesturestart', this.handleGestureStart.bind(this));
    this.element.addEventListener('gesturechange', this.handleGestureChange.bind(this));
    this.element.addEventListener('gestureend', this.handleGestureEnd.bind(this));
  }
  
  private handleTouchStart(event: TouchEvent): void {
    const touch = event.touches[0];
    this.touchStart = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    
    // Start long press timer
    this.longPressTimer = window.setTimeout(() => {
      this.isLongPress = true;
      this.triggerGesture('longPress', event);
    }, 500);
  }
  
  private handleTouchMove(event: TouchEvent): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }
  
  private handleTouchEnd(event: TouchEvent): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    
    if (this.isLongPress) {
      this.isLongPress = false;
      return;
    }
    
    if (!this.touchStart) return;
    
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - this.touchStart.x;
    const deltaY = touch.clientY - this.touchStart.y;
    const deltaTime = Date.now() - this.touchStart.time;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / deltaTime;
    
    // Determine gesture type
    if (distance < 10 && deltaTime < 300) {
      this.triggerGesture('tap', event, { velocity });
    } else if (distance < 10 && deltaTime < 500) {
      this.triggerGesture('doubleTap', event, { velocity });
    } else if (Math.abs(deltaX) > Math.abs(deltaY) && distance > 50) {
      // Horizontal swipe
      const direction = deltaX > 0 ? 'right' : 'left';
      this.triggerGesture('swipe', event, { direction, velocity, distance });
    } else if (Math.abs(deltaY) > Math.abs(deltaX) && distance > 50) {
      // Vertical swipe
      const direction = deltaY > 0 ? 'down' : 'up';
      this.triggerGesture('swipe', event, { direction, velocity, distance });
    }
    
    this.touchStart = null;
  }
  
  private handleMouseDown(event: MouseEvent): void {
    // Handle mouse events for desktop testing
  }
  
  private handleMouseMove(event: MouseEvent): void {
    // Handle mouse move for desktop
  }
  
  private handleMouseUp(event: MouseEvent): void {
    // Handle mouse up for desktop
  }
  
  private handleGestureStart(event: any): void {
    event.preventDefault();
  }
  
  private handleGestureChange(event: any): void {
    const scale = event.scale;
    if (scale > 1.2) {
      this.triggerGesture('pinchOut', event, { scale });
    } else if (scale < 0.8) {
      this.triggerGesture('pinchIn', event, { scale });
    }
  }
  
  private handleGestureEnd(event: any): void {
    event.preventDefault();
  }
  
  private triggerGesture(type: string, event: Event, data?: any): void {
    const callback = this.callbacks.get(type);
    if (callback) {
      const gestureEvent: GestureEvent = {
        type,
        element: this.element,
        data,
        ...data
      };
      callback(gestureEvent);
    }
  }
  
  public on(gestureType: string, callback: Function): void {
    this.callbacks.set(gestureType, callback);
  }
  
  public off(gestureType: string): void {
    this.callbacks.delete(gestureType);
  }
  
  public destroy(): void {
    this.callbacks.clear();
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }
  }
}

// 🚀 GESTURE UTILITIES
export const gestureUtils = {
  // Apply gesture behavior to element
  applyGestureBehavior(element: HTMLElement, context: keyof typeof gestureVocabulary): GestureRecognizer {
    const recognizer = new GestureRecognizer(element);
    const gestures = gestureVocabulary[context];
    
    Object.entries(gestures).forEach(([gestureType, config]) => {
      recognizer.on(gestureType, (event: GestureEvent) => {
        // Trigger haptic feedback
        if (config.haptic) {
          HapticFeedback.trigger(config.haptic);
        }
        
        // Show feedback message
        if (config.feedback) {
          gestureUtils.showFeedback(config.feedback);
        }
        
        // Apply animation
        if (config.animation) {
          gestureUtils.applyAnimation(element, config.animation);
        }
        
        // Handle undo functionality
        if (config.undo && config.undoText) {
          gestureUtils.showUndoOption(config.undoText, config.action);
        }
      });
    });
    
    return recognizer;
  },
  
  // Show feedback toast
  showFeedback(message: string): void {
    const toast = document.createElement('div');
    toast.className = 'gesture-feedback toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--gradient-aurora);
      color: white;
      padding: var(--space-md) var(--space-lg);
      border-radius: var(--radius-full);
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      z-index: 9999;
      animation: gestureToast 0.8s ease-out;
      pointer-events: none;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 800);
  },
  
  // Apply animation to element
  applyAnimation(element: HTMLElement, animation: string): void {
    const animationCSS = gestureAnimations[animation as keyof typeof gestureAnimations];
    if (animationCSS) {
      element.style.cssText += animationCSS;
      
      // Reset after animation
      setTimeout(() => {
        element.style.transform = '';
        element.style.opacity = '';
      }, 600);
    }
  },
  
  // Show undo option
  showUndoOption(message: string, action: string): void {
    const undo = document.createElement('div');
    undo.className = 'gesture-undo';
    undo.innerHTML = `
      <span>${message}</span>
      <button class="btn-magical btn-sm btn-ghost">Undo</button>
    `;
    undo.style.cssText = `
      position: fixed;
      bottom: var(--space-xl);
      left: var(--space-lg);
      right: var(--space-lg);
      background: var(--gradient-glass);
      backdrop-filter: blur(20px);
      padding: var(--space-md);
      border-radius: var(--radius-lg);
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 9999;
      animation: slideUpFade 0.3s ease-out;
    `;
    
    const undoButton = undo.querySelector('button');
    undoButton?.addEventListener('click', () => {
      // Trigger undo action
      document.dispatchEvent(new CustomEvent('gestureUndo', { detail: { action } }));
      document.body.removeChild(undo);
    });
    
    document.body.appendChild(undo);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (document.body.contains(undo)) {
        document.body.removeChild(undo);
      }
    }, 5000);
  }
};

// 📱 MOBILE OPTIMIZATION HELPERS
export const mobileOptimization = {
  // Optimize touch targets for accessibility
  optimizeTouchTargets(): void {
    const targets = document.querySelectorAll('button, a, input, [role="button"]');
    targets.forEach(target => {
      const element = target as HTMLElement;
      const computedStyle = window.getComputedStyle(element);
      const height = parseInt(computedStyle.height);
      const width = parseInt(computedStyle.width);
      
      // Ensure minimum 44px touch target (WCAG guideline)
      if (height < 44 || width < 44) {
        element.style.minHeight = '44px';
        element.style.minWidth = '44px';
        element.style.display = 'inline-flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
      }
    });
  },
  
  // Prevent zoom on input focus (iOS)
  preventInputZoom(): void {
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      const element = input as HTMLElement;
      if (element.style.fontSize === '' || parseInt(element.style.fontSize) < 16) {
        element.style.fontSize = '16px';
      }
    });
  },
  
  // Add safe area support
  addSafeAreaSupport(): void {
    const root = document.documentElement;
    root.style.paddingTop = 'env(safe-area-inset-top)';
    root.style.paddingBottom = 'env(safe-area-inset-bottom)';
    root.style.paddingLeft = 'env(safe-area-inset-left)';
    root.style.paddingRight = 'env(safe-area-inset-right)';
  }
};