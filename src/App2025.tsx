import React, { useState, useEffect, Suspense, lazy } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";

// Import revolutionary design systems
import "./styles/design-system-2025.css";
import "./styles/typography-2025.css";
import { appCopy, generateDynamicCopy } from "./data/copy-2025";
import { gestureUtils, mobileOptimization, HapticFeedback } from "./lib/gesture-system-2025";

// Lazy load components for performance
const Dashboard2025 = lazy(() => import("./components/Dashboard2025").then(m => ({ default: m.Dashboard2025 })));
const Navigation2025 = lazy(() => import("./components/Navigation2025").then(m => ({ default: m.Navigation2025 })));
const QuizPage = lazy(() => import("./components/QuizPage").then(m => ({ default: m.QuizPage })));
const ProductBrowser = lazy(() => import("./components/ProductBrowser").then(m => ({ default: m.ProductBrowser })));
const OutfitBuilder = lazy(() => import("./components/OutfitBuilder").then(m => ({ default: m.OutfitBuilder })));
const SocialHub = lazy(() => import("./components/SocialHub").then(m => ({ default: m.SocialHub })));
const UserProfile = lazy(() => import("./components/UserProfile").then(m => ({ default: m.UserProfile })));
const AdminPanel = lazy(() => import("./components/AdminPanel").then(m => ({ default: m.AdminPanel })));
const ColorPaletteReference = lazy(() => import("./components/ColorPaletteReference").then(m => ({ default: m.ColorPaletteReference })));
const GroupsHub = lazy(() => import("./components/GroupsHub").then(m => ({ default: m.GroupsHub })));
const PWAInstallPrompt = lazy(() => import("./components/PWAInstallPrompt").then(m => ({ default: m.PWAInstallPrompt })));
const OfflineIndicator = lazy(() => import("./components/OfflineIndicator").then(m => ({ default: m.OfflineIndicator })));

// Revolutionary Loading Component
const MagicalLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-aurora-primary-light via-cosmic-coral to-cosmic-pink flex items-center justify-center">
    <div className="text-center">
      <div className="w-20 h-20 bg-gradient-hypnotic rounded-3xl mx-auto mb-6 flex items-center justify-center animate-float-subtle shadow-cosmic">
        <span className="text-3xl animate-pulse">✨</span>
      </div>
      <h1 className="text-display-lg text-gradient mb-4 animate-float">
        {appCopy.taglines.main}
      </h1>
      <p className="text-body text-white opacity-90 animate-shimmer">
        {appCopy.microCopy.loading[Math.floor(Math.random() * appCopy.microCopy.loading.length)]}
      </p>
      <div className="mt-8">
        <div className="card-skeleton w-64 h-4 mx-auto"></div>
      </div>
    </div>
  </div>
);

// Revolutionary Welcome Screen
const WelcomeScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-moonstone-50 via-aurora-primary-light to-cosmic-coral">
    <Suspense fallback={<div className="h-4"></div>}>
      <PWAInstallPrompt />
      <OfflineIndicator />
    </Suspense>
    
    <div className="container mx-auto px-6 py-12 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-hypnotic rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-cosmic animate-float-subtle">
            <span className="text-4xl">✨</span>
          </div>
          
          <h1 className="text-display-xl text-gradient mb-6 animate-float">
            StyleSeason
          </h1>
          
          <p className="text-h4 text-gradient-cosmic mb-4">
            {appCopy.taglines.secondary}
          </p>
          
          <p className="text-body text-moonstone-600 mb-8 leading-relaxed">
            {appCopy.onboarding.screen1.subtext}
          </p>
          
          {/* Feature Preview Cards */}
          <div className="space-y-4 mb-12">
            {[
              { icon: "🧬", title: "Style DNA Lab", desc: "Discover your color superpower" },
              { icon: "✨", title: "AI Outfit Genius", desc: "Looks that make you unstoppable" },
              { icon: "👥", title: "Style Tribes", desc: "Find your fashion soulmates" }
            ].map((feature, index) => (
              <div 
                key={index}
                className="card-glass p-6 text-left transform hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{feature.icon}</div>
                  <div>
                    <h3 className="text-h5 text-moonstone-900 mb-1">{feature.title}</h3>
                    <p className="text-body-sm text-moonstone-600">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Sign In Form */}
        <div className="card-floating p-8">
          <h2 className="text-h3 text-center text-moonstone-900 mb-8">
            {appCopy.conversion.signUp.headline}
          </h2>
          <SignInForm />
        </div>
      </div>
    </div>
    
    <Toaster 
      position="top-center" 
      toastOptions={{
        className: 'bg-gradient-aurora text-white border-none shadow-cosmic',
        duration: 3000,
      }}
    />
  </div>
);

// Main App Component
export default function App2025() {
  const user = useQuery(api.auth.loggedInUser);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize app and mobile optimizations
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Apply mobile optimizations
        mobileOptimization.optimizeTouchTargets();
        mobileOptimization.preventInputZoom();
        mobileOptimization.addSafeAreaSupport();
        
        // Add gesture support to body
        const bodyGestures = gestureUtils.applyGestureBehavior(document.body, 'global');
        
        // Preload critical fonts
        const fontLink = document.createElement('link');
        fontLink.rel = 'preload';
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@100;900&family=Outfit:wght@100;900&display=swap';
        fontLink.as = 'style';
        document.head.appendChild(fontLink);
        
        // Set loading complete
        setTimeout(() => {
          setIsLoading(false);
          setHasInitialized(true);
          
          // Welcome haptic
          HapticFeedback.trigger({ type: 'success', intensity: 60, duration: 100 });
        }, 1500);
        
        return () => {
          bodyGestures.destroy();
        };
      } catch (error) {
        console.warn('App initialization error:', error);
        setIsLoading(false);
        setHasInitialized(true);
      }
    };
    
    initializeApp();
  }, []);

  // Handle favorites-only mode
  useEffect(() => {
    if (currentPage === "browse") {
      const shouldShowFavoritesOnly = localStorage.getItem('viewFavoritesOnly') === 'true';
      setFavoritesOnly(shouldShowFavoritesOnly);
      
      if (shouldShowFavoritesOnly) {
        localStorage.removeItem('viewFavoritesOnly');
      }
    } else {
      setFavoritesOnly(false);
    }
  }, [currentPage]);

  // Revolutionary page change handler with haptic feedback
  const handlePageChange = (page: string) => {
    // Prevent non-admin users from accessing admin page
    if (page === "admin" && !user?.isAdmin) {
      HapticFeedback.trigger({ type: 'error', intensity: 50, duration: 100 });
      return;
    }
    
    // Page change haptic feedback
    HapticFeedback.trigger({ type: 'selection', intensity: 40, duration: 50 });
    
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
    
    // Reset favorites-only mode when changing pages
    if (page !== "browse") {
      setFavoritesOnly(false);
    }
  };

  // Show loading screen
  if (isLoading || !hasInitialized) {
    return <MagicalLoader />;
  }

  // Show loading while user status is being determined
  if (user === undefined) {
    return <MagicalLoader />;
  }

  // Show welcome screen for non-authenticated users
  if (user === null) {
    return <WelcomeScreen />;
  }

  // Revolutionary main app layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-moonstone-50 via-white to-aurora-primary-light">
      {/* PWA Components */}
      <Suspense fallback={<div className="h-0"></div>}>
        <PWAInstallPrompt />
        <OfflineIndicator />
      </Suspense>
      
      {/* Revolutionary Navigation */}
      <Suspense fallback={<div className="h-16 bg-glass-backdrop"></div>}>
        <Navigation2025
          currentPage={currentPage}
          onPageChange={handlePageChange}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
      </Suspense>

      {/* Main Content Area with Gesture Support */}
      <main className="lg:pl-72 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-aurora rounded-3xl mx-auto mb-4 flex items-center justify-center animate-pulse">
                  <span className="text-2xl">✨</span>
                </div>
                <p className="text-body text-moonstone-600">
                  {appCopy.microCopy.loading[Math.floor(Math.random() * appCopy.microCopy.loading.length)]}
                </p>
              </div>
            </div>
          }>
            {/* Dynamic Page Rendering */}
            {currentPage === "dashboard" && (
              <Dashboard2025 setCurrentPage={handlePageChange} />
            )}
            
            {currentPage === "quiz" && (
              <QuizPage setCurrentPage={handlePageChange} />
            )}
            
            {currentPage === "groups" && (
              <GroupsHub setCurrentPage={handlePageChange} />
            )}
            
            {currentPage === "browse" && (
              <ProductBrowser 
                setCurrentPage={handlePageChange} 
                favoritesOnly={favoritesOnly}
              />
            )}
            
            {currentPage === "outfits" && (
              <OutfitBuilder setCurrentPage={handlePageChange} />
            )}
            
            {currentPage === "social" && (
              <SocialHub setCurrentPage={handlePageChange} />
            )}
            
            {currentPage === "profile" && (
              <UserProfile setCurrentPage={handlePageChange} />
            )}
            
            {currentPage === "colors" && (
              <ColorPaletteReference setCurrentPage={handlePageChange} />
            )}
            
            {currentPage === "admin" && user?.isAdmin && (
              <AdminPanel setCurrentPage={handlePageChange} />
            )}
            
            {currentPage === "admin" && !user?.isAdmin && (
              <div className="min-h-screen flex items-center justify-center p-6">
                <div className="card-glass p-12 text-center max-w-md">
                  <div className="text-6xl mb-6">🔒</div>
                  <h2 className="text-h2 text-moonstone-900 mb-4">Access Denied</h2>
                  <p className="text-body text-moonstone-600 mb-8">
                    You need admin powers to access this area.
                  </p>
                  <button
                    onClick={() => handlePageChange("dashboard")}
                    className="btn-magical btn-primary btn-lg"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            )}
          </Suspense>
        </div>
      </main>

      {/* Floating Action Button for Quick Actions */}
      <button
        className="btn-fab lg:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Quick actions"
      >
        <span className="text-2xl">✨</span>
      </button>

      {/* Revolutionary Toast System */}
      <Toaster 
        position="top-center"
        toastOptions={{
          className: 'bg-gradient-aurora text-white border-none shadow-cosmic text-body font-medium',
          duration: 3000,
          style: {
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-md) var(--space-lg)',
          }
        }}
      />

      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-ethereal opacity-10 blur-3xl animate-float-subtle"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-cosmic-fire opacity-5 blur-3xl animate-float-subtle" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-gradient-golden-hour opacity-8 blur-3xl animate-float-subtle" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes gestureToast {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        
        @keyframes slideUpFade {
          0% { opacity: 0; transform: translateY(100%); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes heartPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        
        @keyframes magneticSnap {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        @keyframes shuffle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
        
        @keyframes heartBurst {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes reactionMenu {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        
        @keyframes shareModal {
          0% { transform: translateY(100%) scale(0.9); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        
        @keyframes themeTransition {
          0% { filter: brightness(1); }
          50% { filter: brightness(1.2); }
          100% { filter: brightness(1); }
        }
        
        @keyframes refreshSpinner {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes undoPrompt {
          0% { transform: translateY(100%) scale(0.9); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        
        /* Add beautiful scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: var(--moonstone-100);
          border-radius: var(--radius-full);
        }
        
        ::-webkit-scrollbar-thumb {
          background: var(--gradient-aurora);
          border-radius: var(--radius-full);
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: var(--gradient-hypnotic);
        }
        
        /* Smooth transitions for everything */
        * {
          transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
          transition-timing-function: var(--ease-spring);
          transition-duration: var(--timing-normal);
        }
        
        /* Ensure proper stacking context */
        .lg\\:pl-72 {
          isolation: isolate;
        }
      `}</style>
    </div>
  );
}