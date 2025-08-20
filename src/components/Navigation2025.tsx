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
  seasonalGradients: {
    winter: string;
    spring: string;
    summer: string;
    autumn: string;
  };
  description: string;
  category: 'core' | 'social' | 'tools' | 'admin';
  fashionMood: 'elegant' | 'playful' | 'bold' | 'artistic' | 'luxurious';
}

export function Navigation2025({ 
  currentPage, 
  onPageChange, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen 
}: Navigation2025Props) {
  const user = useQuery(api.auth.loggedInUser);
  const userSeasonalType = useQuery(api.quiz.getUserSeasonalType);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [morphingPhase, setMorphingPhase] = useState(0);
  const [timeBasedMood, setTimeBasedMood] = useState<'dawn' | 'day' | 'dusk' | 'night'>('day');

  // Revolutionary navigation items - fashion-inspired metadata
  const allNavigationItems: NavItem[] = [
    { 
      id: "dashboard", 
      label: "Atelier", 
      icon: "🏛️", 
      seasonalGradients: {
        winter: "gradient-winter-jewel",
        spring: "gradient-spring-bloom", 
        summer: "gradient-summer-mist",
        autumn: "gradient-autumn-fire"
      },
      description: "Your personal fashion atelier",
      category: 'core',
      fashionMood: 'elegant'
    },
    { 
      id: "quiz", 
      label: "DNA Lab", 
      icon: "🧬", 
      seasonalGradients: {
        winter: "gradient-winter-storm",
        spring: "gradient-spring-garden",
        summer: "gradient-summer-twilight", 
        autumn: "gradient-autumn-harvest"
      },
      description: "Decode your style genetics",
      category: 'core',
      fashionMood: 'bold'
    },
    { 
      id: "browse", 
      label: "Gallery", 
      icon: "🎭", 
      seasonalGradients: {
        winter: "gradient-winter-ice",
        spring: "gradient-spring-sunset",
        summer: "gradient-summer-sage",
        autumn: "gradient-autumn-forest"
      },
      description: "Curated fashion gallery",
      category: 'core',
      fashionMood: 'artistic'
    },
    { 
      id: "outfits", 
      label: "Couturier", 
      icon: "✂️", 
      seasonalGradients: {
        winter: "gradient-winter-jewel",
        spring: "gradient-spring-bloom",
        summer: "gradient-summer-mist",
        autumn: "gradient-autumn-fire"
      },
      description: "Your AI fashion designer",
      category: 'tools',
      fashionMood: 'luxurious'
    },
    { 
      id: "groups", 
      label: "Salon", 
      icon: "👑", 
      seasonalGradients: {
        winter: "gradient-winter-storm",
        spring: "gradient-spring-garden", 
        summer: "gradient-summer-twilight",
        autumn: "gradient-autumn-harvest"
      },
      description: "Fashion salon & community",
      category: 'social',
      fashionMood: 'playful'
    },
    { 
      id: "social", 
      label: "Runway", 
      icon: "🌟", 
      seasonalGradients: {
        winter: "gradient-winter-ice",
        spring: "gradient-spring-sunset",
        summer: "gradient-summer-sage", 
        autumn: "gradient-autumn-forest"
      },
      description: "Share your fashion story",
      category: 'social',
      fashionMood: 'bold'
    },
    { 
      id: "colors", 
      label: "Palette", 
      icon: "🎨", 
      seasonalGradients: {
        winter: "gradient-winter-jewel",
        spring: "gradient-spring-bloom",
        summer: "gradient-summer-mist",
        autumn: "gradient-autumn-fire"
      },
      description: "Your signature colors",
      category: 'tools',
      fashionMood: 'artistic'
    },
    { 
      id: "profile", 
      label: "Signature", 
      icon: "💎", 
      seasonalGradients: {
        winter: "gradient-winter-storm",
        spring: "gradient-spring-garden",
        summer: "gradient-summer-twilight",
        autumn: "gradient-autumn-harvest"
      },
      description: "Your style signature",
      category: 'core',
      fashionMood: 'elegant'
    },
    ...(user?.isAdmin ? [{ 
      id: "admin", 
      label: "Maison", 
      icon: "👑", 
      seasonalGradients: {
        winter: "from-gray-700 to-gray-900",
        spring: "from-gray-700 to-gray-900",
        summer: "from-gray-700 to-gray-900",
        autumn: "from-gray-700 to-gray-900"
      },
      description: "Fashion house control",
      category: 'admin' as const,
      fashionMood: 'luxurious' as const
    }] : []),
  ];

  // Revolutionary time-based morphing system
  useEffect(() => {
    const hour = new Date().getHours();
    const minute = new Date().getMinutes();
    
    // Set time-based mood for atmospheric changes
    if (hour >= 5 && hour < 8) {
      setTimeBasedMood('dawn');
    } else if (hour >= 8 && hour < 17) {
      setTimeBasedMood('day');
    } else if (hour >= 17 && hour < 20) {
      setTimeBasedMood('dusk');
    } else {
      setTimeBasedMood('night');
    }
    
    // Continuous morphing phase for organic animations
    const morphingInterval = setInterval(() => {
      setMorphingPhase(prev => (prev + 1) % 8);
    }, 3000);
    
    return () => clearInterval(morphingInterval);
  }, []);

  // Get user's seasonal gradient or default to adaptive
  const getUserSeasonalGradient = (item: NavItem): string => {
    const season = userSeasonalType?.seasonalType?.toLowerCase() as 'winter' | 'spring' | 'summer' | 'autumn';
    if (season && item.seasonalGradients[season]) {
      return item.seasonalGradients[season];
    }
    return 'gradient-adaptive-primary';
  };

  // Revolutionary morphing navigation component
  const MorphingNavItem = ({ item, isActive }: { item: NavItem; isActive: boolean }) => {
    const gradientClass = getUserSeasonalGradient(item);
    
    return (
      <button
        onClick={() => handleItemClick(item.id)}
        onMouseEnter={() => setHoveredItem(item.id)}
        onMouseLeave={() => setHoveredItem(null)}
        className={`
          group relative w-full overflow-hidden
          transition-all duration-700 ease-out
          ${isActive ? 'scale-105' : 'scale-100 hover:scale-102'}
          ${hoveredItem === item.id ? 'animate-liquid-morph' : ''}
        `}
        style={{
          borderRadius: isActive 
            ? `${20 + morphingPhase * 2}px ${30 + morphingPhase * 3}px ${25 + morphingPhase * 2}px ${20 + morphingPhase}px`
            : '16px',
          transformOrigin: 'left center',
        }}
      >
        {/* Revolutionary background with seasonal adaptation */}
        <div 
          className={`
            absolute inset-0 transition-all duration-1000 ease-in-out
            ${isActive ? gradientClass : 'bg-transparent'}
            ${hoveredItem === item.id && !isActive ? `${gradientClass} opacity-20` : ''}
          `}
          style={{
            background: isActive 
              ? `var(--${gradientClass})`
              : hoveredItem === item.id 
                ? `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)`
                : 'transparent'
          }}
        />
        
        {/* Fabric-like overlay */}
        <div 
          className={`
            absolute inset-0 opacity-0 transition-opacity duration-500
            ${hoveredItem === item.id ? 'opacity-100' : ''}
            ${item.fashionMood === 'elegant' ? 'gradient-silk' : ''}
            ${item.fashionMood === 'luxurious' ? 'gradient-velvet' : ''}
            ${item.fashionMood === 'playful' ? 'gradient-chiffon' : ''}
          `}
        />
        
        {/* Content container */}
        <div className="relative z-10 flex items-center p-4 space-x-4">
          {/* Revolutionary icon with 3D effects */}
          <div 
            className={`
              flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
              transition-all duration-500 transform-gpu
              ${isActive ? 'animate-fashion-spin text-white' : 'text-gray-600'}
              ${hoveredItem === item.id ? 'scale-110 rotate-12' : ''}
            `}
            style={{
              background: isActive 
                ? 'rgba(255,255,255,0.2)'
                : hoveredItem === item.id 
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(0,0,0,0.05)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <span className="text-xl font-semibold">
              {item.icon}
            </span>
          </div>
          
          {/* Label with runway typography */}
          <div className="flex-1 min-w-0">
            <div 
              className={`
                font-semibold text-left transition-colors duration-300
                ${isActive ? 'text-white' : 'text-gray-700'}
                ${item.fashionMood === 'elegant' ? 'font-light tracking-wide' : ''}
                ${item.fashionMood === 'bold' ? 'font-black' : ''}
                ${item.fashionMood === 'luxurious' ? 'font-medium tracking-wider' : ''}
              `}
            >
              {item.label}
            </div>
            <div 
              className={`
                text-sm opacity-70 transition-all duration-300
                ${isActive ? 'text-white' : 'text-gray-500'}
                ${hoveredItem === item.id ? 'opacity-100' : ''}
              `}
            >
              {item.description}
            </div>
          </div>
          
          {/* Couture accent */}
          {isActive && (
            <div className="flex-shrink-0 w-2 h-2 bg-white rounded-full animate-pulse" />
          )}
        </div>
        
        {/* Morphing border effect */}
        <div 
          className={`
            absolute inset-0 pointer-events-none
            border-2 border-transparent transition-all duration-500
            ${hoveredItem === item.id ? 'border-white border-opacity-30' : ''}
          `}
          style={{
            borderRadius: 'inherit',
          }}
        />
      </button>
    );
  };

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
      {/* REVOLUTIONARY DESKTOP NAVIGATION - Organic Fashion Atelier */}
      <aside className="hidden lg:flex lg:flex-col lg:w-80 lg:fixed lg:inset-y-0 lg:z-50">
        <div 
          className={`
            flex-1 flex flex-col min-h-0 overflow-hidden
            ${timeBasedMood === 'dawn' ? 'bg-gradient-to-b from-pink-50 to-orange-50' : ''}
            ${timeBasedMood === 'day' ? 'bg-gradient-to-b from-white to-blue-50' : ''}
            ${timeBasedMood === 'dusk' ? 'bg-gradient-to-b from-purple-50 to-pink-50' : ''}
            ${timeBasedMood === 'night' ? 'bg-gradient-to-b from-gray-900 to-black' : ''}
            backdrop-blur-2xl
          `}
          style={{
            borderRight: '1px solid rgba(255,255,255,0.1)',
            borderImage: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.2), transparent) 1'
          }}
        >
          {/* REVOLUTIONARY LOGO - Atelier Nameplate */}
          <div className="relative p-6 overflow-hidden">
            <div 
              className={`
                absolute inset-0 opacity-10
                ${getUserSeasonalGradient(allNavigationItems[0])}
              `} 
            />
            <div className="relative z-10 flex items-center space-x-4">
              <div 
                className={`
                  w-16 h-16 rounded-2xl flex items-center justify-center
                  animate-fashion-spin
                  ${getUserSeasonalGradient(allNavigationItems[0])}
                `}
                style={{
                  background: `var(--${getUserSeasonalGradient(allNavigationItems[0])})`,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }}
              >
                <span className="text-white font-black text-2xl">S</span>
              </div>
              <div>
                <h1 className={`
                  text-2xl font-black tracking-tight
                  ${timeBasedMood === 'night' ? 'text-white' : 'text-gray-900'}
                  animate-silk-flow
                `}>
                  StyleSeason
                </h1>
                <p className={`
                  text-sm font-medium opacity-60
                  ${timeBasedMood === 'night' ? 'text-gray-300' : 'text-gray-600'}
                `}>
                  Fashion Atelier 2025
                </p>
                {userSeasonalType && (
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-current opacity-50" />
                    <span className={`
                      text-xs uppercase tracking-wider font-semibold
                      ${timeBasedMood === 'night' ? 'text-gray-400' : 'text-gray-500'}
                    `}>
                      {userSeasonalType.seasonalType}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* REVOLUTIONARY NAVIGATION - Morphing Categories */}
          <nav className="flex-1 px-6 py-4 space-y-8 overflow-y-auto">
            {/* ATELIER - Core Spaces */}
            <div>
              <h3 className={`
                text-sm font-black uppercase tracking-widest mb-4 flex items-center
                ${timeBasedMood === 'night' ? 'text-gray-400' : 'text-gray-500'}
              `}>
                <div className="w-4 h-px bg-current mr-3 animate-silk-flow" />
                Atelier
              </h3>
              <div className="space-y-3">
                {categories.core.map((item, index) => (
                  <div
                    key={item.id}
                    style={{ animationDelay: `${index * 100}ms` }}
                    className="animate-draping"
                  >
                    <MorphingNavItem
                      item={item}
                      isActive={currentPage === item.id}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* SALON - Social Spaces */}
            <div>
              <h3 className={`
                text-sm font-black uppercase tracking-widest mb-4 flex items-center
                ${timeBasedMood === 'night' ? 'text-gray-400' : 'text-gray-500'}
              `}>
                <div className="w-4 h-px bg-current mr-3 animate-silk-flow" />
                Salon
              </h3>
              <div className="space-y-3">
                {categories.social.map((item, index) => (
                  <div
                    key={item.id}
                    style={{ animationDelay: `${(index + 4) * 100}ms` }}
                    className="animate-draping"
                  >
                    <MorphingNavItem
                      item={item}
                      isActive={currentPage === item.id}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* STUDIO - Creative Tools */}
            <div>
              <h3 className={`
                text-sm font-black uppercase tracking-widest mb-4 flex items-center
                ${timeBasedMood === 'night' ? 'text-gray-400' : 'text-gray-500'}
              `}>
                <div className="w-4 h-px bg-current mr-3 animate-silk-flow" />
                Studio
              </h3>
              <div className="space-y-3">
                {categories.tools.map((item, index) => (
                  <div
                    key={item.id}
                    style={{ animationDelay: `${(index + 6) * 100}ms` }}
                    className="animate-draping"
                  >
                    <MorphingNavItem
                      item={item}
                      isActive={currentPage === item.id}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* MAISON - Admin Control */}
            {categories.admin.length > 0 && (
              <div>
                <h3 className={`
                  text-sm font-black uppercase tracking-widest mb-4 flex items-center
                  ${timeBasedMood === 'night' ? 'text-gray-400' : 'text-gray-500'}
                `}>
                  <div className="w-4 h-px bg-current mr-3 animate-silk-flow" />
                  Maison
                </h3>
                <div className="space-y-3">
                  {categories.admin.map((item) => (
                    <MorphingNavItem
                      key={item.id}
                      item={item}
                      isActive={currentPage === item.id}
                    />
                  ))}
                </div>
              </div>
            )}
          </nav>
          
          {/* REVOLUTIONARY USER PROFILE - Couture Identity */}
          <div className="p-6">
            <div 
              className="card-couture p-4 animate-chiffon-float"
              style={{
                background: `var(--${getUserSeasonalGradient(allNavigationItems[0])})`,
                color: 'white'
              }}
            >
              <div className="flex items-center space-x-4">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center animate-fashion-spin"
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <span className="text-xl font-black">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate mb-1">
                    {user?.name || 'Fashion Enthusiast'}
                  </p>
                  <p className="text-sm text-white opacity-70 truncate mb-2">
                    {user?.email}
                  </p>
                  {userSeasonalType && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-white opacity-60" />
                      <span className="text-xs uppercase tracking-wider font-semibold text-white opacity-80">
                        {userSeasonalType.seasonalType} Palette
                      </span>
                    </div>
                  )}
                </div>
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