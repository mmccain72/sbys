import React, { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface Navigation2025Props {
  currentPage: string;
  onPageChange: (page: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  gradient: string;
  description: string;
  category: 'core' | 'social' | 'tools' | 'admin';
}

export function Navigation2025({ 
  currentPage, 
  onPageChange, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen 
}: Navigation2025Props) {
  const user = useQuery(api.auth.loggedInUser);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [predictiveItems, setPredictiveItems] = useState<string[]>([]);

  // Navigation items with enhanced metadata
  const allNavigationItems: NavItem[] = [
    { 
      id: "dashboard", 
      label: "Home", 
      icon: "🏠", 
      gradient: "from-blue-500 to-purple-600",
      description: "Your personalized style hub",
      category: 'core'
    },
    { 
      id: "quiz", 
      label: "Color DNA", 
      icon: "🧬", 
      gradient: "from-pink-500 to-rose-600",
      description: "Discover your color personality",
      category: 'core'
    },
    { 
      id: "browse", 
      label: "Discover", 
      icon: "✨", 
      gradient: "from-purple-500 to-indigo-600",
      description: "Curated fashion finds",
      category: 'core'
    },
    { 
      id: "outfits", 
      label: "Stylist", 
      icon: "👗", 
      gradient: "from-emerald-500 to-teal-600",
      description: "AI-powered outfit creation",
      category: 'tools'
    },
    { 
      id: "groups", 
      label: "Tribes", 
      icon: "👥", 
      gradient: "from-orange-500 to-red-600",
      description: "Find your style community",
      category: 'social'
    },
    { 
      id: "social", 
      label: "Connect", 
      icon: "💫", 
      gradient: "from-cyan-500 to-blue-600",
      description: "Share and inspire",
      category: 'social'
    },
    { 
      id: "colors", 
      label: "Palette", 
      icon: "🎨", 
      gradient: "from-violet-500 to-purple-600",
      description: "Your color reference",
      category: 'tools'
    },
    { 
      id: "profile", 
      label: "You", 
      icon: "✨", 
      gradient: "from-pink-500 to-purple-600",
      description: "Your style profile",
      category: 'core'
    },
    ...(user?.isAdmin ? [{ 
      id: "admin", 
      label: "Control", 
      icon: "⚡", 
      gradient: "from-gray-700 to-gray-900",
      description: "Admin dashboard",
      category: 'admin' as const
    }] : []),
  ];

  // Predictive navigation based on user behavior patterns
  useEffect(() => {
    const hour = new Date().getHours();
    const day = new Date().getDay();
    
    let suggested: string[] = [];
    
    // Morning routine (6-11 AM)
    if (hour >= 6 && hour < 11) {
      suggested = ['quiz', 'outfits', 'browse'];
    }
    // Lunch break (11 AM - 2 PM)
    else if (hour >= 11 && hour < 14) {
      suggested = ['social', 'groups', 'browse'];
    }
    // Evening (6-10 PM)
    else if (hour >= 18 && hour <= 22) {
      suggested = ['outfits', 'social', 'browse'];
    }
    // Weekend
    else if (day === 0 || day === 6) {
      suggested = ['outfits', 'browse', 'social'];
    }
    // Default
    else {
      suggested = ['browse', 'outfits', 'social'];
    }
    
    setPredictiveItems(suggested);
  }, []);

  const categories = {
    core: allNavigationItems.filter(item => item.category === 'core'),
    social: allNavigationItems.filter(item => item.category === 'social'),
    tools: allNavigationItems.filter(item => item.category === 'tools'),
    admin: allNavigationItems.filter(item => item.category === 'admin'),
  };

  const handleItemClick = (itemId: string) => {
    onPageChange(itemId);
    setIsMobileMenuOpen(false);
    
    // Add haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const NavItemComponent = ({ item, isActive, isPredicted }: { 
    item: NavItem; 
    isActive: boolean; 
    isPredicted?: boolean;
  }) => (
    <button
      onClick={() => handleItemClick(item.id)}
      onMouseEnter={() => setHoveredItem(item.id)}
      onMouseLeave={() => setHoveredItem(null)}
      className={`
        group relative flex items-center space-x-3 p-3 rounded-2xl
        transition-all duration-300 ease-spring overflow-hidden
        ${isActive 
          ? 'text-white shadow-lg transform scale-105' 
          : 'text-moonstone-600 hover:text-moonstone-800'
        }
        ${isPredicted ? 'ring-2 ring-cosmic-pink ring-opacity-50' : ''}
      `}
    >
      {/* Dynamic background gradient */}
      <div 
        className={`
          absolute inset-0 opacity-0 transition-opacity duration-300
          bg-gradient-to-r ${item.gradient}
          ${isActive ? 'opacity-100' : 'group-hover:opacity-90'}
        `}
      />
      
      {/* Glass morphism background for non-active states */}
      {!isActive && (
        <div className="absolute inset-0 bg-glass-light backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
      
      {/* Icon with micro-animation */}
      <span 
        className={`
          text-xl relative z-10 transition-transform duration-300
          ${hoveredItem === item.id ? 'scale-110 rotate-12' : ''}
          ${isActive ? 'animate-pulse' : ''}
        `}
      >
        {item.icon}
      </span>
      
      {/* Label */}
      <span className="font-medium relative z-10 transition-transform duration-300 group-hover:translate-x-1">
        {item.label}
      </span>
      
      {/* Predictive indicator */}
      {isPredicted && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-cosmic-pink rounded-full animate-pulse z-20" />
      )}
      
      {/* Ripple effect on click */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-white opacity-0 group-active:opacity-20 transition-opacity duration-150" />
      </div>
    </button>
  );

  return (
    <>
      {/* Desktop Navigation - Revolutionary Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:z-50">
        <div className="flex-1 flex flex-col min-h-0 bg-glass-backdrop backdrop-blur-xl border-r border-moonstone-200">
          {/* Logo Section */}
          <div className="flex items-center h-20 px-6 border-b border-moonstone-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-aurora rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">StyleSeason</h1>
                <p className="text-xs text-moonstone-500">2025 Edition</p>
              </div>
            </div>
          </div>
          
          {/* Navigation Sections */}
          <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
            {/* Core Section */}
            <div>
              <h3 className="text-xs font-semibold text-moonstone-400 uppercase tracking-wider mb-3">
                Essential
              </h3>
              <div className="space-y-2">
                {categories.core.map((item) => (
                  <NavItemComponent
                    key={item.id}
                    item={item}
                    isActive={currentPage === item.id}
                    isPredicted={predictiveItems.includes(item.id)}
                  />
                ))}
              </div>
            </div>
            
            {/* Social Section */}
            <div>
              <h3 className="text-xs font-semibold text-moonstone-400 uppercase tracking-wider mb-3">
                Community
              </h3>
              <div className="space-y-2">
                {categories.social.map((item) => (
                  <NavItemComponent
                    key={item.id}
                    item={item}
                    isActive={currentPage === item.id}
                    isPredicted={predictiveItems.includes(item.id)}
                  />
                ))}
              </div>
            </div>
            
            {/* Tools Section */}
            <div>
              <h3 className="text-xs font-semibold text-moonstone-400 uppercase tracking-wider mb-3">
                Tools
              </h3>
              <div className="space-y-2">
                {categories.tools.map((item) => (
                  <NavItemComponent
                    key={item.id}
                    item={item}
                    isActive={currentPage === item.id}
                    isPredicted={predictiveItems.includes(item.id)}
                  />
                ))}
              </div>
            </div>
            
            {/* Admin Section */}
            {categories.admin.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-moonstone-400 uppercase tracking-wider mb-3">
                  Admin
                </h3>
                <div className="space-y-2">
                  {categories.admin.map((item) => (
                    <NavItemComponent
                      key={item.id}
                      item={item}
                      isActive={currentPage === item.id}
                    />
                  ))}
                </div>
              </div>
            )}
          </nav>
          
          {/* User Profile Section */}
          <div className="p-4 border-t border-moonstone-200">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-glass-light">
              <div className="w-10 h-10 bg-gradient-aurora rounded-xl flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-moonstone-900 truncate">
                  {user?.name || 'Stylish User'}
                </p>
                <p className="text-xs text-moonstone-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Navigation - Bottom Tab Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-50">
        <div className="bg-glass-backdrop backdrop-blur-xl border-t border-moonstone-200 px-4 py-2">
          <div className="flex justify-around">
            {categories.core.slice(0, 4).map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`
                  flex flex-col items-center p-2 rounded-xl transition-all duration-300
                  ${currentPage === item.id 
                    ? 'bg-gradient-aurora text-white scale-110' 
                    : 'text-moonstone-600'
                  }
                `}
              >
                <span className="text-lg mb-1">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
            
            {/* More menu */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex flex-col items-center p-2 rounded-xl transition-all duration-300 text-moonstone-600"
            >
              <span className="text-lg mb-1">⋯</span>
              <span className="text-xs font-medium">More</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="lg:hidden fixed bottom-20 inset-x-4 z-50">
            <div className="bg-glass-backdrop backdrop-blur-xl rounded-3xl border border-moonstone-200 p-6 shadow-2xl">
              <div className="grid grid-cols-2 gap-4">
                {allNavigationItems
                  .filter(item => !categories.core.slice(0, 4).some(core => core.id === item.id))
                  .map((item) => (
                    <NavItemComponent
                      key={item.id}
                      item={item}
                      isActive={currentPage === item.id}
                      isPredicted={predictiveItems.includes(item.id)}
                    />
                  ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}