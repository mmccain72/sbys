import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Generate upload URL for wardrobe images
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    // Generate and return an upload URL
    return await ctx.storage.generateUploadUrl();
  },
});

// Upload a wardrobe item with image
export const uploadWardrobeItem = mutation({
  args: {
    name: v.string(),
    category: v.union(v.literal("tops"), v.literal("bottoms"), v.literal("dresses"), v.literal("shoes"), v.literal("accessories")),
    subcategory: v.optional(v.string()),
    originalImageId: v.id("_storage"),
    processedImageId: v.optional(v.id("_storage")),
    processedImageUrl: v.optional(v.string()),
    colors: v.array(v.string()),
    tags: v.array(v.string()),
    brand: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    
    // Create wardrobe item
    const wardrobeItemId = await ctx.db.insert("wardrobeItems", {
      userId,
      name: args.name,
      category: args.category,
      subcategory: args.subcategory,
      originalImageId: args.originalImageId,
      processedImageId: args.processedImageId,
      processedImageUrl: args.processedImageUrl,
      colors: args.colors,
      tags: args.tags,
      brand: args.brand,
      notes: args.notes,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return wardrobeItemId;
  },
});

// Get user's wardrobe items
export const getWardrobeItems = query({
  args: {
    category: v.optional(v.union(v.literal("tops"), v.literal("bottoms"), v.literal("dresses"), v.literal("shoes"), v.literal("accessories"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    let query = ctx.db
      .query("wardrobeItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isActive"), true));

    if (args.category) {
      query = ctx.db
        .query("wardrobeItems")
        .withIndex("by_user_and_category", (q) => 
          q.eq("userId", userId).eq("category", args.category!)
        )
        .filter((q) => q.eq(q.field("isActive"), true));
    }

    const items = await query.collect();
    
    // Get URLs for all images
    const itemsWithUrls = await Promise.all(
      items.map(async (item) => {
        const originalImageUrl = await ctx.storage.getUrl(item.originalImageId);
        const processedImageUrl = item.processedImageId 
          ? await ctx.storage.getUrl(item.processedImageId)
          : item.processedImageUrl || originalImageUrl;
        
        return {
          ...item,
          originalImageUrl,
          processedImageUrl,
        };
      })
    );

    return itemsWithUrls;
  },
});

// Update wardrobe item
export const updateWardrobeItem = mutation({
  args: {
    wardrobeItemId: v.id("wardrobeItems"),
    name: v.optional(v.string()),
    category: v.optional(v.union(v.literal("tops"), v.literal("bottoms"), v.literal("dresses"), v.literal("shoes"), v.literal("accessories"))),
    subcategory: v.optional(v.string()),
    colors: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    brand: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify ownership
    const item = await ctx.db.get(args.wardrobeItemId);
    if (!item || item.userId !== userId) {
      throw new Error("Item not found or unauthorized");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.category !== undefined) updates.category = args.category;
    if (args.subcategory !== undefined) updates.subcategory = args.subcategory;
    if (args.colors !== undefined) updates.colors = args.colors;
    if (args.tags !== undefined) updates.tags = args.tags;
    if (args.brand !== undefined) updates.brand = args.brand;
    if (args.notes !== undefined) updates.notes = args.notes;

    await ctx.db.patch(args.wardrobeItemId, updates);
    return { success: true };
  },
});

// Delete wardrobe item
export const deleteWardrobeItem = mutation({
  args: {
    wardrobeItemId: v.id("wardrobeItems"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify ownership
    const item = await ctx.db.get(args.wardrobeItemId);
    if (!item || item.userId !== userId) {
      throw new Error("Item not found or unauthorized");
    }

    // Soft delete - just mark as inactive
    await ctx.db.patch(args.wardrobeItemId, {
      isActive: false,
      updatedAt: Date.now(),
    });

    // Remove from any outfits
    const outfits = await ctx.db
      .query("outfits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const outfit of outfits) {
      if (outfit.wardrobeItemIds?.includes(args.wardrobeItemId)) {
        const updatedWardrobeItemIds = outfit.wardrobeItemIds.filter(
          (id) => id !== args.wardrobeItemId
        );
        await ctx.db.patch(outfit._id, {
          wardrobeItemIds: updatedWardrobeItemIds,
        });
      }
    }

    return { success: true };
  },
});

// Update processed image after background removal
export const updateProcessedImage = mutation({
  args: {
    wardrobeItemId: v.id("wardrobeItems"),
    processedImageId: v.optional(v.id("_storage")),
    processedImageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify ownership
    const item = await ctx.db.get(args.wardrobeItemId);
    if (!item || item.userId !== userId) {
      throw new Error("Item not found or unauthorized");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.processedImageId !== undefined) {
      updates.processedImageId = args.processedImageId;
    }
    if (args.processedImageUrl !== undefined) {
      updates.processedImageUrl = args.processedImageUrl;
    }

    await ctx.db.patch(args.wardrobeItemId, updates);
    return { success: true };
  },
});

// Get a single wardrobe item
export const getWardrobeItem = query({
  args: {
    wardrobeItemId: v.id("wardrobeItems"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const item = await ctx.db.get(args.wardrobeItemId);
    if (!item || item.userId !== userId || !item.isActive) {
      return null;
    }

    const originalImageUrl = await ctx.storage.getUrl(item.originalImageId);
    const processedImageUrl = item.processedImageId 
      ? await ctx.storage.getUrl(item.processedImageId)
      : item.processedImageUrl || originalImageUrl;

    return {
      ...item,
      originalImageUrl,
      processedImageUrl,
    };
  },
});