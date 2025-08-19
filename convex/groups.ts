import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Initialize the 4 seasonal groups (run once)
export const initializeGroups = mutation({
  handler: async (ctx) => {
    // Note: This is an initialization function that should only be run once
    // You can add authentication checks if needed
    
    // Check if groups already exist
    const existingGroups = await ctx.db.query("groups").collect();
    if (existingGroups.length > 0) {
      return { message: "Groups already initialized", groups: existingGroups };
    }
    
    // Create the 4 seasonal groups
    const groupData = [
      {
        name: "Winter Warriors",
        seasonalType: "Winter" as const,
        description: "For those with cool undertones and high contrast coloring. Share your best jewel tones, crisp whites, and dramatic black looks!",
        memberCount: 0,
        themeColor: "#1e3a8a", // Deep blue
        coverImageUrl: "/winter-group-cover.jpg",
        isActive: true,
        createdAt: Date.now(),
      },
      {
        name: "Spring Blossoms",
        seasonalType: "Spring" as const,
        description: "Warm undertones with clear, bright coloring unite! Share your coral, peach, and warm green finds that make you glow.",
        memberCount: 0,
        themeColor: "#f97316", // Coral orange
        coverImageUrl: "/spring-group-cover.jpg",
        isActive: true,
        createdAt: Date.now(),
      },
      {
        name: "Summer Serenity",
        seasonalType: "Summer" as const,
        description: "Cool undertones with soft, muted coloring. Discover and share your best pastels, soft blues, and gentle rose looks.",
        memberCount: 0,
        themeColor: "#ec4899", // Soft pink
        coverImageUrl: "/summer-group-cover.jpg",
        isActive: true,
        createdAt: Date.now(),
      },
      {
        name: "Autumn Harvest",
        seasonalType: "Autumn" as const,
        description: "Warm undertones with rich, muted coloring. Share your earth tones, warm browns, and golden discoveries!",
        memberCount: 0,
        themeColor: "#d97706", // Amber gold
        coverImageUrl: "/autumn-group-cover.jpg",
        isActive: true,
        createdAt: Date.now(),
      },
    ];
    
    const createdGroups = [];
    for (const group of groupData) {
      const id = await ctx.db.insert("groups", group);
      createdGroups.push({ id, ...group });
    }
    
    return { message: "Groups initialized successfully", groups: createdGroups };
  },
});

// Get all active groups
export const getAllGroups = query({
  handler: async (ctx) => {
    const groups = await ctx.db
      .query("groups")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
    
    // Get current user's membership status for each group
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return groups;
    }
    
    const memberships = await ctx.db
      .query("groupMemberships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    const membershipMap = new Map(
      memberships.map(m => [m.groupId, m])
    );
    
    return groups.map(group => ({
      ...group,
      isMember: membershipMap.has(group._id),
      membershipType: membershipMap.get(group._id)?.memberType,
    }));
  },
});

// Get a specific group by seasonal type
export const getGroupBySeasonalType = query({
  args: { seasonalType: v.union(
    v.literal("Winter"),
    v.literal("Spring"),
    v.literal("Summer"),
    v.literal("Autumn")
  )},
  handler: async (ctx, args) => {
    const group = await ctx.db
      .query("groups")
      .withIndex("by_seasonal_type", (q) => q.eq("seasonalType", args.seasonalType))
      .first();
    
    if (!group) {
      throw new Error(`Group for ${args.seasonalType} not found`);
    }
    
    // Get member count
    const memberCount = await ctx.db
      .query("groupMemberships")
      .withIndex("by_group", (q) => q.eq("groupId", group._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    return {
      ...group,
      actualMemberCount: memberCount.length,
    };
  },
});

// Join a group
export const joinGroup = mutation({
  args: { 
    groupId: v.id("groups"),
    memberType: v.optional(v.union(
      v.literal("member"),
      v.literal("moderator"),
      v.literal("expert")
    )),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    // Check if already a member
    const existingMembership = await ctx.db
      .query("groupMemberships")
      .withIndex("by_user_and_group", (q) => 
        q.eq("userId", userId).eq("groupId", args.groupId)
      )
      .first();
    
    if (existingMembership) {
      if (existingMembership.isActive) {
        return { message: "Already a member of this group" };
      }
      // Reactivate membership
      await ctx.db.patch(existingMembership._id, {
        isActive: true,
        joinedAt: Date.now(),
        lastActivityAt: Date.now(),
      });
    } else {
      // Create new membership
      await ctx.db.insert("groupMemberships", {
        userId,
        groupId: args.groupId,
        joinedAt: Date.now(),
        memberType: args.memberType || "member",
        isActive: true,
        lastActivityAt: Date.now(),
      });
    }
    
    // Update group member count
    const group = await ctx.db.get(args.groupId);
    if (group) {
      await ctx.db.patch(args.groupId, {
        memberCount: group.memberCount + 1,
      });
    }
    
    // Log activity
    await ctx.db.insert("groupActivities", {
      groupId: args.groupId,
      userId,
      activityType: "joined",
      createdAt: Date.now(),
    });
    
    return { message: "Successfully joined group!" };
  },
});

// Auto-join user to their seasonal group after quiz
export const autoJoinSeasonalGroup = mutation({
  args: { 
    seasonalType: v.union(
      v.literal("Winter"),
      v.literal("Spring"),
      v.literal("Summer"),
      v.literal("Autumn")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    // Find the group for this seasonal type
    const group = await ctx.db
      .query("groups")
      .withIndex("by_seasonal_type", (q) => q.eq("seasonalType", args.seasonalType))
      .first();
    
    if (!group) {
      throw new Error(`Group for ${args.seasonalType} not found. Please run initializeGroups first.`);
    }
    
    // Check if already a member
    const existingMembership = await ctx.db
      .query("groupMemberships")
      .withIndex("by_user_and_group", (q) => 
        q.eq("userId", userId).eq("groupId", group._id)
      )
      .first();
    
    if (existingMembership?.isActive) {
      return { 
        message: "Already a member of your seasonal group",
        groupId: group._id,
      };
    }
    
    // Join the group
    if (existingMembership) {
      // Reactivate
      await ctx.db.patch(existingMembership._id, {
        isActive: true,
        joinedAt: Date.now(),
        lastActivityAt: Date.now(),
      });
    } else {
      // Create new membership
      await ctx.db.insert("groupMemberships", {
        userId,
        groupId: group._id,
        joinedAt: Date.now(),
        memberType: "member",
        isActive: true,
        lastActivityAt: Date.now(),
      });
    }
    
    // Update group member count
    await ctx.db.patch(group._id, {
      memberCount: group.memberCount + 1,
    });
    
    // Log activity
    await ctx.db.insert("groupActivities", {
      groupId: group._id,
      userId,
      activityType: "joined",
      createdAt: Date.now(),
    });
    
    return { 
      message: `Welcome to ${group.name}!`,
      groupId: group._id,
    };
  },
});

// Get user's groups
export const getUserGroups = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    const memberships = await ctx.db
      .query("groupMemberships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    const groups = await Promise.all(
      memberships.map(async (membership) => {
        const group = await ctx.db.get(membership.groupId);
        return group ? {
          ...group,
          membershipType: membership.memberType,
          joinedAt: membership.joinedAt,
        } : null;
      })
    );
    
    return groups.filter(g => g !== null);
  },
});

// Get group members
export const getGroupMembers = query({
  args: { 
    groupId: v.id("groups"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("groupMemberships")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .take(args.limit || 50);
    
    const members = await Promise.all(
      memberships.map(async (membership) => {
        const user = await ctx.db.get(membership.userId);
        return user ? {
          ...user,
          membershipType: membership.memberType,
          joinedAt: membership.joinedAt,
          lastActivityAt: membership.lastActivityAt,
        } : null;
      })
    );
    
    return members.filter(m => m !== null);
  },
});

// Create a group post
export const createGroupPost = mutation({
  args: {
    groupId: v.id("groups"),
    content: v.string(),
    postType: v.union(
      v.literal("tip"),
      v.literal("product_share"),
      v.literal("outfit_share"),
      v.literal("question"),
      v.literal("challenge_entry")
    ),
    productId: v.optional(v.id("products")),
    outfitId: v.optional(v.id("outfits")),
    wardrobeItemIds: v.optional(v.array(v.id("wardrobeItems"))),
    category: v.optional(v.string()),
    imageUrls: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    // Check if user is a member of the group
    const membership = await ctx.db
      .query("groupMemberships")
      .withIndex("by_user_and_group", (q) => 
        q.eq("userId", userId).eq("groupId", args.groupId)
      )
      .first();
    
    if (!membership?.isActive) {
      throw new Error("You must be a member of the group to post");
    }
    
    // Create the post
    const postId = await ctx.db.insert("groupPosts", {
      groupId: args.groupId,
      userId,
      content: args.content,
      postType: args.postType,
      productId: args.productId,
      outfitId: args.outfitId,
      wardrobeItemIds: args.wardrobeItemIds,
      category: args.category,
      imageUrls: args.imageUrls,
      likes: [],
      isPinned: false,
      createdAt: Date.now(),
    });
    
    // Update last activity
    await ctx.db.patch(membership._id, {
      lastActivityAt: Date.now(),
    });
    
    // Log activity
    await ctx.db.insert("groupActivities", {
      groupId: args.groupId,
      userId,
      activityType: "posted",
      targetId: postId,
      targetType: "post",
      createdAt: Date.now(),
    });
    
    return { postId, message: "Post created successfully!" };
  },
});

// Like a post
export const likePost = mutation({
  args: { postId: v.id("groupPosts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");
    
    const likes = post.likes || [];
    const userIndex = likes.indexOf(userId);
    
    if (userIndex === -1) {
      // Add like
      likes.push(userId);
    } else {
      // Remove like
      likes.splice(userIndex, 1);
    }
    
    await ctx.db.patch(args.postId, { likes });
    
    return { liked: userIndex === -1 };
  },
});

// Create a comment
export const createComment = mutation({
  args: {
    postId: v.id("groupPosts"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const commentId = await ctx.db.insert("groupComments", {
      postId: args.postId,
      userId,
      content: args.content,
      likes: [],
      createdAt: Date.now(),
    });
    
    return { commentId };
  },
});

// Get comments for a post
export const getPostComments = query({
  args: { postId: v.id("groupPosts") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("groupComments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .order("asc")
      .collect();
    
    // Enrich with user data
    const enrichedComments = await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        return {
          ...comment,
          user,
        };
      })
    );
    
    return enrichedComments;
  },
});

// Get group posts (feed)
export const getGroupPosts = query({
  args: {
    groupId: v.id("groups"),
    limit: v.optional(v.number()),
    postType: v.optional(v.union(
      v.literal("tip"),
      v.literal("product_share"),
      v.literal("outfit_share"),
      v.literal("question"),
      v.literal("challenge_entry")
    )),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("groupPosts")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId));
    
    const posts = await query
      .order("desc")
      .take(args.limit || 20);
    
    // Filter by post type if specified
    const filteredPosts = args.postType 
      ? posts.filter(p => p.postType === args.postType)
      : posts;
    
    // Enrich posts with user data
    const enrichedPosts = await Promise.all(
      filteredPosts.map(async (post) => {
        const user = await ctx.db.get(post.userId);
        const product = post.productId ? await ctx.db.get(post.productId) : null;
        const outfit = post.outfitId ? await ctx.db.get(post.outfitId) : null;
        
        // Get comment count
        const comments = await ctx.db
          .query("groupComments")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .collect();
        
        return {
          ...post,
          user,
          product,
          outfit,
          commentCount: comments.length,
          isLiked: false, // Will implement user-specific like status
        };
      })
    );
    
    return enrichedPosts;
  },
});