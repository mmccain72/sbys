import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Friend management functions
export const sendFriendRequest = mutation({
  args: { addresseeId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be logged in");

    if (userId === args.addresseeId) {
      throw new Error("Cannot send friend request to yourself");
    }

    // Check if friendship already exists
    const existing = await ctx.db
      .query("friendships")
      .withIndex("by_users", (q) => 
        q.eq("requesterId", userId).eq("addresseeId", args.addresseeId)
      )
      .first();

    if (existing) {
      throw new Error("Friend request already exists");
    }

    // Check reverse friendship
    const reverse = await ctx.db
      .query("friendships")
      .withIndex("by_users", (q) => 
        q.eq("requesterId", args.addresseeId).eq("addresseeId", userId)
      )
      .first();

    if (reverse) {
      throw new Error("Friend request already exists");
    }

    await ctx.db.insert("friendships", {
      requesterId: userId,
      addresseeId: args.addresseeId,
      status: "pending",
    });

    return "Friend request sent!";
  },
});

export const respondToFriendRequest = mutation({
  args: { 
    friendshipId: v.id("friendships"),
    response: v.union(v.literal("accepted"), v.literal("declined"))
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be logged in");

    const friendship = await ctx.db.get(args.friendshipId);
    if (!friendship) throw new Error("Friend request not found");

    if (friendship.addresseeId !== userId) {
      throw new Error("Not authorized to respond to this request");
    }

    await ctx.db.patch(args.friendshipId, {
      status: args.response,
    });

    return `Friend request ${args.response}!`;
  },
});

export const getFriends = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const friendships = await ctx.db
      .query("friendships")
      .filter((q) => 
        q.or(
          q.and(q.eq(q.field("requesterId"), userId), q.eq(q.field("status"), "accepted")),
          q.and(q.eq(q.field("addresseeId"), userId), q.eq(q.field("status"), "accepted"))
        )
      )
      .collect();

    const friends = await Promise.all(
      friendships.map(async (friendship) => {
        const friendId = friendship.requesterId === userId 
          ? friendship.addresseeId 
          : friendship.requesterId;
        
        const friend = await ctx.db.get(friendId);
        return friend ? { ...friend, friendshipId: friendship._id } : null;
      })
    );

    return friends.filter(Boolean);
  },
});

export const getPendingFriendRequests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const requests = await ctx.db
      .query("friendships")
      .withIndex("by_addressee", (q) => q.eq("addresseeId", userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    const requestsWithUsers = await Promise.all(
      requests.map(async (request) => {
        const requester = await ctx.db.get(request.requesterId);
        return requester ? { ...request, requester } : null;
      })
    );

    return requestsWithUsers.filter(Boolean);
  },
});

export const searchUsers = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    if (args.searchTerm.length < 2) return [];

    const users = await ctx.db.query("users").collect();
    
    return users
      .filter(user => 
        user._id !== userId && 
        user.name && 
        user.name.toLowerCase().includes(args.searchTerm.toLowerCase())
      )
      .slice(0, 10);
  },
});

// Create sample friends for testing
export const createSampleFriends = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be logged in");

    const sampleFriends = [
      {
        name: "Emma Style",
        email: "emma@example.com",
        isAnonymous: false,
      },
      {
        name: "Sophia Fashion",
        email: "sophia@example.com", 
        isAnonymous: false,
      },
      {
        name: "Olivia Trends",
        email: "olivia@example.com",
        isAnonymous: false,
      },
      {
        name: "Ava Colors",
        email: "ava@example.com",
        isAnonymous: false,
      }
    ];

    const createdFriends = [];

    for (const friendData of sampleFriends) {
      // Check if user already exists
      const existingUser = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", friendData.email))
        .first();

      let friendId;
      if (existingUser) {
        friendId = existingUser._id;
      } else {
        // Create new user
        friendId = await ctx.db.insert("users", friendData);
      }

      // Check if friendship already exists
      const existingFriendship = await ctx.db
        .query("friendships")
        .filter((q) => 
          q.or(
            q.and(q.eq(q.field("requesterId"), userId), q.eq(q.field("addresseeId"), friendId)),
            q.and(q.eq(q.field("requesterId"), friendId), q.eq(q.field("addresseeId"), userId))
          )
        )
        .first();

      if (!existingFriendship) {
        // Create accepted friendship
        await ctx.db.insert("friendships", {
          requesterId: userId,
          addresseeId: friendId,
          status: "accepted",
        });
      }

      createdFriends.push(friendData.name);
    }

    return `Created ${createdFriends.length} sample friends: ${createdFriends.join(", ")}`;
  },
});

// Create sample posts for testing the feed
export const createSamplePosts = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be logged in");

    // Get sample friends
    const friends = await ctx.db
      .query("friendships")
      .filter((q) => 
        q.or(
          q.and(q.eq(q.field("requesterId"), userId), q.eq(q.field("status"), "accepted")),
          q.and(q.eq(q.field("addresseeId"), userId), q.eq(q.field("status"), "accepted"))
        )
      )
      .collect();

    const samplePosts = [
      {
        content: "Just discovered my seasonal colors and I'm obsessed! 💕 Winter colors look amazing on me!",
        postType: "text" as const,
      },
      {
        content: "Found the perfect dress for my color palette! Can't wait to wear it to the party this weekend ✨",
        postType: "text" as const,
      },
      {
        content: "Anyone else struggling to find the right shade of red lipstick for their seasonal type? 💄",
        postType: "text" as const,
      },
      {
        content: "Loving how this app helps me shop smarter! No more buying clothes that don't suit me 🛍️",
        postType: "text" as const,
      }
    ];

    let postsCreated = 0;

    // Create posts from friends
    for (const friendship of friends.slice(0, 2)) {
      const friendId = friendship.requesterId === userId 
        ? friendship.addresseeId 
        : friendship.requesterId;

      for (const postData of samplePosts.slice(0, 2)) {
        await ctx.db.insert("socialPosts", {
          userId: friendId,
          content: postData.content,
          postType: postData.postType,
          likes: Math.random() > 0.5 ? [userId] : [], // Sometimes like the post
          isPublic: true,
        });
        postsCreated++;
      }
    }

    // Create one post from the current user
    await ctx.db.insert("socialPosts", {
      userId,
      content: "Just set up my profile and loving this community! Looking forward to sharing style tips with everyone 🌟",
      postType: "text" as const,
      likes: [],
      isPublic: true,
    });
    postsCreated++;

    return `Created ${postsCreated} sample posts for testing the feed!`;
  },
});

// Send sample messages for testing
export const createSampleMessages = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be logged in");

    // Get first friend
    const friendship = await ctx.db
      .query("friendships")
      .filter((q) => 
        q.or(
          q.and(q.eq(q.field("requesterId"), userId), q.eq(q.field("status"), "accepted")),
          q.and(q.eq(q.field("addresseeId"), userId), q.eq(q.field("status"), "accepted"))
        )
      )
      .first();

    if (!friendship) {
      throw new Error("No friends found. Create sample friends first!");
    }

    const friendId = friendship.requesterId === userId 
      ? friendship.addresseeId 
      : friendship.requesterId;

    const sampleMessages = [
      {
        senderId: friendId,
        content: "Hey! I saw you joined the app. Welcome! 👋",
        messageType: "text" as const,
      },
      {
        senderId: userId,
        content: "Thanks! I'm excited to discover my colors and find better outfits 😊",
        messageType: "text" as const,
      },
      {
        senderId: friendId,
        content: "Have you taken the color quiz yet? It's amazing how accurate it is!",
        messageType: "text" as const,
      },
      {
        senderId: userId,
        content: "Yes! I'm a Winter type. The colors really do look great on me!",
        messageType: "text" as const,
      },
      {
        senderId: friendId,
        content: "That's awesome! I'm a Spring type. We should go shopping together sometime! 🛍️",
        messageType: "text" as const,
      }
    ];

    for (const messageData of sampleMessages) {
      await ctx.db.insert("messages", {
        senderId: messageData.senderId,
        receiverId: messageData.senderId === userId ? friendId : userId,
        content: messageData.content,
        messageType: messageData.messageType,
        isRead: false,
      });
    }

    return `Created ${sampleMessages.length} sample messages with your first friend!`;
  },
});

// Messaging functions
export const sendMessage = mutation({
  args: {
    receiverId: v.id("users"),
    content: v.string(),
    messageType: v.optional(v.union(v.literal("text"), v.literal("product_share"), v.literal("outfit_share"))),
    productId: v.optional(v.id("products")),
    outfitId: v.optional(v.id("outfits")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be logged in");

    await ctx.db.insert("messages", {
      senderId: userId,
      receiverId: args.receiverId,
      content: args.content,
      messageType: args.messageType || "text",
      productId: args.productId,
      outfitId: args.outfitId,
      isRead: false,
    });

    return "Message sent!";
  },
});

export const getConversation = query({
  args: { friendId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const messages = await ctx.db
      .query("messages")
      .filter((q) => 
        q.or(
          q.and(q.eq(q.field("senderId"), userId), q.eq(q.field("receiverId"), args.friendId)),
          q.and(q.eq(q.field("senderId"), args.friendId), q.eq(q.field("receiverId"), userId))
        )
      )
      .order("desc")
      .take(50);

    const messagesWithDetails = await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        let product = null;
        let outfit = null;

        if (message.productId) {
          product = await ctx.db.get(message.productId);
        }
        if (message.outfitId) {
          outfit = await ctx.db.get(message.outfitId);
        }

        return {
          ...message,
          sender,
          product,
          outfit,
        };
      })
    );

    return messagesWithDetails.reverse();
  },
});

export const markMessagesAsRead = mutation({
  args: { friendId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be logged in");

    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("by_receiver", (q) => q.eq("receiverId", userId))
      .filter((q) => 
        q.and(
          q.eq(q.field("senderId"), args.friendId),
          q.eq(q.field("isRead"), false)
        )
      )
      .collect();

    await Promise.all(
      unreadMessages.map(message => 
        ctx.db.patch(message._id, { isRead: true })
      )
    );

    return "Messages marked as read";
  },
});

export const getUnreadMessageCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("by_receiver", (q) => q.eq("receiverId", userId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    return unreadMessages.length;
  },
});

// Product sharing functions
export const shareProduct = mutation({
  args: {
    productId: v.id("products"),
    friendIds: v.array(v.id("users")),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be logged in");

    // Send messages to each friend
    await Promise.all(
      args.friendIds.map(friendId =>
        ctx.db.insert("messages", {
          senderId: userId,
          receiverId: friendId,
          content: args.message || "Check out this product!",
          messageType: "product_share",
          productId: args.productId,
          isRead: false,
        })
      )
    );

    return `Product shared with ${args.friendIds.length} friends!`;
  },
});

// Social posts functions
export const createPost = mutation({
  args: {
    content: v.string(),
    postType: v.union(v.literal("text"), v.literal("product"), v.literal("outfit"), v.literal("quiz_result"), v.literal("image")),
    productId: v.optional(v.id("products")),
    outfitId: v.optional(v.id("outfits")),
    imageUrls: v.optional(v.array(v.string())),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be logged in");

    await ctx.db.insert("socialPosts", {
      userId,
      content: args.content,
      postType: args.postType,
      productId: args.productId,
      outfitId: args.outfitId,
      imageUrls: args.imageUrls,
      likes: [],
      isPublic: args.isPublic ?? true,
    });

    return "Post created!";
  },
});

export const getFeed = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Get user's friends
    const friends = await ctx.db
      .query("friendships")
      .filter((q) => 
        q.or(
          q.and(q.eq(q.field("requesterId"), userId), q.eq(q.field("status"), "accepted")),
          q.and(q.eq(q.field("addresseeId"), userId), q.eq(q.field("status"), "accepted"))
        )
      )
      .collect();

    const friendIds = friends.map(f => 
      f.requesterId === userId ? f.addresseeId : f.requesterId
    );

    // Include user's own posts
    friendIds.push(userId);

    const posts = await ctx.db
      .query("socialPosts")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .order("desc")
      .take(args.limit || 20);

    const postsWithDetails = await Promise.all(
      posts.map(async (post) => {
        const author = await ctx.db.get(post.userId);
        let product = null;
        let outfit = null;

        if (post.productId) {
          product = await ctx.db.get(post.productId);
        }
        if (post.outfitId) {
          outfit = await ctx.db.get(post.outfitId);
        }

        const comments = await ctx.db
          .query("postComments")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .collect();

        const commentsWithUsers = await Promise.all(
          comments.map(async (comment) => {
            const commentAuthor = await ctx.db.get(comment.userId);
            return { ...comment, author: commentAuthor };
          })
        );

        return {
          ...post,
          author,
          product,
          outfit,
          comments: commentsWithUsers,
          isLiked: post.likes.includes(userId),
        };
      })
    );

    return postsWithDetails;
  },
});

export const toggleLike = mutation({
  args: { postId: v.id("socialPosts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be logged in");

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    const likes = post.likes;
    const isLiked = likes.includes(userId);

    if (isLiked) {
      await ctx.db.patch(args.postId, {
        likes: likes.filter(id => id !== userId),
      });
    } else {
      await ctx.db.patch(args.postId, {
        likes: [...likes, userId],
      });
    }

    return !isLiked;
  },
});

export const addComment = mutation({
  args: {
    postId: v.id("socialPosts"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be logged in");

    await ctx.db.insert("postComments", {
      postId: args.postId,
      userId,
      content: args.content,
    });

    return "Comment added!";
  },
});
