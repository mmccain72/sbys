import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Remove Anonymous provider, keep only Password authentication
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, args) {
      // For new users, check if this is the first user in the system
      if (!args.existingUserId) {
        // Count total users to determine if this is the first user
        const allUsers = await ctx.db.query("users").collect();
        
        // Make the first user an admin automatically
        if (allUsers.length === 1) {
          await ctx.db.patch(args.userId, {
            isAdmin: true,
          });
        } else {
          // All other users are regular users by default
          await ctx.db.patch(args.userId, {
            isAdmin: false,
          });
        }
      }
    },
  },
});

// Enhanced loggedInUser query that includes isAdmin field
export const loggedInUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    
    // Ensure isAdmin field exists (for backward compatibility)
    const userWithAdmin = {
      ...user,
      isAdmin: user.isAdmin ?? false,
    };
    
    return userWithAdmin;
  },
});

// Query to check if current user is an admin
export const isCurrentUserAdmin = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return false;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return false;
    }
    return user.isAdmin === true;
  },
});

// Mutation to make a user an admin (only admins can do this)
export const setUserAdminStatus = mutation({
  args: {
    userId: v.id("users"),
    isAdmin: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Check if the current user is an admin
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }
    
    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser || !currentUser.isAdmin) {
      throw new Error("Only admins can change user admin status");
    }
    
    // Update the target user's admin status
    await ctx.db.patch(args.userId, {
      isAdmin: args.isAdmin,
    });
    
    return { success: true };
  },
});

// Query to get all users (admin only)
export const getAllUsers = query({
  handler: async (ctx) => {
    // Check if the current user is an admin
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }
    
    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser || !currentUser.isAdmin) {
      throw new Error("Only admins can view all users");
    }
    
    // Return all users with their admin status
    const users = await ctx.db.query("users").collect();
    return users.map(user => ({
      ...user,
      isAdmin: user.isAdmin ?? false,
    }));
  },
});

// Mutation to ensure the first user becomes admin (migration helper)
export const ensureFirstUserIsAdmin = mutation({
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();
    
    if (allUsers.length === 0) {
      return { message: "No users found" };
    }
    
    // Check if any user is already an admin
    const hasAdmin = allUsers.some(user => user.isAdmin === true);
    
    if (!hasAdmin && allUsers.length > 0) {
      // Make the first user an admin
      const firstUser = allUsers[0];
      await ctx.db.patch(firstUser._id, {
        isAdmin: true,
      });
      return { message: "First user is now an admin", userId: firstUser._id };
    }
    
    return { message: "Admin already exists" };
  },
});