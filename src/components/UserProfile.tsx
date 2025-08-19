import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface UserProfileProps {
  setCurrentPage: (page: string) => void;
}

export function UserProfile({ setCurrentPage }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [favoriteColors, setFavoriteColors] = useState<string[]>([]);
  const [stylePreferences, setStylePreferences] = useState<string[]>([]);

  const loggedInUser = useQuery(api.auth.loggedInUser);
  const userSeasonalType = useQuery(api.quiz.getUserSeasonalType);
  const userOutfits = useQuery(api.outfits.getUserOutfits);
  const userFavorites = useQuery(api.products.getUserFavorites);

  const styleOptions = [
    "Classic", "Bohemian", "Minimalist", "Romantic", "Edgy", 
    "Casual", "Professional", "Trendy", "Vintage", "Sporty"
  ];

  if (!loggedInUser) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your style preferences and profile information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                {loggedInUser.name?.[0] || "U"}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{loggedInUser.name}</h2>
              <p className="text-gray-600">{loggedInUser.email}</p>
            </div>

            {userSeasonalType && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Seasonal Type</h3>
                <div className="text-center">
                  <span className="inline-block px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-semibold">
                    {userSeasonalType.seasonalType}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Outfits Created</span>
                <span className="font-semibold text-gray-900">{userOutfits?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Favorite Items</span>
                <span className="font-semibold text-gray-900">{userFavorites?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Member Since</span>
                <span className="font-semibold text-gray-900">
                  {new Date(loggedInUser._creationTime).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">About Me</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                {isEditing ? "Cancel" : "Edit"}
              </button>
            </div>
            
            {isEditing ? (
              <div className="space-y-4">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about your style and fashion preferences..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={4}
                />
                <button
                  onClick={() => {
                    setIsEditing(false);
                    toast.success("Profile updated!");
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <p className="text-gray-600">
                {bio || "No bio added yet. Click edit to add information about yourself!"}
              </p>
            )}
          </div>

          {/* Style Preferences */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Style Preferences</h3>
            <div className="flex flex-wrap gap-2">
              {styleOptions.map((style) => (
                <button
                  key={style}
                  onClick={() => {
                    setStylePreferences(prev => 
                      prev.includes(style) 
                        ? prev.filter(s => s !== style)
                        : [...prev, style]
                    );
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    stylePreferences.includes(style)
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-purple-100"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Seasonal Colors */}
          {userSeasonalType && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Perfect Colors</h3>
              <div className="flex flex-wrap gap-3">
                {Array.isArray(userSeasonalType.colors) ? userSeasonalType.colors.map((color) => (
                  <span
                    key={color}
                    className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-sm font-medium"
                  >
                    {color}
                  </span>
                )) : null}
              </div>
            </div>
          )}

          {/* Recent Outfits */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Outfits</h3>
            {Array.isArray(userOutfits) && userOutfits.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userOutfits.slice(0, 4).map((outfit) => (
                  <div key={outfit._id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{outfit.name}</h4>
                    <div className="flex space-x-2 mb-2">
                      {Array.isArray(outfit.products) ? outfit.products.slice(0, 3).map((product, index) => (
                        product && (
                          <img
                            key={index}
                            src={product.imageUrls?.[0] || "/api/placeholder/40/40"}
                            alt={product.name || "Item"}
                            className="w-10 h-10 object-cover rounded"
                          />
                        )
                      )) : null}
                    </div>
                    <p className="text-sm text-gray-600">
                      {Array.isArray(outfit.products) ? outfit.products.length : 0} items
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No outfits created yet. Start building your first outfit!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
