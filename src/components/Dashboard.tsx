import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface DashboardProps {
  setCurrentPage: (page: string) => void;
}

export function Dashboard({ setCurrentPage }: DashboardProps) {
  const user = useQuery(api.auth.loggedInUser);
  const userSeasonalType = useQuery(api.quiz.getUserSeasonalType);
  const userFavorites = useQuery(api.products.getUserFavorites);
  // For now, we'll use messages to get recent shares
  const recentShares = [];
  const friends = useQuery(api.social.getFriends);

  const favoriteCount = userFavorites?.length || 0;
  const shareCount = recentShares?.length || 0;
  const friendCount = friends?.length || 0;

  // Get recent favorites (last 3)
  const recentFavorites = userFavorites?.slice(0, 3) || [];

  const handleViewAllFavorites = () => {
    // Set a flag in localStorage to indicate favorites-only mode
    localStorage.setItem('viewFavoritesOnly', 'true');
    setCurrentPage("browse");
  };

  const handleViewAllShares = () => {
    setCurrentPage("social");
  };

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to StyleSeason</h1>
          <p className="text-gray-600 mb-6">Please sign in to access your personalized dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user.name || "Fashionista"}! 👋
            </h1>
            <p className="text-purple-100">
              {userSeasonalType 
                ? `Your seasonal type: ${userSeasonalType.seasonalType}` 
                : "Discover your perfect colors and style"
              }
            </p>
          </div>
          <div className="text-6xl opacity-20">
            ✨
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setCurrentPage("quiz")}
          className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
              🎨
            </div>
            <div className="text-blue-600 group-hover:translate-x-1 transition-transform">
              →
            </div>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">
            {userSeasonalType ? "Retake Quiz" : "Take Color Quiz"}
          </h3>
          <p className="text-sm text-gray-600">
            {userSeasonalType 
              ? "Update your seasonal color profile" 
              : "Discover your perfect seasonal colors"
            }
          </p>
        </button>

        <button
          onClick={() => setCurrentPage("browse")}
          className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
              🛍️
            </div>
            <div className="text-purple-600 group-hover:translate-x-1 transition-transform">
              →
            </div>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Browse Products</h3>
          <p className="text-sm text-gray-600">
            Explore curated fashion items for your style
          </p>
        </button>

        <button
          onClick={() => setCurrentPage("outfits")}
          className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
              👗
            </div>
            <div className="text-green-600 group-hover:translate-x-1 transition-transform">
              →
            </div>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Build Outfits</h3>
          <p className="text-sm text-gray-600">
            Create and save your perfect looks
          </p>
        </button>

        <button
          onClick={() => setCurrentPage("social")}
          className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center text-2xl">
              👥
            </div>
            <div className="text-pink-600 group-hover:translate-x-1 transition-transform">
              →
            </div>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Social Hub</h3>
          <p className="text-sm text-gray-600">
            Connect with friends and share styles
          </p>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Favorites */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Your Favorites</h3>
            <span className="text-2xl">❤️</span>
          </div>
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {favoriteCount}
          </div>
          <p className="text-sm text-gray-600 mb-4">
            {favoriteCount === 0 
              ? "No favorites yet" 
              : `${favoriteCount} favorite item${favoriteCount !== 1 ? 's' : ''}`
            }
          </p>
          {favoriteCount > 0 && (
            <button
              onClick={handleViewAllFavorites}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              View ALL {favoriteCount} favorites →
            </button>
          )}
        </div>

        {/* Recent Shares */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Shares</h3>
            <span className="text-2xl">📤</span>
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">
            {shareCount}
          </div>
          <p className="text-sm text-gray-600 mb-4">
            {shareCount === 0 
              ? "No shares yet" 
              : `${shareCount} recent share${shareCount !== 1 ? 's' : ''}`
            }
          </p>
          {shareCount > 0 && (
            <button
              onClick={handleViewAllShares}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              View all shares →
            </button>
          )}
        </div>

        {/* Friends */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Friends</h3>
            <span className="text-2xl">👥</span>
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {friendCount}
          </div>
          <p className="text-sm text-gray-600 mb-4">
            {friendCount === 0 
              ? "No friends yet" 
              : `${friendCount} friend${friendCount !== 1 ? 's' : ''}`
            }
          </p>
          <button
            onClick={() => setCurrentPage("social")}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {friendCount === 0 ? "Add friends" : "Manage friends"} →
          </button>
        </div>
      </div>

      {/* Recent Favorites Preview */}
      {recentFavorites.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Recent Favorites</h3>
            <button
              onClick={handleViewAllFavorites}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              View all →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentFavorites.map((product) => {
              if (!product) return null;
              return (
                <div key={product._id} className="group cursor-pointer">
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                  {product.imageUrls && product.imageUrls.length > 0 ? (
                    <img
                      src={product.imageUrls[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                      👗
                    </div>
                  )}
                </div>
                <h4 className="font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-purple-600 transition-colors">
                  {product.name}
                </h4>
                <p className="text-sm text-gray-600">
                  ${product.price} • {product.retailer}
                </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Seasonal Color Reminder */}
      {userSeasonalType && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Your Seasonal Type: {userSeasonalType.seasonalType}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {getSeasonalTypeDescription(userSeasonalType.seasonalType)}
              </p>
              <button
                onClick={() => setCurrentPage("colors")}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                View your color palette →
              </button>
            </div>
            <div className="text-4xl">
              {getSeasonalTypeEmoji(userSeasonalType.seasonalType)}
            </div>
          </div>
        </div>
      )}

      {/* Getting Started */}
      {!userSeasonalType && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                🌟 Get Started with Your Color Journey
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Take our quick quiz to discover your seasonal color type and unlock personalized fashion recommendations.
              </p>
              <button
                onClick={() => setCurrentPage("quiz")}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
              >
                Take Color Quiz
              </button>
            </div>
            <div className="text-4xl">
              🎨
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getSeasonalTypeDescription(type: string): string {
  const descriptions = {
    Winter: "Bold, clear colors with high contrast. Think jewel tones and crisp whites.",
    Spring: "Warm, bright colors with golden undertones. Fresh and vibrant like spring flowers.",
    Summer: "Soft, muted colors with cool undertones. Gentle and elegant like a summer breeze.",
    Autumn: "Rich, warm colors with golden undertones. Deep and earthy like autumn leaves.",
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
