import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface GroupFeedProps {
  groupId: Id<"groups">;
  onClose: () => void;
}

export function GroupFeed({ groupId, onClose }: GroupFeedProps) {
  const [activeTab, setActiveTab] = useState<"feed" | "members" | "about">("feed");
  const [postContent, setPostContent] = useState("");
  const [postType, setPostType] = useState<"tip" | "question" | "product_share" | "outfit_share">("tip");
  const [showPostForm, setShowPostForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedOutfit, setSelectedOutfit] = useState<any>(null);

  // Queries
  const groups = useQuery(api.groups.getAllGroups);
  const group = groups?.find(g => g._id === groupId);
  const posts = useQuery(api.groups.getGroupPosts, { groupId, limit: 50 });
  const members = useQuery(api.groups.getGroupMembers, { groupId, limit: 20 });
  const userProducts = useQuery(api.products.getUserFavorites);
  const userOutfits = useQuery(api.outfits.getUserOutfits);

  // Mutations
  const createPost = useMutation(api.groups.createGroupPost);
  const likePost = useMutation(api.groups.likePost);
  const createComment = useMutation(api.groups.createComment);

  const handleCreatePost = async () => {
    if (!postContent.trim()) return;

    try {
      await createPost({
        groupId,
        content: postContent,
        postType,
        productId: selectedProduct?._id,
        outfitId: selectedOutfit?._id,
      });
      setPostContent("");
      setShowPostForm(false);
      setSelectedProduct(null);
      setSelectedOutfit(null);
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };

  // Get seasonal theme
  const getSeasonalTheme = (seasonalType: string) => {
    switch (seasonalType) {
      case "Winter":
        return {
          gradient: "from-blue-600 to-indigo-700",
          lightGradient: "from-blue-50 to-indigo-100",
          accentColor: "blue",
        };
      case "Spring":
        return {
          gradient: "from-orange-500 to-pink-500",
          lightGradient: "from-orange-50 to-pink-100",
          accentColor: "orange",
        };
      case "Summer":
        return {
          gradient: "from-pink-500 to-purple-500",
          lightGradient: "from-pink-50 to-purple-100",
          accentColor: "pink",
        };
      case "Autumn":
        return {
          gradient: "from-amber-600 to-orange-600",
          lightGradient: "from-amber-50 to-orange-100",
          accentColor: "amber",
        };
      default:
        return {
          gradient: "from-gray-500 to-gray-700",
          lightGradient: "from-gray-50 to-gray-100",
          accentColor: "gray",
        };
    }
  };

  const theme = group ? getSeasonalTheme(group.seasonalType) : getSeasonalTheme("Winter");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`bg-gradient-to-r ${theme.gradient} p-6 text-white`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <span className="text-4xl">
                {group?.seasonalType === "Winter" && "❄️"}
                {group?.seasonalType === "Spring" && "🌸"}
                {group?.seasonalType === "Summer" && "☀️"}
                {group?.seasonalType === "Autumn" && "🍂"}
              </span>
              <div>
                <h2 className="text-2xl font-bold">{group?.name || "Loading..."}</h2>
                <p className="text-white/80">{group?.actualMemberCount || 0} members</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-6">
            {["feed", "members", "about"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-2 px-1 border-b-2 font-medium capitalize transition-all ${
                  activeTab === tab
                    ? "border-white text-white"
                    : "border-transparent text-white/70 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Feed Tab */}
          {activeTab === "feed" && (
            <div className="p-6">
              {/* Create Post Button */}
              {!showPostForm && (
                <button
                  onClick={() => setShowPostForm(true)}
                  className={`w-full mb-6 p-4 bg-gradient-to-r ${theme.lightGradient} border-2 border-dashed border-${theme.accentColor}-300 rounded-xl text-${theme.accentColor}-700 font-medium hover:border-solid transition-all`}
                >
                  + Share something with your seasonal group
                </button>
              )}

              {/* Post Creation Form */}
              {showPostForm && (
                <div className="bg-white border rounded-xl p-4 mb-6 shadow-sm">
                  <div className="flex space-x-2 mb-4">
                    {(["tip", "question", "product_share", "outfit_share"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setPostType(type)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                          postType === type
                            ? `bg-gradient-to-r ${theme.gradient} text-white`
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {type === "tip" && "💡 Tip"}
                        {type === "question" && "❓ Question"}
                        {type === "product_share" && "🛍️ Product"}
                        {type === "outfit_share" && "👗 Outfit"}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder={
                      postType === "tip" ? "Share a style tip for your seasonal group..." :
                      postType === "question" ? "Ask your seasonal group a question..." :
                      postType === "product_share" ? "Why does this product work for our season?" :
                      "Describe this outfit and why it works for our season..."
                    }
                    className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={4}
                  />

                  {/* Product/Outfit Selector for shares */}
                  {postType === "product_share" && userProducts && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Select a product to share:</p>
                      <div className="flex space-x-2 overflow-x-auto py-2">
                        {userProducts.map((product: any) => (
                          <button
                            key={product._id}
                            onClick={() => setSelectedProduct(product)}
                            className={`flex-shrink-0 p-2 border rounded-lg transition-all ${
                              selectedProduct?._id === product._id
                                ? "border-purple-500 bg-purple-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <img 
                              src={product.externalImageUrls?.[0] || "/placeholder.jpg"} 
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {postType === "outfit_share" && userOutfits && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Select an outfit to share:</p>
                      <div className="flex space-x-2 overflow-x-auto py-2">
                        {userOutfits.map((outfit: any) => (
                          <button
                            key={outfit._id}
                            onClick={() => setSelectedOutfit(outfit)}
                            className={`flex-shrink-0 p-2 border rounded-lg transition-all ${
                              selectedOutfit?._id === outfit._id
                                ? "border-purple-500 bg-purple-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                              <span className="text-xs text-gray-600">{outfit.name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      onClick={() => {
                        setShowPostForm(false);
                        setPostContent("");
                        setSelectedProduct(null);
                        setSelectedOutfit(null);
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreatePost}
                      disabled={!postContent.trim()}
                      className={`px-6 py-2 bg-gradient-to-r ${theme.gradient} text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50`}
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}

              {/* Posts Feed */}
              <div className="space-y-4">
                {posts?.length === 0 && (
                  <div className="text-center py-12">
                    <span className="text-4xl mb-4 block">🌟</span>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No posts yet</h3>
                    <p className="text-gray-500">Be the first to share something with your seasonal group!</p>
                  </div>
                )}

                {posts?.map((post) => (
                  <PostCard key={post._id} post={post} theme={theme} onLike={likePost} />
                ))}
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === "members" && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members?.map((member: any) => (
                  <div key={member._id} className="bg-white border rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 bg-gradient-to-br ${theme.lightGradient} rounded-full flex items-center justify-center`}>
                        <span className="text-lg font-semibold text-${theme.accentColor}-700">
                          {member.name?.[0]?.toUpperCase() || "U"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{member.name || "User"}</h4>
                        <p className="text-xs text-gray-500">
                          {member.membershipType === "expert" && "🌟 Expert"}
                          {member.membershipType === "moderator" && "👮 Moderator"}
                          {member.membershipType === "member" && "Member"}
                        </p>
                      </div>
                      <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                        Connect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* About Tab */}
          {activeTab === "about" && (
            <div className="p-6">
              <div className="max-w-3xl mx-auto">
                <h3 className="text-xl font-bold text-gray-900 mb-4">About {group?.name}</h3>
                <p className="text-gray-600 mb-6">{group?.description}</p>
                
                <div className={`bg-gradient-to-r ${theme.lightGradient} rounded-xl p-6 mb-6`}>
                  <h4 className="font-semibold text-gray-900 mb-3">Your Seasonal Palette</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["Best Colors", "Avoid Colors", "Best Patterns", "Jewelry"].map((category) => (
                      <div key={category}>
                        <p className="text-sm font-medium text-gray-700 mb-1">{category}</p>
                        <p className="text-xs text-gray-600">
                          {category === "Best Colors" && "Jewel tones, crisp whites"}
                          {category === "Avoid Colors" && "Muted, dusty shades"}
                          {category === "Best Patterns" && "Bold, high contrast"}
                          {category === "Jewelry" && "Silver, platinum, white gold"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white border rounded-xl p-4">
                    <span className="text-2xl mb-2 block">📚</span>
                    <h5 className="font-semibold text-gray-900 mb-1">Style Guides</h5>
                    <p className="text-sm text-gray-600">Curated guides for your season</p>
                  </div>
                  <div className="bg-white border rounded-xl p-4">
                    <span className="text-2xl mb-2 block">🎯</span>
                    <h5 className="font-semibold text-gray-900 mb-1">Challenges</h5>
                    <p className="text-sm text-gray-600">Weekly style challenges</p>
                  </div>
                  <div className="bg-white border rounded-xl p-4">
                    <span className="text-2xl mb-2 block">💬</span>
                    <h5 className="font-semibold text-gray-900 mb-1">Discussions</h5>
                    <p className="text-sm text-gray-600">Connect with your color tribe</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Post Card Component
function PostCard({ post, theme, onLike }: any) {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case "tip": return "💡";
      case "question": return "❓";
      case "product_share": return "🛍️";
      case "outfit_share": return "👗";
      default: return "📝";
    }
  };

  return (
    <div className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        {/* Post Header */}
        <div className="flex items-start space-x-3 mb-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${theme.lightGradient} rounded-full flex items-center justify-center flex-shrink-0`}>
            <span className="text-sm font-semibold text-${theme.accentColor}-700">
              {post.user?.name?.[0]?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-gray-900">{post.user?.name || "User"}</h4>
              <span className="text-xs text-gray-500">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm">{getPostTypeIcon(post.postType)}</span>
              <span className="text-xs text-gray-600 capitalize">
                {post.postType.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <p className="text-gray-800 mb-3">{post.content}</p>

        {/* Attached Product/Outfit */}
        {post.product && (
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <div className="flex items-center space-x-3">
              <img 
                src={post.product.externalImageUrls?.[0] || "/placeholder.jpg"} 
                alt={post.product.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <p className="font-medium text-gray-900">{post.product.name}</p>
                <p className="text-sm text-gray-600">${post.product.price}</p>
              </div>
            </div>
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center space-x-4 pt-3 border-t">
          <button
            onClick={() => onLike({ postId: post._id })}
            className="flex items-center space-x-1 text-gray-600 hover:text-purple-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-sm">{post.likes?.length || 0}</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-1 text-gray-600 hover:text-purple-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm">{post.commentCount || 0}</span>
          </button>
          <button className="flex items-center space-x-1 text-gray-600 hover:text-purple-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
            </svg>
            <span className="text-sm">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}