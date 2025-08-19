import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Bulk product insertion function for large datasets
export const insertBulkProducts = mutation({
  args: {
    products: v.array(v.object({
      name: v.string(),
      description: v.string(),
      category: v.union(v.literal("tops"), v.literal("bottoms"), v.literal("dresses"), v.literal("shoes"), v.literal("accessories")),
      subcategory: v.optional(v.string()),
      retailer: v.string(),
      retailerUrl: v.string(),
      price: v.number(),
      currency: v.string(),
      colors: v.array(v.string()),
      seasonalTypes: v.array(v.union(v.literal("Winter"), v.literal("Spring"), v.literal("Summer"), v.literal("Autumn"))),
      sizes: v.array(v.string()),
      tags: v.array(v.string()),
      externalImageUrls: v.optional(v.array(v.string())),
      wpCategoryIds: v.optional(v.array(v.number())),
      wpSeasonalTypeIds: v.optional(v.array(v.number())),
      wpTagIds: v.optional(v.array(v.number())),
    })),
  },
  handler: async (ctx, args) => {
    let insertedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    
    console.log(`Starting bulk import of ${args.products.length} products...`);
    
    for (const productData of args.products) {
      try {
        await ctx.db.insert("products", {
          ...productData,
          images: [], // Empty array for now, using externalImageUrls instead
          isActive: true,
        });
        insertedCount++;
        
        // Log progress every 50 products
        if (insertedCount % 50 === 0) {
          console.log(`Imported ${insertedCount} products so far...`);
        }
      } catch (error) {
        console.error(`Failed to insert product ${productData.name}:`, error);
        errors.push(`${productData.name}: ${error}`);
        errorCount++;
      }
    }

    console.log(`Bulk import completed: ${insertedCount} successful, ${errorCount} errors`);

    return {
      success: true,
      inserted: insertedCount,
      errors: errorCount,
      total: args.products.length,
      errorDetails: errors.slice(0, 10), // Return first 10 errors for debugging
      message: `Successfully inserted ${insertedCount} out of ${args.products.length} products. ${errorCount} errors.`
    };
  },
});

// Generate diverse sample products for testing
export const insertDiverseProducts = mutation({
  args: { count: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const count = args.count || 100;
    const categories = ["tops", "bottoms", "dresses", "shoes", "accessories"] as const;
    const seasonalTypes = ["Winter", "Spring", "Summer", "Autumn"] as const;
    const retailers = ["Amazon", "Nordstrom", "Zara", "H&M", "Target", "Macy's", "Anthropologie", "J.Crew"];
    const colors = ["black", "white", "navy", "red", "blue", "green", "pink", "purple", "yellow", "orange", "brown", "gray", "beige", "cream"];
    
    const products = [];
    
    for (let i = 0; i < count; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const retailer = retailers[Math.floor(Math.random() * retailers.length)];
      const numSeasons = Math.floor(Math.random() * 3) + 1; // 1-3 seasons
      const selectedSeasons = [...seasonalTypes].sort(() => 0.5 - Math.random()).slice(0, numSeasons);
      const numColors = Math.floor(Math.random() * 3) + 1; // 1-3 colors
      const selectedColors = [...colors].sort(() => 0.5 - Math.random()).slice(0, numColors);
      
      // Generate more realistic product names
      const productNames = {
        tops: ["Silk Blouse", "Cotton T-Shirt", "Cashmere Sweater", "Linen Shirt", "Wool Cardigan", "Chiffon Top"],
        bottoms: ["High-Waist Jeans", "Tailored Trousers", "Midi Skirt", "Wide-Leg Pants", "Pencil Skirt", "Denim Shorts"],
        dresses: ["Wrap Dress", "Maxi Dress", "Shift Dress", "A-Line Dress", "Bodycon Dress", "Midi Dress"],
        shoes: ["Leather Boots", "Canvas Sneakers", "High Heels", "Ballet Flats", "Ankle Boots", "Loafers"],
        accessories: ["Silk Scarf", "Leather Handbag", "Statement Necklace", "Wool Hat", "Leather Belt", "Sunglasses"]
      };
      
      const nameOptions = productNames[category];
      const productName = nameOptions[Math.floor(Math.random() * nameOptions.length)];
      
      const product = {
        name: `${selectedColors[0].charAt(0).toUpperCase() + selectedColors[0].slice(1)} ${productName}`,
        description: `Beautiful ${category} perfect for ${selectedSeasons.join(", ")} seasons. Made with high-quality materials for comfort and style.`,
        category,
        subcategory: category === "tops" ? "blouses" : category === "bottoms" ? "pants" : undefined,
        retailer,
        retailerUrl: `https://${retailer.toLowerCase().replace(/\s+/g, '')}.com/product-${i + 1}`,
        price: Math.floor(Math.random() * 300) + 25, // $25-$325
        currency: "USD",
        images: [],
        colors: selectedColors,
        seasonalTypes: selectedSeasons,
        sizes: ["XS", "S", "M", "L", "XL"],
        tags: ["trendy", "comfortable", "stylish", "versatile"],
        isActive: true,
      };
      
      products.push(product);
    }
    
    let insertedCount = 0;
    for (const product of products) {
      try {
        await ctx.db.insert("products", product);
        insertedCount++;
      } catch (error) {
        console.error(`Failed to insert product:`, error);
      }
    }
    
    return `Successfully inserted ${insertedCount} out of ${count} diverse products`;
  },
});

// Batch insert with smaller chunks to avoid timeouts
export const insertProductsBatch = mutation({
  args: {
    products: v.array(v.object({
      name: v.string(),
      description: v.string(),
      category: v.union(v.literal("tops"), v.literal("bottoms"), v.literal("dresses"), v.literal("shoes"), v.literal("accessories")),
      subcategory: v.optional(v.string()),
      retailer: v.string(),
      retailerUrl: v.string(),
      price: v.number(),
      currency: v.string(),
      colors: v.array(v.string()),
      seasonalTypes: v.array(v.union(v.literal("Winter"), v.literal("Spring"), v.literal("Summer"), v.literal("Autumn"))),
      sizes: v.array(v.string()),
      tags: v.array(v.string()),
      externalImageUrls: v.optional(v.array(v.string())),
      wpCategoryIds: v.optional(v.array(v.number())),
      wpSeasonalTypeIds: v.optional(v.array(v.number())),
      wpTagIds: v.optional(v.array(v.number())),
    })),
    batchNumber: v.number(),
    totalBatches: v.number(),
  },
  handler: async (ctx, args) => {
    let insertedCount = 0;
    let errorCount = 0;
    
    console.log(`Processing batch ${args.batchNumber}/${args.totalBatches} with ${args.products.length} products`);
    
    for (const productData of args.products) {
      try {
        await ctx.db.insert("products", {
          ...productData,
          images: [],
          isActive: true,
        });
        insertedCount++;
      } catch (error) {
        console.error(`Failed to insert product ${productData.name}:`, error);
        errorCount++;
      }
    }

    return {
      batchNumber: args.batchNumber,
      totalBatches: args.totalBatches,
      inserted: insertedCount,
      errors: errorCount,
      total: args.products.length,
      message: `Batch ${args.batchNumber}/${args.totalBatches}: ${insertedCount} inserted, ${errorCount} errors`
    };
  },
});

// Get current product statistics
export const getProductStats = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    
    const stats = {
      total: products.length,
      active: products.filter(p => p.isActive).length,
      inactive: products.filter(p => !p.isActive).length,
      byCategory: {} as Record<string, number>,
      byRetailer: {} as Record<string, number>,
      bySeasonalType: {} as Record<string, number>,
    };
    
    // Count by category
    products.forEach(p => {
      stats.byCategory[p.category] = (stats.byCategory[p.category] || 0) + 1;
    });
    
    // Count by retailer
    products.forEach(p => {
      stats.byRetailer[p.retailer] = (stats.byRetailer[p.retailer] || 0) + 1;
    });
    
    // Count by seasonal type
    products.forEach(p => {
      p.seasonalTypes.forEach(season => {
        stats.bySeasonalType[season] = (stats.bySeasonalType[season] || 0) + 1;
      });
    });
    
    return stats;
  },
});

// Clear all products (use with caution!)
export const clearAllProducts = mutation({
  args: { confirm: v.boolean() },
  handler: async (ctx, args) => {
    if (!args.confirm) {
      throw new Error("Must confirm to clear all products");
    }
    
    const products = await ctx.db.query("products").collect();
    console.log(`Clearing ${products.length} products...`);
    
    let deletedCount = 0;
    for (const product of products) {
      try {
        await ctx.db.delete(product._id);
        deletedCount++;
      } catch (error) {
        console.error(`Failed to delete product ${product._id}:`, error);
      }
    }
    
    return `Cleared ${deletedCount} out of ${products.length} products`;
  },
});
