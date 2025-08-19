import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";
import React from "react";

interface SocialHubProps {
  setCurrentPage: (page: string) => void;
}

export function SocialHub({ setCurrentPage }: SocialHubProps) {
  const [activeTab, setActiveTab] = useState<"feed" | "friends" | "messages">("feed");

  // Defensive useMemo for tab navigation data
  const tabsData = React.useMemo(() => {
    try {
      const tabs = [
        { id: "feed", label: "Feed", icon: "🌟", gradient: "from-blue-500 to-purple-600", accent: "bg-blue-500" },
        { id: "friends", label: "Friends", icon: "👥", gradient: "from-green-500 to-teal-600", accent: "bg-green-500" },
        { id: "messages", label: "Messages", icon: "💬", gradient: "from-pink-500 to-rose-600", accent: "bg-pink-500" },
      ];
      
      return tabs.filter(tab => 
        tab && 
        typeof tab === 'object' && 
        tab.id && 
        tab.label && 
        tab.icon
      );
    } catch (error) {
      console.error('Error processing tabs data:', error);
      return [];
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Header */}
        <div className="text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 blur-3xl rounded-full"></div>
          <div className="relative">
            <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Social Hub
            </h1>
            <p className="text-xl text-gray-700 font-medium">Connect, Share, and Style Together</p>
          </div>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-3 border border-white/20">
          <div className="flex space-x-3">
            {tabsData.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 group relative overflow-hidden rounded-2xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.gradient} text-white shadow-xl scale-105 transform`
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50/80"
                }`}
              >
                <div className="flex items-center justify-center space-x-3 px-6 py-4 relative z-10">
                  <span className="text-2xl">{tab.icon}</span>
                  <span className="font-bold text-lg">{tab.label}</span>
                </div>
                {activeTab === tab.id && (
                  <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="relative">
          {activeTab === "feed" && <FeedTab />}
          {activeTab === "friends" && <FriendsTab />}
          {activeTab === "messages" && <MessagesTab />}
        </div>
      </div>
    </div>
  );
}

function FeedTab() {
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  
  const feed = useQuery(api.social.getFeed, { limit: 20 });
  const createPost = useMutation(api.social.createPost);
  const toggleLike = useMutation(api.social.toggleLike);
  const addComment = useMutation(api.social.addComment);

  // Defensive processing for feed data
  const feedPosts = React.useMemo(() => {
    try {
      if (!feed) return [];
      if (!Array.isArray(feed)) return [];
      return feed.filter(post => 
        post && 
        typeof post === 'object' && 
        post._id
      );
    } catch (error) {
      console.error('Error processing feed posts:', error);
      return [];
    }
  }, [feed]);

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && selectedImages.length === 0) return;
    
    setIsPosting(true);
    try {
      await createPost({
        content: newPostContent,
        postType: selectedImages.length > 0 ? "image" : "text",
        imageUrls: selectedImages.length > 0 ? selectedImages : undefined,
        isPublic: true,
      });
      setNewPostContent("");
      setSelectedImages([]);
      toast.success("Post created!");
    } catch (error) {
      toast.error("Failed to create post");
    } finally {
      setIsPosting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImageUrls: string[] = [];
    
    for (let i = 0; i < files.length && i < 4; i++) {
      const file = files[i];
      const reader = new FileReader();
      
      await new Promise<void>((resolve) => {
        reader.onloadend = () => {
          if (reader.result) {
            newImageUrls.push(reader.result as string);
          }
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }
    
    setSelectedImages([...selectedImages, ...newImageUrls].slice(0, 4));
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handleLike = async (postId: Id<"socialPosts">) => {
    try {
      await toggleLike({ postId });
    } catch (error) {
      toast.error("Failed to like post");
    }
  };

  return (
    <div className="space-y-8">
      {/* Create Post - Enhanced with Blue Theme */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 rounded-3xl shadow-2xl p-8 backdrop-blur-sm">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-2xl">✨</span>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Share Your Style Story
          </h2>
        </div>
        <div className="space-y-6">
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="What's inspiring your style today? Share your fashion thoughts..."
            className="w-full p-6 border-2 border-blue-200 rounded-2xl resize-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg"
            rows={4}
          />
          
          {/* Image Upload Section */}
          <div className="space-y-4">
            {selectedImages.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {selectedImages.map((url, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={url} 
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-xl border-2 border-blue-200"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-center gap-4">
              <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={selectedImages.length >= 4}
                />
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-xl hover:from-purple-200 hover:to-pink-200 transition-all duration-200 font-medium">
                  📷 Add Photos
                  {selectedImages.length > 0 && (
                    <span className="text-sm">({selectedImages.length}/4)</span>
                  )}
                </div>
              </label>
              
              {selectedImages.length > 0 && (
                <button
                  onClick={() => setSelectedImages([])}
                  className="px-4 py-2 text-gray-600 hover:text-red-600 font-medium transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleCreatePost}
              disabled={(!newPostContent.trim() && selectedImages.length === 0) || isPosting}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-gray-900 rounded-2xl hover:from-orange-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-2xl transform hover:scale-105 transition-all duration-300 animate-pulse hover:animate-none"
            >
              {isPosting ? "✨ Posting..." : "🌟 Share Post"}
            </button>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-6">
        {feedPosts.length > 0 ? (
          feedPosts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onLike={() => handleLike(post._id)}
              onComment={addComment}
            />
          ))
        ) : feed === undefined ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-12 text-center border border-white/20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
            <p className="text-gray-600 mt-4 text-lg font-medium">Loading your style feed...</p>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-12 text-center border border-white/20">
            <div className="text-6xl mb-4">🌟</div>
            <p className="text-gray-600 text-lg font-medium">No posts yet. Start following friends to see their style updates!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PostCard({ post, onLike, onComment }: any) {
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);

  // Defensive processing for post data
  const postLikes = React.useMemo(() => {
    try {
      if (!post?.likes) return [];
      if (!Array.isArray(post.likes)) return [];
      return post.likes.filter((like: any) => like && typeof like === 'object');
    } catch (error) {
      console.error('Error processing post likes:', error);
      return [];
    }
  }, [post]);

  const postComments = React.useMemo(() => {
    try {
      if (!post?.comments) return [];
      if (!Array.isArray(post.comments)) return [];
      return post.comments.filter((comment: any) => 
        comment && 
        typeof comment === 'object' && 
        comment._id
      );
    } catch (error) {
      console.error('Error processing post comments:', error);
      return [];
    }
  }, [post]);

  const handleComment = async () => {
    if (!commentText.trim()) return;
    
    try {
      await onComment({
        postId: post._id,
        content: commentText,
      });
      setCommentText("");
      toast.success("Comment added!");
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30 relative overflow-hidden">
      {/* Gradient accent border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      
      {/* Post Header */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center ring-4 ring-blue-100">
          <span className="text-white font-bold text-lg">
            {post.author?.name?.[0] || "?"}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-xl text-gray-900">{post.author?.name || "Unknown User"}</h3>
          <p className="text-gray-500 font-medium">{formatTime(post._creationTime)}</p>
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-6">
        <p className="text-gray-800 text-lg leading-relaxed font-medium">{post.content}</p>
        
        {/* Images */}
        {post.imageUrls && post.imageUrls.length > 0 && (
          <div className={`mt-6 grid ${post.imageUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
            {post.imageUrls.map((url: string, index: number) => (
              <div key={index} className="relative group overflow-hidden rounded-2xl">
                <img 
                  src={url} 
                  alt={`Post image ${index + 1}`}
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
                  style={{ maxHeight: post.imageUrls.length === 1 ? '500px' : '250px' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        )}
        
        {/* Product/Outfit attachments */}
        {post.product && (
          <div className="mt-6 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200/50">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">👗</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg text-gray-900">{post.product.name}</h4>
                <p className="text-xl font-bold text-indigo-600">${post.product.price}</p>
                <p className="text-sm text-gray-600 font-medium">{post.product.retailer}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <div className="flex items-center space-x-6">
          <button
            onClick={onLike}
            className={`flex items-center space-x-3 px-6 py-3 rounded-2xl transition-all duration-300 font-bold ${
              post.isLiked
                ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg transform scale-105"
                : "text-gray-600 hover:bg-gradient-to-r hover:from-pink-100 hover:to-rose-100 hover:text-pink-600"
            }`}
          >
            <span className="text-lg">{post.isLiked ? "❤️" : "🤍"}</span>
            <span>{postLikes.length}</span>
          </button>
          
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-3 px-6 py-3 rounded-2xl text-gray-600 hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 hover:text-blue-600 transition-all duration-300 font-bold"
          >
            <span className="text-lg">💬</span>
            <span>{postComments.length}</span>
          </button>
        </div>
      </div>

      {/* Comments Section - Enhanced Visual Hierarchy */}
      {showComments && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="space-y-4 mb-6">
            {postComments.map((comment: any) => (
              <div key={comment._id} className="flex items-start space-x-4 p-4 bg-gray-50/80 rounded-2xl opacity-75 scale-95">
                <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs">
                    {comment.author?.name?.[0] || "?"}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                    <p className="font-medium text-xs text-gray-700 mb-1">{comment.author?.name}</p>
                    <p className="text-gray-600 text-sm">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex space-x-4">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a thoughtful comment..."
              className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
              onKeyPress={(e) => e.key === "Enter" && handleComment()}
            />
            <button
              onClick={handleComment}
              disabled={!commentText.trim()}
              className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FriendsTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  
  const friends = useQuery(api.social.getFriends);
  const pendingRequests = useQuery(api.social.getPendingFriendRequests);
  const searchResults = useQuery(api.social.searchUsers, 
    searchTerm.length >= 2 ? { searchTerm } : "skip"
  );
  
  const sendFriendRequest = useMutation(api.social.sendFriendRequest);
  const respondToFriendRequest = useMutation(api.social.respondToFriendRequest);

  // Defensive processing for friends data
  const friendsList = React.useMemo(() => {
    try {
      if (!friends) return [];
      if (!Array.isArray(friends)) return [];
      return friends.filter(friend => 
        friend && 
        typeof friend === 'object' && 
        friend._id
      );
    } catch (error) {
      console.error('Error processing friends list:', error);
      return [];
    }
  }, [friends]);

  // Defensive processing for pending requests
  const pendingRequestsList = React.useMemo(() => {
    try {
      if (!pendingRequests) return [];
      if (!Array.isArray(pendingRequests)) return [];
      return pendingRequests.filter(request => 
        request && 
        typeof request === 'object' && 
        request._id &&
        request.requester
      );
    } catch (error) {
      console.error('Error processing pending requests:', error);
      return [];
    }
  }, [pendingRequests]);

  // Defensive processing for search results
  const searchResultsList = React.useMemo(() => {
    try {
      if (!searchResults) return [];
      if (!Array.isArray(searchResults)) return [];
      return searchResults.filter(user => 
        user && 
        typeof user === 'object' && 
        user._id
      );
    } catch (error) {
      console.error('Error processing search results:', error);
      return [];
    }
  }, [searchResults]);

  const handleSendRequest = async (userId: Id<"users">) => {
    try {
      await sendFriendRequest({ addresseeId: userId });
      toast.success("Friend request sent!");
      setSearchTerm("");
    } catch (error) {
      toast.error("Failed to send friend request");
    }
  };

  const handleRespondToRequest = async (friendshipId: Id<"friendships">, response: "accepted" | "declined") => {
    try {
      await respondToFriendRequest({ friendshipId, response });
      toast.success(`Friend request ${response}!`);
    } catch (error) {
      toast.error("Failed to respond to friend request");
    }
  };

  return (
    <div className="space-y-8">
      {/* Add Friends - Enhanced with Green Theme */}
      <div className="bg-gradient-to-br from-green-50 to-teal-50 border border-green-200/50 rounded-3xl shadow-2xl p-8 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center">
              <span className="text-2xl">🌟</span>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              Discover Style Friends
            </h2>
          </div>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-gray-900 rounded-2xl hover:from-green-700 hover:to-teal-700 font-bold shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            {showSearch ? "Cancel" : "✨ Find Friends"}
          </button>
        </div>
        
        {showSearch && (
          <div className="space-y-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for style enthusiasts..."
              className="w-full px-6 py-4 border-2 border-green-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 text-lg"
            />
            
            {searchResultsList.length > 0 && (
              <div className="space-y-4">
                {searchResultsList.map((user) => (
                  <div key={user._id} className="flex items-center justify-between p-6 bg-white/80 rounded-2xl shadow-lg border border-green-100">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-teal-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {user.name?.[0] || "?"}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-lg text-gray-900">{user.name}</p>
                        <p className="text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSendRequest(user._id)}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-gray-900 rounded-2xl hover:from-green-700 hover:to-teal-700 font-bold shadow-lg transform hover:scale-105 transition-all duration-300"
                    >
                      Add Friend
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pending Requests */}
      {pendingRequestsList.length > 0 && (
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200/50 rounded-3xl shadow-2xl p-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-2xl">⏰</span>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Friend Requests
            </h2>
          </div>
          <div className="space-y-4">
            {pendingRequestsList.map((request: any) => (
              <div key={request._id} className="flex items-center justify-between p-6 bg-white/90 rounded-2xl shadow-lg border border-yellow-100">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {request.requester.name?.[0] || "?"}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-lg text-gray-900">{request.requester.name}</p>
                    <p className="text-gray-600">wants to connect with you!</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleRespondToRequest(request._id, "accepted")}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 font-bold shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRespondToRequest(request._id, "declined")}
                    className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl hover:from-gray-600 hover:to-gray-700 font-bold shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center">
            <span className="text-2xl">👥</span>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            Your Style Crew ({friendsList.length})
          </h2>
        </div>
        
        {friendsList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {friendsList.map((friend: any) => (
              <div key={friend._id} className="flex items-center space-x-4 p-6 bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl border border-green-100 shadow-lg">
                <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {friend.name?.[0] || "?"}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg text-gray-900">{friend.name}</p>
                  <p className="text-gray-600">{friend.email}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌟</div>
            <p className="text-gray-600 text-lg font-medium">No friends yet. Start connecting with fellow style enthusiasts!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MessagesTab() {
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [messageText, setMessageText] = useState("");
  
  const friends = useQuery(api.social.getFriends);
  const conversation = useQuery(
    api.social.getConversation,
    selectedFriend ? { friendId: selectedFriend._id } : "skip"
  );
  const unreadCount = useQuery(api.social.getUnreadMessageCount);
  
  const sendMessage = useMutation(api.social.sendMessage);
  const markAsRead = useMutation(api.social.markMessagesAsRead);

  // Defensive processing for friends data
  const friendsList = React.useMemo(() => {
    try {
      if (!friends) return [];
      if (!Array.isArray(friends)) return [];
      return friends.filter(friend => 
        friend && 
        typeof friend === 'object' && 
        friend._id
      );
    } catch (error) {
      console.error('Error processing friends list:', error);
      return [];
    }
  }, [friends]);

  // Defensive processing for conversation data
  const conversationMessages = React.useMemo(() => {
    try {
      if (!conversation) return [];
      if (!Array.isArray(conversation)) return [];
      return conversation.filter(message => 
        message && 
        typeof message === 'object' && 
        message._id
      );
    } catch (error) {
      console.error('Error processing conversation messages:', error);
      return [];
    }
  }, [conversation]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedFriend) return;
    
    try {
      await sendMessage({
        receiverId: selectedFriend._id,
        content: messageText,
        messageType: "text",
      });
      setMessageText("");
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const handleSelectFriend = async (friend: any) => {
    setSelectedFriend(friend);
    if (friend) {
      await markAsRead({ friendId: friend._id });
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/30" style={{ height: "700px" }}>
      <div className="flex h-full">
        {/* Friends List - Enhanced with Pink Theme */}
        <div className="w-1/3 bg-gradient-to-br from-pink-50 to-rose-50 border-r border-pink-200/50 flex flex-col">
          <div className="p-6 border-b border-pink-200/50 bg-gradient-to-r from-pink-500 to-rose-600">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <div>
                <h3 className="font-bold text-white text-xl">Messages</h3>
                {unreadCount && unreadCount > 0 && (
                  <p className="text-pink-100 font-medium">{unreadCount} unread messages</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {friendsList.length > 0 ? (
              friendsList.map((friend: any) => (
                <button
                  key={friend._id}
                  onClick={() => handleSelectFriend(friend)}
                  className={`w-full flex items-center space-x-4 p-6 hover:bg-white/50 transition-all duration-300 ${
                    selectedFriend?._id === friend._id ? "bg-white/80 border-r-4 border-pink-500 shadow-lg" : ""
                  }`}
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {friend.name?.[0] || "?"}
                    </span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-gray-900">{friend.name}</p>
                    <p className="text-gray-600 truncate">Click to start chatting</p>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-6 text-center text-gray-600">
                <div className="text-4xl mb-3">💝</div>
                <p className="font-medium">No friends to message yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedFriend ? (
            <>
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-pink-500 to-rose-600">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {selectedFriend.name?.[0] || "?"}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-white text-lg">{selectedFriend.name}</p>
                    <p className="text-pink-100">Online</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-br from-gray-50 to-pink-50">
                {conversationMessages.length > 0 ? conversationMessages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${message.senderId === selectedFriend._id ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-6 py-4 rounded-2xl shadow-lg ${
                        message.senderId === selectedFriend._id
                          ? "bg-white text-gray-900 border border-gray-200"
                          : "bg-gradient-to-r from-pink-500 to-rose-600 text-white"
                      }`}
                    >
                      <p className="font-medium">{message.content}</p>
                      {message.product && (
                        <div className="mt-3 p-3 bg-white bg-opacity-20 rounded-xl">
                          <p className="text-sm font-bold">{message.product.name}</p>
                          <p className="text-sm">${message.product.price}</p>
                        </div>
                      )}
                      <p className="text-xs opacity-75 mt-2">
                        {new Date(message._creationTime).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-gray-500 py-12">
                    <div className="text-6xl mb-4">💬</div>
                    <p className="text-lg font-medium">No messages yet. Start the conversation!</p>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-6 border-t border-gray-200 bg-white">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-6 py-4 border-2 border-pink-200 rounded-2xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 transition-all duration-300"
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    className="px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-2xl hover:from-pink-700 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-pink-50">
              <div className="text-center text-gray-600">
                <div className="text-8xl mb-6">💬</div>
                <p className="text-2xl font-bold mb-2">Select a friend to start messaging</p>
                <p className="text-lg">Choose someone from your friends list to begin a conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}