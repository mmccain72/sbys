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
    <div className="min-h-screen bg-gradient-to-br from-moonstone-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-aurora opacity-10" />
        <div className="relative px-6 py-12 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <h1 className="text-4xl lg:text-6xl font-bold text-gradient mb-4 animate-float-subtle">
                {personalizedGreeting}
              </h1>
              <p className="text-xl text-moonstone-600 mb-8 max-w-2xl mx-auto">
                {userSeasonalType 
                  ? `Your ${userSeasonalType.seasonalType} style DNA is ready to shine ✨`
                  : "Let's discover your unique style DNA and unlock your perfect wardrobe"
                }
              </p>
              
              {/* Quick Stats */}
              <div className="flex justify-center space-x-8 mb-12">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cosmic-purple">{favoriteCount}</div>
                  <div className="text-sm text-moonstone-500">Saved Items</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cosmic-pink">{friendCount}</div>
                  <div className="text-sm text-moonstone-500">Style Friends</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-aurora-primary">
                    {userSeasonalType ? '1' : '0'}
                  </div>
                  <div className="text-sm text-moonstone-500">Quiz Complete</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-moonstone-900 mb-8">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <button
                key={action.id}
                onClick={action.action}
                className={`
                  group relative overflow-hidden rounded-3xl p-8 text-left
                  transition-all duration-500 hover:scale-105 hover:-translate-y-2
                  ${action.glow ? 'shadow-2xl' : 'shadow-lg hover:shadow-2xl'}
                `}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-90`} />
                
                {/* Glass overlay */}
                <div className="absolute inset-0 bg-glass-light backdrop-blur-sm" />
                
                {/* Glow effect */}
                {action.glow && (
                  <div className={`absolute -inset-1 bg-gradient-to-r ${action.gradient} rounded-3xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-500`} />
                )}
                
                {/* Content */}
                <div className="relative z-10 text-white">
                  {/* Icon */}
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {action.icon}
                  </div>
                  
                  {/* Badge */}
                  {action.badge && (
                    <div className="inline-block px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-semibold mb-3">
                      {action.badge}
                    </div>
                  )}
                  
                  {/* Title */}
                  <h3 className="text-xl font-bold mb-2 group-hover:text-yellow-200 transition-colors">
                    {action.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-white text-opacity-90 text-sm leading-relaxed">
                    {action.description}
                  </p>
                  
                  {/* Arrow */}
                  <div className="mt-4 transform group-hover:translate-x-2 transition-transform duration-300">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
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