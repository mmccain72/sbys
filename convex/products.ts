import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Helper function to safely get image URLs
const getImageUrls = async (product: any, ctx: any) => {
  try {
    if (product?.externalImageUrls && Array.isArray(product.externalImageUrls) && product.externalImageUrls.length > 0) {
      return product.externalImageUrls;
    }
    
    if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
      const urls = await Promise.all(
        product.images.map(async (imageId: any) => {
          try {
            return await ctx.storage.getUrl(imageId);
          } catch (error) {
            console.error("Error getting URL for image:", imageId, error);
            return null;
          }
        })
      );
      return urls.filter(Boolean);
    }
    
    return [];
  } catch (error) {
    console.error("Error getting image URLs:", error);
    return [];
  }
};

// WordPress item type tag mapping for filtering
const wpItemTypeTagMapping: Record<string, number[]> = {
  "sweaters": [176],
  "cardigans": [177], 
  "blouses": [178],
  "dresses": [179],
  "coats": [180],
  "tops": [182],
  "tanks": [183],
  "shorts": [184],
  "skirts": [185],
  "scarves": [186],
  "jackets": [424],
  "office-wear": [47],
  "casual": [48],
  "work-wear": [190],
  "evening-wear": [191],
};

export const getProducts = query({
  args: {
    category: v.optional(v.union(
      v.literal("tops"), v.literal("bottoms"), v.literal("dresses"), 
      v.literal("shoes"), v.literal("accessories"),
      // Add specific clothing items
      v.literal("sweaters"), v.literal("cardigans"), v.literal("blouses"),
      v.literal("tanks"), v.literal("jackets"), v.literal("coats"),
      v.literal("skirts"), v.literal("shorts"), v.literal("scarves"),
      // Add style categories
      v.literal("office-wear"), v.literal("casual"), v.literal("work-wear"), v.literal("evening-wear")
    )),
    seasonalType: v.optional(v.union(v.literal("Winter"), v.literal("Spring"), v.literal("Summer"), v.literal("Autumn"))),
    retailer: v.optional(v.string()),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
    limit: v.optional(v.number()), // Add limit parameter for backward compatibility
    strictSeasonalFiltering: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    try {
      const page = args.page || 1;
      const pageSize = args.pageSize || args.limit || 20;
      const offset = (page - 1) * pageSize;

      // Get all active products first
      let products = await ctx.db.query("products").filter((q) => q.eq(q.field("isActive"), true)).collect();

    // Apply category filter
    if (args.category) {
      const wpTagIds = wpItemTypeTagMapping[args.category];
      if (wpTagIds) {
        // Filter by WordPress tag IDs for specific clothing items
        products = products.filter(p => 
          p.wpTagIds && Array.isArray(p.wpTagIds) && p.wpTagIds.some(tagId => wpTagIds.includes(tagId))
        );
      } else {
        // Fallback to general category filtering
        products = products.filter(p => p.category === args.category);
      }
    }

    // Apply seasonal type filter
    if (args.seasonalType) {
      if (args.strictSeasonalFiltering) {
        products = products.filter(p => {
          const hasSeasonalType = Array.isArray(p.seasonalTypes) && p.seasonalTypes.includes(args.seasonalType!);
          const isMultiSeasonal = Array.isArray(p.seasonalTypes) && p.seasonalTypes.length > 2;
          return hasSeasonalType && !isMultiSeasonal;
        });
      } else {
        products = products.filter(p => Array.isArray(p.seasonalTypes) && p.seasonalTypes.includes(args.seasonalType!));
      }
    }

    // Apply retailer filter
    if (args.retailer) {
      products = products.filter(p => p.retailer === args.retailer);
    }

    // Calculate pagination
    const totalCount = products.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedProducts = products.slice(offset, offset + pageSize);

    const productsWithImages = await Promise.all(
      paginatedProducts.map(async (product) => ({
        ...product,
        imageUrls: await getImageUrls(product, ctx),
      }))
    );

    return {
      products: productsWithImages,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        pageSize,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      }
    };
    } catch (error) {
      console.error("Error in getProducts:", error);
      return {
        products: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          pageSize: 20,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      };
    }
  },
});

export const searchProducts = query({
  args: {
    searchTerm: v.string(),
    category: v.optional(v.union(
      v.literal("tops"), v.literal("bottoms"), v.literal("dresses"), 
      v.literal("shoes"), v.literal("accessories"),
      // Add specific clothing items
      v.literal("sweaters"), v.literal("cardigans"), v.literal("blouses"),
      v.literal("tanks"), v.literal("jackets"), v.literal("coats"),
      v.literal("skirts"), v.literal("shorts"), v.literal("scarves"),
      // Add style categories
      v.literal("office-wear"), v.literal("casual"), v.literal("work-wear"), v.literal("evening-wear")
    )),
    seasonalType: v.optional(v.union(v.literal("Winter"), v.literal("Spring"), v.literal("Summer"), v.literal("Autumn"))),
    strictSeasonalFiltering: v.optional(v.boolean()),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
    limit: v.optional(v.number()), // Add limit parameter for backward compatibility
  },
  handler: async (ctx, args) => {
    const page = args.page || 1;
    const pageSize = args.pageSize || args.limit || 20;
    const offset = (page - 1) * pageSize;

    let searchQuery = ctx.db
      .query("products")
      .withSearchIndex("search_products", (q) => q.search("name", args.searchTerm));

    let products = await searchQuery.take(1000); // Get more results for filtering

    // Handle specific clothing item filtering for search results
    if (args.category) {
      const wpTagIds = wpItemTypeTagMapping[args.category];
      if (wpTagIds) {
        // Filter by WordPress tag IDs for specific clothing items
        products = products.filter(p => 
          p.wpTagIds && Array.isArray(p.wpTagIds) && p.wpTagIds.some(tagId => wpTagIds.includes(tagId))
        );
      } else {
        // Fallback to general category filtering
        products = products.filter(p => p.category === args.category);
      }
    }

    // Filter by seasonal type if specified
    if (args.seasonalType) {
      if (args.strictSeasonalFiltering) {
        // STRICT FILTERING for search results too
        products = products.filter(p => {
          const hasSeasonalType = Array.isArray(p.seasonalTypes) && p.seasonalTypes.includes(args.seasonalType!);
          const isMultiSeasonal = Array.isArray(p.seasonalTypes) && p.seasonalTypes.length > 2;
          return hasSeasonalType && !isMultiSeasonal;
        });
      } else {
        products = products.filter(p => Array.isArray(p.seasonalTypes) && p.seasonalTypes.includes(args.seasonalType!));
      }
    }

    // Calculate pagination
    const totalCount = products.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedProducts = products.slice(offset, offset + pageSize);

    const productsWithImages = await Promise.all(
      paginatedProducts.map(async (product) => ({
        ...product,
        imageUrls: await getImageUrls(product, ctx),
      }))
    );

    return {
      products: productsWithImages,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        pageSize,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      }
    };
  },
});

export const getProduct = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) return null;

    return {
      ...product,
      imageUrls: await getImageUrls(product, ctx),
    };
  },
});

export const toggleFavorite = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to favorite products");
    }

    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_and_product", (q) => 
        q.eq("userId", userId).eq("productId", args.productId)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return false;
    } else {
      await ctx.db.insert("favorites", {
        userId,
        productId: args.productId,
      });
      return true;
    }
  },
});

export const getUserFavorites = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const products = await Promise.all(
      favorites.map(async (fav) => {
        const product = await ctx.db.get(fav.productId);
        if (!product) return null;
        
        return {
          ...product,
          imageUrls: await getImageUrls(product, ctx),
        };
      })
    );

    return products.filter(Boolean);
  },
});

export const isProductFavorited = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_user_and_product", (q) => 
        q.eq("userId", userId).eq("productId", args.productId)
      )
      .unique();

    return !!favorite;
  },
});

// Clear all products from database
export const clearAllProducts = mutation({
  args: {},
  handler: async (ctx) => {
    try {
      const products = await ctx.db.query("products").collect();
      console.log(`Found ${products.length} products to delete`);
      
      let deletedCount = 0;
      for (const product of products) {
        try {
          await ctx.db.delete(product._id);
          deletedCount++;
        } catch (error) {
          console.error(`Failed to delete product ${product._id}:`, error);
        }
      }

      console.log(`Successfully deleted ${deletedCount} out of ${products.length} products`);
      return `Cleared ${deletedCount} products from database (${products.length} found)`;
    } catch (error) {
      console.error("Error clearing products:", error);
      throw new Error(`Failed to clear products: ${error}`);
    }
  },
});

// Count total products in database
export const countProducts = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    return {
      total: products.length,
      active: products.filter(p => p.isActive).length,
      inactive: products.filter(p => !p.isActive).length,
      withAmazonUrls: products.filter(p => p.amazonUrl).length,
    };
  },
});

export const getProductsWithAmazonUrls = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const products = await ctx.db.query("products")
      .filter((q) => q.neq(q.field("amazonUrl"), undefined))
      .take(limit);
    
    return products.map(p => ({
      id: p._id,
      name: p.name,
      retailerUrl: p.retailerUrl,
      amazonUrl: p.amazonUrl,
    }));
  },
});

// Get product count by seasonal type with strict filtering
export const countProductsBySeasonalType = query({
  args: {
    seasonalType: v.optional(v.union(v.literal("Winter"), v.literal("Spring"), v.literal("Summer"), v.literal("Autumn"))),
    strictFiltering: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const products = await ctx.db.query("products").filter((q) => q.eq(q.field("isActive"), true)).collect();
    
    if (!args.seasonalType) {
      return { total: products.length };
    }

    let filteredProducts;
    if (args.strictFiltering) {
      filteredProducts = products.filter(p => {
        const hasSeasonalType = Array.isArray(p.seasonalTypes) && p.seasonalTypes.includes(args.seasonalType!);
        const isMultiSeasonal = Array.isArray(p.seasonalTypes) && p.seasonalTypes.length > 2;
        return hasSeasonalType && !isMultiSeasonal;
      });
    } else {
      filteredProducts = products.filter(p => Array.isArray(p.seasonalTypes) && p.seasonalTypes.includes(args.seasonalType!));
    }

    return {
      total: filteredProducts.length,
      seasonalType: args.seasonalType,
      strictFiltering: args.strictFiltering || false,
    };
  },
});

// Sample data insertion function (for demo purposes)
export const insertSampleProducts = mutation({
  args: {},
  handler: async (ctx) => {
    const sampleProducts = [
      {
        name: "Classic White Button-Down Shirt",
        description: "Timeless white cotton button-down shirt perfect for any season",
        category: "tops" as const,
        subcategory: "blouses",
        retailer: "Amazon",
        retailerUrl: "https://amazon.com/example-shirt",
        price: 45.99,
        currency: "USD",
        images: [],
        colors: ["white", "ivory"],
        seasonalTypes: ["Winter", "Spring", "Summer", "Autumn"] as ("Winter" | "Spring" | "Summer" | "Autumn")[],
        sizes: ["XS", "S", "M", "L", "XL"],
        tags: ["classic", "professional", "versatile"],
        isActive: true,
      },
      {
        name: "Emerald Green Silk Blouse",
        description: "Luxurious silk blouse in rich emerald green",
        category: "tops" as const,
        subcategory: "blouses",
        retailer: "Amazon",
        retailerUrl: "https://amazon.com/example-blouse",
        price: 89.99,
        currency: "USD",
        images: [],
        colors: ["emerald", "green"],
        seasonalTypes: ["Winter", "Autumn"] as ("Winter" | "Spring" | "Summer" | "Autumn")[],
        sizes: ["XS", "S", "M", "L", "XL"],
        tags: ["elegant", "silk", "formal"],
        isActive: true,
      },
      {
        name: "High-Waisted Black Trousers",
        description: "Professional black trousers with a flattering high-waisted cut",
        category: "bottoms" as const,
        subcategory: "pants",
        retailer: "Amazon",
        retailerUrl: "https://amazon.com/example-trousers",
        price: 65.99,
        currency: "USD",
        images: [],
        colors: ["black"],
        seasonalTypes: ["Winter", "Summer"] as ("Winter" | "Spring" | "Summer" | "Autumn")[],
        sizes: ["XS", "S", "M", "L", "XL"],
        tags: ["professional", "high-waisted", "versatile"],
        isActive: true,
      },
    ];

    for (const product of sampleProducts) {
      await ctx.db.insert("products", product);
    }

    return `Inserted ${sampleProducts.length} sample products`;
  },
});

// WordPress integration query
export const getProductsByWpSeasonalType = query({
  args: { wpSeasonalTypeIds: v.array(v.number()) },
  handler: async (ctx, args) => {
    const products = await ctx.db.query("products")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return products.filter(product => 
      product.wpSeasonalTypeIds?.some(id => args.wpSeasonalTypeIds.includes(id))
    ).slice(0, 50);
  },
});
