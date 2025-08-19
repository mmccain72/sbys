import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createOutfit = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    productIds: v.array(v.id("products")),
    wardrobeItemIds: v.optional(v.array(v.id("wardrobeItems"))),
    occasion: v.optional(v.string()),
    seasonalType: v.optional(v.union(v.literal("Winter"), v.literal("Spring"), v.literal("Summer"), v.literal("Autumn"))),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to create outfits");
    }

    const outfitId = await ctx.db.insert("outfits", {
      userId,
      name: args.name,
      description: args.description,
      productIds: args.productIds,
      wardrobeItemIds: args.wardrobeItemIds,
      occasion: args.occasion,
      seasonalType: args.seasonalType,
      isPublic: args.isPublic,
    });

    return outfitId;
  },
});

export const getUserOutfits = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const outfits = await ctx.db
      .query("outfits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return Promise.all(
      outfits.map(async (outfit) => {
        const products = await Promise.all(
          outfit.productIds.map(async (productId) => {
            const product = await ctx.db.get(productId);
            if (!product) return null;
            
            return {
              ...product,
              imageUrls: product.externalImageUrls && product.externalImageUrls.length > 0 
                ? product.externalImageUrls
                : await Promise.all(
                    product.images.map((imageId) => ctx.storage.getUrl(imageId))
                  ),
              isProduct: true,
            };
          })
        );

        // Fetch wardrobe items if they exist
        const wardrobeItems = outfit.wardrobeItemIds ? await Promise.all(
          outfit.wardrobeItemIds.map(async (itemId) => {
            const item = await ctx.db.get(itemId);
            if (!item || !item.isActive) return null;
            
            const processedImageUrl = item.processedImageId 
              ? await ctx.storage.getUrl(item.processedImageId)
              : item.processedImageUrl || await ctx.storage.getUrl(item.originalImageId);
            
            return {
              ...item,
              imageUrls: [processedImageUrl],
              isWardrobeItem: true,
            };
          })
        ) : [];

        return {
          ...outfit,
          products: products.filter(Boolean),
          wardrobeItems: wardrobeItems.filter(Boolean),
          allItems: [...products.filter(Boolean), ...wardrobeItems.filter(Boolean)],
        };
      })
    );
  },
});

export const getPublicOutfits = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const outfits = await ctx.db
      .query("outfits")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .order("desc")
      .take(args.limit || 20);

    return Promise.all(
      outfits.map(async (outfit) => {
        const user = await ctx.db.get(outfit.userId);
        const products = await Promise.all(
          outfit.productIds.map(async (productId) => {
            const product = await ctx.db.get(productId);
            if (!product) return null;
            
            return {
              ...product,
              imageUrls: product.externalImageUrls && product.externalImageUrls.length > 0 
                ? product.externalImageUrls
                : await Promise.all(
                    product.images.map((imageId) => ctx.storage.getUrl(imageId))
                  ),
            };
          })
        );

        return {
          ...outfit,
          user: user ? { name: user.name, email: user.email } : null,
          products: products.filter(Boolean),
        };
      })
    );
  },
});

// Schedule an outfit for a specific date
export const scheduleOutfit = mutation({
  args: {
    outfitId: v.id("outfits"),
    date: v.string(), // ISO date string (YYYY-MM-DD)
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to schedule outfits");
    }

    // Check if outfit belongs to user
    const outfit = await ctx.db.get(args.outfitId);
    if (!outfit || outfit.userId !== userId) {
      throw new Error("Outfit not found or does not belong to user");
    }

    // Check if there's already an outfit scheduled for this date
    const existing = await ctx.db
      .query("scheduledOutfits")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", userId).eq("date", args.date)
      )
      .unique();

    if (existing) {
      // Update existing scheduled outfit
      await ctx.db.patch(existing._id, {
        outfitId: args.outfitId,
        notes: args.notes,
      });
      return existing._id;
    } else {
      // Create new scheduled outfit
      const scheduledId = await ctx.db.insert("scheduledOutfits", {
        userId,
        outfitId: args.outfitId,
        date: args.date,
        notes: args.notes,
      });
      return scheduledId;
    }
  },
});

// Get scheduled outfits for a date range
export const getScheduledOutfits = query({
  args: {
    startDate: v.string(), // ISO date string (YYYY-MM-DD)
    endDate: v.string(), // ISO date string (YYYY-MM-DD)
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const scheduledOutfits = await ctx.db
      .query("scheduledOutfits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Filter by date range
    const filtered = scheduledOutfits.filter(
      (so) => so.date >= args.startDate && so.date <= args.endDate
    );

    // Fetch outfit details with products
    return Promise.all(
      filtered.map(async (scheduled) => {
        const outfit = await ctx.db.get(scheduled.outfitId);
        if (!outfit) return null;

        const products = await Promise.all(
          outfit.productIds.map(async (productId) => {
            const product = await ctx.db.get(productId);
            if (!product) return null;
            
            return {
              ...product,
              imageUrls: product.externalImageUrls && product.externalImageUrls.length > 0 
                ? product.externalImageUrls
                : await Promise.all(
                    product.images.map((imageId) => ctx.storage.getUrl(imageId))
                  ),
            };
          })
        );

        return {
          ...scheduled,
          outfit: {
            ...outfit,
            products: products.filter(Boolean),
          },
        };
      })
    ).then((results) => results.filter(Boolean));
  },
});

// Remove a scheduled outfit
export const removeScheduledOutfit = mutation({
  args: {
    date: v.string(), // ISO date string (YYYY-MM-DD)
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to remove scheduled outfits");
    }

    const scheduled = await ctx.db
      .query("scheduledOutfits")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", userId).eq("date", args.date)
      )
      .unique();

    if (scheduled) {
      await ctx.db.delete(scheduled._id);
      return true;
    }
    return false;
  },
});

// Delete an outfit and all its scheduled instances
export const deleteOutfit = mutation({
  args: {
    outfitId: v.id("outfits"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to delete outfits");
    }

    // Check if outfit belongs to user
    const outfit = await ctx.db.get(args.outfitId);
    if (!outfit || outfit.userId !== userId) {
      throw new Error("Outfit not found or does not belong to user");
    }

    // Delete all scheduled instances of this outfit
    const scheduledInstances = await ctx.db
      .query("scheduledOutfits")
      .withIndex("by_outfit", (q) => q.eq("outfitId", args.outfitId))
      .collect();

    for (const scheduled of scheduledInstances) {
      await ctx.db.delete(scheduled._id);
    }

    // Delete the outfit itself
    await ctx.db.delete(args.outfitId);
    
    return true;
  },
});
