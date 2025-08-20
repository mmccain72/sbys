import React, { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface Dashboard2025Props {
  setCurrentPage: (page: string) => void;
}

export function Dashboard2025({ setCurrentPage }: Dashboard2025Props) {
  const user = useQuery(api.auth.loggedInUser);
  const userSeasonalType = useQuery(api.quiz.getUserSeasonalType);
  const userFavorites = useQuery(api.products.getUserFavorites);
  const friends = useQuery(api.social.getFriends);
  
  const [timeOfDay, setTimeOfDay] = useState('');
  const [personalizedGreeting, setPersonalizedGreeting] = useState('');
  
  useEffect(() => {
    const hour = new Date().getHours();
    const userName = user?.name || 'Gorgeous';
    
    if (hour < 12) {
      setTimeOfDay('morning');
      setPersonalizedGreeting(`Good morning, ${userName}! ☀️`);
    } else if (hour < 17) {
      setTimeOfDay('afternoon');
      setPersonalizedGreeting(`Good afternoon, ${userName}! 🌤️`);
    } else {
      setTimeOfDay('evening');
      setPersonalizedGreeting(`Good evening, ${userName}! 🌙`);
    }
  }, [user]);

  const favoriteCount = userFavorites?.length || 0;
  const friendCount = friends?.length || 0;
  const recentFavorites = userFavorites?.slice(0, 3) || [];

  const handleViewAllFavorites = () => {
    localStorage.setItem('viewFavoritesOnly', 'true');
    setCurrentPage("browse");
  };

  const quickActions = [
    {
      id: 'color-quiz',
      title: userSeasonalType ? 'Refresh Color DNA' : 'Discover Color DNA',
      description: userSeasonalType 
        ? 'Update your seasonal color profile with AI insights' 
        : 'Unlock your perfect color palette with our AI quiz',
      icon: '🧬',
      gradient: 'from-pink-500 via-purple-500 to-indigo-500',
      action: () => setCurrentPage("quiz"),
      badge: !userSeasonalType ? 'New' : undefined,
      glow: !userSeasonalType
    },
    {
      id: 'ai-stylist',
      title: 'AI Personal Stylist',
      description: 'Get instant outfit recommendations powered by AI',
      icon: '✨',
      gradient: 'from-emerald-400 via-cyan-500 to-blue-500',
      action: () => setCurrentPage("outfits"),
      badge: 'AI',
      glow: true
    },
    {
      id: 'discover',
      title: 'Curated Discovery',
      description: 'Explore fashion finds matched to your style DNA',
      icon: '🔮',
      gradient: 'from-violet-500 via-purple-500 to-pink-500',
      action: () => setCurrentPage("browse"),
      badge: favoriteCount > 0 ? `${favoriteCount} saved` : undefined
    },
    {
      id: 'style-community',
      title: 'Style Tribes',
      description: 'Connect with your fashion community',
      icon: '👥',
      gradient: 'from-orange-400 via-red-500 to-pink-500',
      action: () => setCurrentPage("groups"),
      badge: friendCount > 0 ? `${friendCount} friends` : 'Join'
    }
  ];

  const insightCards = [
    {
      title: 'Your Style Journey',
      content: userSeasonalType 
        ? `You're a ${userSeasonalType.seasonalType} - bold and confident!`
        : 'Ready to discover your color personality?',
      icon: userSeasonalType ? getSeasonalTypeEmoji(userSeasonalType.seasonalType) : '🎨',
      action: () => setCurrentPage(userSeasonalType ? "colors" : "quiz"),
      actionText: userSeasonalType ? 'View Palette' : 'Take Quiz'
    },
    {
      title: 'Fashion Intelligence',
      content: `${favoriteCount} curated pieces in your collection`,
      icon: '💎',
      action: handleViewAllFavorites,
      actionText: 'Explore Collection'
    },
    {
      title: 'Community Pulse',
      content: friendCount > 0 
        ? `Connected with ${friendCount} style enthusiasts`
        : 'Join thousands of fashion lovers',
      icon: '🌟',
      action: () => setCurrentPage("social"),
      actionText: friendCount > 0 ? 'See Updates' : 'Get Started'
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-aurora rounded-3xl mx-auto mb-6 flex items-center justify-center animate-float-subtle">
            <span className="text-3xl">✨</span>
          </div>
          <h1 className="text-3xl font-bold text-gradient mb-4">Welcome to StyleSeason</h1>
          <p className="text-moonstone-600 text-lg">Your AI-powered style journey awaits</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Revolutionary Liquid Background System */}
      <div className="absolute inset-0">
        {/* Primary seasonal background */}
        <div 
          className={`
            absolute inset-0 transition-all duration-[2000ms] ease-in-out
            ${userSeasonalType?.seasonalType === 'Winter' ? 'gradient-winter-storm' : ''}
            ${userSeasonalType?.seasonalType === 'Spring' ? 'gradient-spring-bloom' : ''}
            ${userSeasonalType?.seasonalType === 'Summer' ? 'gradient-summer-mist' : ''}
            ${userSeasonalType?.seasonalType === 'Autumn' ? 'gradient-autumn-fire' : ''}
            ${!userSeasonalType ? 'gradient-adaptive-primary' : ''}
            opacity-60 animate-morph-seasonal
          `} 
        />
        
        {/* Floating organic shapes */}
        <div className="absolute top-10 left-10 w-64 h-64 gradient-chiffon rounded-full blur-3xl animate-chiffon-float opacity-30" />
        <div className="absolute top-40 right-20 w-48 h-48 gradient-silk rounded-full blur-2xl animate-silk-flow opacity-40" />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 gradient-velvet rounded-full blur-3xl animate-velvet-shimmer opacity-20" />
        
        {/* Dynamic time-based overlay */}
        <div 
          className={`
            absolute inset-0 transition-opacity duration-1000
            ${timeOfDay === 'morning' ? 'bg-gradient-to-br from-yellow-100/20 to-orange-100/10' : ''}
            ${timeOfDay === 'afternoon' ? 'bg-gradient-to-br from-blue-50/20 to-white/10' : ''}
            ${timeOfDay === 'evening' ? 'bg-gradient-to-br from-purple-100/30 to-pink-100/20' : ''}
          `}
        />
      </div>

      {/* REVOLUTIONARY HERO - Asymmetrical Fashion Layout */}
      <div className="relative z-10 pt-16 pb-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Asymmetrical hero layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[60vh]">
            
            {/* Main content - Fashion magazine style */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-6">
                <h1 className={`
                  text-5xl lg:text-7xl font-black leading-none tracking-tight
                  ${userSeasonalType ? 'animate-runway-walk' : 'animate-haute-couture'}
                  ${userSeasonalType?.seasonalType === 'Winter' ? 'text-winter-obsidian' : ''}
                  ${userSeasonalType?.seasonalType === 'Spring' ? 'text-spring-grass' : ''}
                  ${userSeasonalType?.seasonalType === 'Summer' ? 'text-summer-steel' : ''}
                  ${userSeasonalType?.seasonalType === 'Autumn' ? 'text-autumn-chocolate' : ''}
                  ${!userSeasonalType ? 'text-gray-900' : ''}
                `}>
                  {personalizedGreeting.split(' ')[0]}
                  <br />
                  <span className="relative">
                    {personalizedGreeting.split(' ').slice(1).join(' ')}
                    <div className="absolute -bottom-2 left-0 w-1/2 h-1 bg-current opacity-30 animate-silk-flow" />
                  </span>
                </h1>
                
                <p className="text-2xl lg:text-3xl font-light leading-relaxed text-gray-700 max-w-2xl">
                  {userSeasonalType 
                    ? (
                        <>
                          Your <span className="font-bold italic">{userSeasonalType.seasonalType}</span> style DNA 
                          <br />is ready to <span className="relative inline-block">
                            shine
                            <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-current opacity-50 animate-shimmer" />
                          </span>
                        </>
                      )
                    : (
                        <>
                          Let's discover your <span className="font-bold italic">unique style DNA</span>
                          <br />and unlock your perfect wardrobe
                        </>
                      )
                  }
                </p>
              </div>
              
              {/* Revolutionary stats display */}
              <div className="flex flex-wrap gap-8">
                <div className="card-liquid p-6 min-w-[120px] text-center">
                  <div 
                    className={`
                      text-4xl font-black mb-2 
                      ${userSeasonalType?.seasonalType === 'Winter' ? 'text-winter-sapphire' : ''}
                      ${userSeasonalType?.seasonalType === 'Spring' ? 'text-spring-tulip' : ''}
                      ${userSeasonalType?.seasonalType === 'Summer' ? 'text-summer-powder' : ''}
                      ${userSeasonalType?.seasonalType === 'Autumn' ? 'text-autumn-gold' : ''}
                      ${!userSeasonalType ? 'text-gray-600' : ''}
                      animate-pulse-gentle
                    `}
                  >
                    {favoriteCount}
                  </div>
                  <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Curated
                  </div>
                </div>
                
                <div className="card-liquid p-6 min-w-[120px] text-center">
                  <div 
                    className={`
                      text-4xl font-black mb-2
                      ${userSeasonalType?.seasonalType === 'Winter' ? 'text-winter-emerald' : ''}
                      ${userSeasonalType?.seasonalType === 'Spring' ? 'text-spring-aqua' : ''}
                      ${userSeasonalType?.seasonalType === 'Summer' ? 'text-summer-sage' : ''}
                      ${userSeasonalType?.seasonalType === 'Autumn' ? 'text-autumn-forest' : ''}
                      ${!userSeasonalType ? 'text-gray-600' : ''}
                      animate-pulse-gentle
                    `}
                    style={{ animationDelay: '0.5s' }}
                  >
                    {friendCount}
                  </div>
                  <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Connected
                  </div>
                </div>
                
                <div className="card-liquid p-6 min-w-[120px] text-center">
                  <div 
                    className={`
                      text-4xl font-black mb-2
                      ${userSeasonalType?.seasonalType === 'Winter' ? 'text-winter-ruby' : ''}
                      ${userSeasonalType?.seasonalType === 'Spring' ? 'text-spring-sunshine' : ''}
                      ${userSeasonalType?.seasonalType === 'Summer' ? 'text-summer-rose' : ''}
                      ${userSeasonalType?.seasonalType === 'Autumn' ? 'text-autumn-rust' : ''}
                      ${!userSeasonalType ? 'text-gray-400' : ''}
                      animate-pulse-gentle
                    `}
                    style={{ animationDelay: '1s' }}
                  >
                    {userSeasonalType ? '1' : '0'}
                  </div>
                  <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                    DNA Decoded
                  </div>
                </div>
              </div>
            </div>
            
            {/* Seasonal Visual - Revolutionary 3D element */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="relative w-80 h-80">
                {userSeasonalType ? (
                  <div 
                    className={`
                      card-seasonal w-full h-full flex items-center justify-center
                      animate-fashion-spin
                    `}
                    data-season={userSeasonalType.seasonalType.toLowerCase()}
                  >
                    <div className="text-center text-white">
                      <div className="text-8xl mb-4 animate-float-subtle">
                        {getSeasonalTypeEmoji(userSeasonalType.seasonalType)}
                      </div>
                      <div className="text-2xl font-black uppercase tracking-widest">
                        {userSeasonalType.seasonalType}
                      </div>
                      <div className="text-lg opacity-90 font-light mt-2">
                        Signature Style
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="card-holographic w-full h-full">
                    <div className="card-holographic-inner flex items-center justify-center text-center">
                      <div>
                        <div className="text-8xl mb-4 animate-float-subtle">🌈</div>
                        <div className="text-2xl font-black text-gray-700 uppercase tracking-widest mb-2">
                          Discover
                        </div>
                        <div className="text-lg text-gray-600 font-light">
                          Your Style DNA
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* REVOLUTIONARY QUICK ACTIONS - Asymmetrical Fashion Grid */}
      <div className="relative z-10 px-6 py-16 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-black mb-12 text-gray-900 tracking-tight">
            Style Actions
            <div className="w-24 h-1 bg-current opacity-30 mt-2 animate-silk-flow" />
          </h2>
          
          {/* Revolutionary asymmetrical grid */}
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 auto-rows-auto">
            {quickActions.map((action, index) => {
              // Revolutionary asymmetrical sizing logic
              const getSizeClass = (idx: number) => {
                const patterns = [
                  'lg:col-span-3 lg:row-span-2', // Large primary
                  'lg:col-span-2 lg:row-span-1', // Medium
                  'lg:col-span-1 lg:row-span-1', // Small
                  'lg:col-span-3 lg:row-span-1', // Wide
                ];
                return patterns[idx % patterns.length];
              };

              const getCardType = (idx: number) => {
                const types = ['card-runway', 'card-liquid', 'card-couture', 'card-asymmetric'];
                return types[idx % types.length];
              };

              return (
                <button
                  key={action.id}
                  onClick={action.action}
                  className={`
                    ${getSizeClass(index)} ${getCardType(index)}
                    group relative overflow-hidden text-left h-48 lg:h-auto
                    transition-all duration-700 ease-out
                    hover:scale-[1.02] hover:z-10
                    animate-draping
                  `}
                  style={{
                    animationDelay: `${index * 150}ms`,
                    minHeight: index === 0 ? '320px' : '180px',
                  }}
                >
                  {/* Revolutionary seasonal background */}
                  <div 
                    className={`
                      absolute inset-0 opacity-80 transition-all duration-1000
                      ${userSeasonalType?.seasonalType === 'Winter' ? 'gradient-winter-jewel' : ''}
                      ${userSeasonalType?.seasonalType === 'Spring' ? 'gradient-spring-garden' : ''}
                      ${userSeasonalType?.seasonalType === 'Summer' ? 'gradient-summer-twilight' : ''}
                      ${userSeasonalType?.seasonalType === 'Autumn' ? 'gradient-autumn-harvest' : ''}
                      ${!userSeasonalType ? 'gradient-adaptive-primary' : ''}
                      group-hover:opacity-100
                    `} 
                  />
                  
                  {/* Fabric texture overlay */}
                  <div className={`
                    absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500
                    ${index % 3 === 0 ? 'gradient-silk' : ''}
                    ${index % 3 === 1 ? 'gradient-chiffon' : ''}
                    ${index % 3 === 2 ? 'gradient-velvet' : ''}
                  `} />
                  
                  {/* Content with fashion magazine layout */}
                  <div className="relative z-10 h-full flex flex-col justify-between p-6 text-white">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div 
                        className={`
                          text-4xl lg:text-5xl group-hover:scale-110 transition-transform duration-500
                          ${index === 0 ? 'animate-fashion-spin' : 'animate-float-subtle'}
                        `}
                        style={{ animationDelay: `${index * 200}ms` }}
                      >
                        {action.icon}
                      </div>
                      
                      {/* Badge with couture styling */}
                      {action.badge && (
                        <div className="px-3 py-1 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-xs font-black uppercase tracking-wider">
                          {action.badge}
                        </div>
                      )}
                    </div>
                    
                    {/* Content area */}
                    <div className="space-y-3">
                      <h3 className={`
                        font-black leading-tight group-hover:animate-runway-walk
                        ${index === 0 ? 'text-2xl lg:text-3xl' : 'text-xl lg:text-2xl'}
                      `}>
                        {action.title}
                      </h3>
                      
                      <p className={`
                        text-white text-opacity-90 font-light leading-relaxed
                        ${index === 0 ? 'text-base' : 'text-sm'}
                      `}>
                        {action.description}
                      </p>
                    </div>
                    
                    {/* Action indicator */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="w-8 h-0.5 bg-white opacity-60 group-hover:w-16 group-hover:opacity-100 transition-all duration-500" />
                      <div className="transform group-hover:translate-x-2 group-hover:scale-110 transition-all duration-300">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover effect border */}
                  <div className="absolute inset-0 border-2 border-white border-opacity-0 group-hover:border-opacity-30 transition-all duration-500 pointer-events-none" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="px-6 py-12 lg:px-8 bg-white bg-opacity-50">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-moonstone-900 mb-8">Style Insights</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {insightCards.map((card, index) => (
              <div
                key={index}
                className="card-glass group cursor-pointer transform transition-all duration-300 hover:scale-105"
                onClick={card.action}
              >
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">{card.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-moonstone-900 mb-2 group-hover:text-aurora-primary transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-moonstone-600 text-sm mb-4">
                      {card.content}
                    </p>
                    <button className="text-aurora-primary font-medium text-sm group-hover:text-cosmic-purple transition-colors">
                      {card.actionText} →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Favorites */}
      {recentFavorites.length > 0 && (
        <div className="px-6 py-12 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-moonstone-900">Your Latest Loves</h2>
              <button
                onClick={handleViewAllFavorites}
                className="btn-magical btn-glass"
              >
                View All {favoriteCount} →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentFavorites.map((product, index) => {
                if (!product) return null;
                return (
                  <div 
                    key={product._id} 
                    className="card-floating group cursor-pointer"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="aspect-square bg-moonstone-100 rounded-2xl mb-4 overflow-hidden">
                      {product.imageUrls && product.imageUrls.length > 0 ? (
                        <img
                          src={product.imageUrls[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-moonstone-400 text-6xl">
                          ✨
                        </div>
                      )}
                    </div>
                    <h4 className="font-semibold text-moonstone-900 mb-2 line-clamp-2 group-hover:text-aurora-primary transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-moonstone-600 text-sm">
                      ${product.price} • {product.retailer}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Seasonal Reminder */}
      {userSeasonalType && (
        <div className="px-6 py-12 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="card-glass bg-gradient-to-r from-white via-purple-50 to-pink-50 border-2 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-moonstone-900 mb-2">
                    Your Color DNA: {userSeasonalType.seasonalType}
                  </h3>
                  <p className="text-moonstone-600 mb-4">
                    {getSeasonalTypeDescription(userSeasonalType.seasonalType)}
                  </p>
                  <button
                    onClick={() => setCurrentPage("colors")}
                    className="btn-magical btn-primary"
                  >
                    View Your Palette ✨
                  </button>
                </div>
                <div className="text-6xl animate-float-subtle">
                  {getSeasonalTypeEmoji(userSeasonalType.seasonalType)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Getting Started CTA */}
      {!userSeasonalType && (
        <div className="px-6 py-12 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="card-glass bg-gradient-sunset text-white text-center">
              <div className="text-6xl mb-6 animate-pulse-gentle">🌟</div>
              <h3 className="text-2xl font-bold mb-4">
                Unlock Your Style Superpower
              </h3>
              <p className="text-white text-opacity-90 mb-8 max-w-2xl mx-auto">
                Discover your unique color DNA and get AI-powered recommendations 
                that make you look and feel absolutely incredible.
              </p>
              <button
                onClick={() => setCurrentPage("quiz")}
                className="btn-magical bg-white text-moonstone-900 hover:bg-moonstone-50"
              >
                Take Your Color Quiz ✨
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getSeasonalTypeDescription(type: string): string {
  const descriptions = {
    Winter: "Bold, clear colors with high contrast. You shine in jewel tones and crisp whites.",
    Spring: "Warm, bright colors with golden undertones. Fresh and vibrant energy radiates from you.",
    Summer: "Soft, muted colors with cool undertones. Gentle elegance is your signature style.",
    Autumn: "Rich, warm colors with golden undertones. Deep and earthy tones bring out your natural beauty.",
  };
  return descriptions[type as keyof typeof descriptions] || "Discover your perfect color palette.";
}

function getSeasonalTypeEmoji(type: string): string {
  const emojis = {
    Winter: "❄️",
    Spring: "🌸",
    Summer: "☀️",
    Autumn: "🍂",
  };
  return emojis[type as keyof typeof emojis] || "🎨";
}