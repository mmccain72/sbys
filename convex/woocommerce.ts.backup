import { action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

// WooCommerce product type
interface WooCommerceProduct {
  id: number;
  name: string;
  description: string;
  short_description: string;
  price: string;
  regular_price: string;
  permalink: string;
  status: string;
  categories: Array<{ id: number; name: string; slug: string }>;
  attributes: Array<{ name: string; options: string[] }>;
  images: Array<{ src: string; alt?: string }>;
  tags: Array<{ id: number; name: string; slug: string }>;
  meta_data?: Array<{ key: string; value: any }>;
  external_url?: string;
}

// Enhanced category mapping with WordPress tag integration
const categoryMapping: Record<string, "tops" | "bottoms" | "dresses" | "shoes" | "accessories"> = {
  "tops": "tops",
  "shirts": "tops",
  "blouses": "tops",
  "sweaters": "tops",
  "jackets": "tops",
  "cardigans": "tops",
  "tank": "tops",
  "tanks": "tops",
  "bottoms": "bottoms",
  "pants": "bottoms",
  "jeans": "bottoms",
  "skirts": "bottoms",
  "shorts": "bottoms",
  "short": "bottoms",
  "dresses": "dresses",
  "dress": "dresses",
  "shoes": "shoes",
  "accessories": "accessories",
  "jewelry": "accessories",
  "bags": "accessories",
  "scarves": "accessories",
  "scarfs": "accessories",
  "scarf": "accessories",
  "coats": "accessories", // Outerwear as accessories for now
  "coat": "accessories",
};

// WordPress seasonal type category ID mapping
const wpSeasonalTypeMapping: Record<number, "Winter" | "Spring" | "Summer" | "Autumn"> = {
  368: "Autumn",
  369: "Winter", 
  371: "Summer",
  413: "Spring",
};

// WordPress item type tag ID mapping - CLOTHING ITEMS
const wpItemTypeTagMapping: Record<number, {
  itemType: string;
  category: "tops" | "bottoms" | "dresses" | "shoes" | "accessories";
  subcategory?: string;
}> = {
  // Tops
  176: { itemType: "sweater", category: "tops", subcategory: "sweaters" },
  177: { itemType: "cardigan", category: "tops", subcategory: "cardigans" },
  178: { itemType: "blouse", category: "tops", subcategory: "blouses" },
  182: { itemType: "top", category: "tops", subcategory: "tops" },
  183: { itemType: "tank", category: "tops", subcategory: "tanks" },
  424: { itemType: "jacket", category: "tops", subcategory: "jackets" },
  
  // Bottoms
  184: { itemType: "short", category: "bottoms", subcategory: "shorts" },
  185: { itemType: "skirt", category: "bottoms", subcategory: "skirts" },
  
  // Dresses
  179: { itemType: "dress", category: "dresses", subcategory: "dresses" },
  
  // Accessories
  180: { itemType: "coat", category: "accessories", subcategory: "outerwear" },
  186: { itemType: "scarf", category: "accessories", subcategory: "scarves" },
  
  // Style Tags (mapped to accessories for now, but used for styling)
  47: { itemType: "office wear", category: "accessories", subcategory: "style" },
  48: { itemType: "casual", category: "accessories", subcategory: "style" },
  190: { itemType: "work wear", category: "accessories", subcategory: "style" },
  191: { itemType: "evening wear", category: "accessories", subcategory: "style" },
};

// WordPress category ID to our app category mapping (enhanced)
const wpCategoryMapping: Record<number, {
  category: "tops" | "bottoms" | "dresses" | "shoes" | "accessories";
  subcategory?: string;
}> = {
  // Add specific WordPress category IDs as you discover them
  // This will be populated based on the actual category structure from ShopYourShade
};

// WordPress color ID to seasonal type mapping - COMPLETE COLOR SYSTEM (158 colors total)
const wpColorToSeasonalTypes: Record<number, Array<"Winter" | "Spring" | "Summer" | "Autumn">> = {
  // WINTER COLORS (39 colors)
  449: ["Winter"], 435: ["Winter"], 383: ["Winter"], 447: ["Winter"], 443: ["Winter"],
  387: ["Winter"], 446: ["Winter"], 452: ["Winter"], 386: ["Winter"], 385: ["Winter"],
  388: ["Winter"], 458: ["Winter"], 455: ["Winter"], 454: ["Winter"], 459: ["Winter"],
  457: ["Winter"], 460: ["Winter"], 456: ["Winter"], 436: ["Winter"], 450: ["Winter"],
  451: ["Winter"], 434: ["Winter"], 439: ["Winter"], 442: ["Winter"], 390: ["Winter"],
  440: ["Winter"], 384: ["Winter"], 453: ["Winter"], 391: ["Winter"], 445: ["Winter"],
  438: ["Winter"], 437: ["Winter"], 448: ["Winter"], 444: ["Winter"], 433: ["Winter"],
  392: ["Winter"], 441: ["Winter"], 432: ["Winter"], 389: ["Winter"],
  
  // SUMMER COLORS (40 colors)
  471: ["Summer"], 483: ["Summer"], 405: ["Summer"], 487: ["Summer"], 488: ["Summer"],
  485: ["Summer"], 489: ["Summer"], 476: ["Summer"], 484: ["Summer"], 469: ["Summer"],
  472: ["Summer"], 466: ["Summer"], 468: ["Summer"], 403: ["Summer"], 477: ["Summer"],
  478: ["Summer"], 470: ["Summer"], 480: ["Summer"], 408: ["Summer"], 463: ["Summer"],
  465: ["Summer"], 409: ["Summer"], 479: ["Summer"], 492: ["Summer"], 461: ["Summer"],
  482: ["Summer"], 474: ["Summer"], 462: ["Summer"], 473: ["Summer"], 486: ["Summer"],
  491: ["Summer"], 464: ["Summer"], 490: ["Summer"], 475: ["Summer"], 481: ["Summer"],
  467: ["Summer"], 406: ["Summer"], 411: ["Summer"], 404: ["Summer"], 412: ["Summer"],

  // SPRING COLORS (40 colors)
  547: ["Spring"], // Apple Green
  553: ["Spring"], // Aqua
  555: ["Spring"], // Aquamarine
  534: ["Spring"], // Banana
  525: ["Spring"], // Spring Beige
  414: ["Spring"], // Blush Pink
  551: ["Spring"], // Bright Blue
  528: ["Spring"], // Bright Navy
  548: ["Spring"], // Canary Yellow
  524: ["Spring"], // Chocolate
  531: ["Spring"], // Cinnamon
  418: ["Spring"], // Coral
  549: ["Spring"], // Corn Yellow
  535: ["Spring"], // Cream
  526: ["Spring"], // Dove Grey
  543: ["Spring"], // Flamingo Pink
  540: ["Spring"], // Spring Geranium
  542: ["Spring"], // Geranium Pink
  532: ["Spring"], // Honey
  552: ["Spring"], // Spring Hyacinth
  546: ["Spring"], // Kerry Green
  545: ["Spring"], // Leaf Green
  527: ["Spring"], // Light Dove Grey
  536: ["Spring"], // Light Peach
  415: ["Spring"], // Mint Green
  533: ["Spring"], // Oatmeal
  529: ["Spring"], // Oxford Blue
  421: ["Spring"], // Peach
  541: ["Spring"], // Poppy
  419: ["Spring"], // Sage Green
  423: ["Spring"], // Seafoam
  538: ["Spring"], // Shell Pink
  544: ["Spring"], // Spring Shocking Pink
  417: ["Spring"], // Soft Yellow
  530: ["Spring"], // Spring Tan
  537: ["Spring"], // Tangerine
  539: ["Spring"], // Terracotta
  554: ["Spring"], // Spring Turquoise
  550: ["Spring"], // Violet

  // AUTUMN COLORS (39 colors)
  377: ["Autumn"], // Amber
  504: ["Autumn"], // Apple Jade
  500: ["Autumn"], // Apricot
  508: ["Autumn"], // Autumn Beige
  497: ["Autumn"], // Brick
  379: ["Autumn"], // Bronze
  372: ["Autumn"], // Burnt Orange
  507: ["Autumn"], // Camel
  495: ["Autumn"], // Chestnut
  376: ["Autumn"], // Chocolate Brown
  506: ["Autumn"], // Coffee
  380: ["Autumn"], // Copper
  499: ["Autumn"], // Autumn Coral
  494: ["Autumn"], // Dark Brown
  511: ["Autumn"], // Dark Olive
  375: ["Autumn"], // Deep Red
  498: ["Autumn"], // Autumn Geranium
  513: ["Autumn"], // Grass Green
  374: ["Autumn"], // Harvest Gold
  521: ["Autumn"], // Heliotrope
  509: ["Autumn"], // Khaki
  522: ["Autumn"], // Kingfisher
  503: ["Autumn"], // Light Sage
  514: ["Autumn"], // Autumn Lime Green
  510: ["Autumn"], // Lizard Grey
  382: ["Autumn"], // Mahogany
  519: ["Autumn"], // Marine Navy
  501: ["Autumn"], // Mid Peach
  512: ["Autumn"], // Moss Green
  517: ["Autumn"], // Mustard
  515: ["Autumn"], // Old Gold
  502: ["Autumn"], // Oyster
  523: ["Autumn"], // Peacock
  505: ["Autumn"], // Rosewood
  520: ["Autumn"], // Autumn Royal Purple
  373: ["Autumn"], // Rust
  516: ["Autumn"], // Saffron
  496: ["Autumn"], // Autumn Tan
  518: ["Autumn"], // Yellow Ochre
};

// Enhanced color name to seasonal type mapping - COMPLETE SYSTEM
const colorToSeasonalTypes: Record<string, Array<"Winter" | "Spring" | "Summer" | "Autumn">> = {
  // WINTER colors
  "black": ["Winter"], "white": ["Winter"], "burgundy": ["Winter"], "emerald": ["Winter"],
  "navy": ["Winter"], "royal blue": ["Winter"], "magenta": ["Winter"], "silver": ["Winter"],
  "charcoal": ["Winter"], "midnight blue": ["Winter"], "emerald green": ["Winter"],
  "royal purple": ["Winter"], "wine red": ["Winter"], "scarlet": ["Winter"], "indigo": ["Winter"],
  "pure white": ["Winter"], "jet black": ["Winter"], "sapphire": ["Winter"], "ruby": ["Winter"],
  
  // SPRING colors
  "apple green": ["Spring"], "aqua": ["Spring"], "aquamarine": ["Spring"], "banana": ["Spring"],
  "blush pink": ["Spring"], "bright blue": ["Spring"], "bright navy": ["Spring"], 
  "canary yellow": ["Spring"], "chocolate": ["Spring"], "cinnamon": ["Spring"],
  "coral": ["Spring"], "corn yellow": ["Spring"], "cream": ["Spring"], "dove grey": ["Spring"],
  "flamingo pink": ["Spring"], "geranium": ["Spring"], "honey": ["Spring"], "hyacinth": ["Spring"],
  "kerry green": ["Spring"], "leaf green": ["Spring"], "light peach": ["Spring"],
  "mint green": ["Spring"], "mint": ["Spring"], "oatmeal": ["Spring"], "oxford blue": ["Spring"],
  "peach": ["Spring"], "poppy": ["Spring"], "sage green": ["Spring"], "seafoam": ["Spring"],
  "shell pink": ["Spring"], "soft yellow": ["Spring"], "yellow": ["Spring"], "tangerine": ["Spring"],
  "terracotta": ["Spring"], "turquoise": ["Spring"], "violet": ["Spring"], "warm pink": ["Spring"],
  "golden yellow": ["Spring"], "bright green": ["Spring"], "clear colors": ["Spring"],
  
  // SUMMER colors
  "powder blue": ["Summer"], "dusty pink": ["Summer"], "rose": ["Summer"], "lilac": ["Summer"],
  "teal": ["Summer"], "soft white": ["Summer"], "sky blue": ["Summer"],
  "hot pink": ["Summer"], "jade": ["Summer"], "plum": ["Summer"], "amethyst": ["Summer"],
  "sage": ["Summer"], "lavender": ["Summer"], "periwinkle": ["Summer"], "mauve": ["Summer"],
  "soft gray": ["Summer"], "pearl": ["Summer"], "muted colors": ["Summer"],
  
  // AUTUMN colors
  "amber": ["Autumn"], "apple jade": ["Autumn"], "apricot": ["Autumn"], "brick": ["Autumn"],
  "bronze": ["Autumn"], "burnt orange": ["Autumn"], "camel": ["Autumn"], "chestnut": ["Autumn"],
  "chocolate brown": ["Autumn"], "coffee": ["Autumn"], "copper": ["Autumn"], "dark brown": ["Autumn"],
  "dark olive": ["Autumn"], "deep red": ["Autumn"], "grass green": ["Autumn"], "harvest gold": ["Autumn"],
  "heliotrope": ["Autumn"], "khaki": ["Autumn"], "kingfisher": ["Autumn"], "light sage": ["Autumn"],
  "lizard grey": ["Autumn"], "mahogany": ["Autumn"], "marine navy": ["Autumn"], "mid peach": ["Autumn"],
  "moss green": ["Autumn"], "mustard": ["Autumn"], "old gold": ["Autumn"], "oyster": ["Autumn"],
  "peacock": ["Autumn"], "rosewood": ["Autumn"], "rust": ["Autumn"], "saffron": ["Autumn"],
  "yellow ochre": ["Autumn"], "olive": ["Autumn"], "gold": ["Autumn"], "brown": ["Autumn"],
  "forest green": ["Autumn"], "earthy colors": ["Autumn"], "warm browns": ["Autumn"],
  
  // Multi-seasonal colors
  "neutral": ["Winter", "Spring", "Summer", "Autumn"],
  "beige": ["Spring", "Autumn"], // Different shades for different seasons
  "tan": ["Spring", "Autumn"], // Different shades for different seasons
  "pink": ["Winter", "Spring", "Summer"], // Different shades
  "blue": ["Winter", "Spring", "Summer"], // Different shades
  "green": ["Winter", "Spring", "Summer", "Autumn"], // Different shades
  "grey": ["Winter", "Summer"], // Cool greys
  "gray": ["Winter", "Summer"], // Cool grays
  "red": ["Winter", "Autumn"], // Different shades
  "purple": ["Winter", "Summer", "Autumn"], // Different shades
};

export const fetchWooCommerceProducts = action({
  args: {
    baseUrl: v.string(),
    consumerKey: v.optional(v.string()),
    consumerSecret: v.optional(v.string()),
    page: v.optional(v.number()),
    perPage: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      const page = args.page || 1;
      const perPage = args.perPage || 50;
      const consumerKey = args.consumerKey || "ck_e007af3f5d93bc28e7226af121893f5d4a4b87dc";
      const consumerSecret = args.consumerSecret || "cs_5b96db4d4a3b939f4561e6bf42a54ae9c72c5e00";
      
      // WooCommerce REST API with authentication - include meta data and external URL
      const url = `${args.baseUrl}/wp-json/wc/v3/products?page=${page}&per_page=${perPage}&status=publish&consumer_key=${consumerKey}&consumer_secret=${consumerSecret}&_fields=id,name,description,short_description,price,regular_price,permalink,status,categories,attributes,images,tags,meta_data,external_url`;
      
      console.log("Fetching from URL:", url.replace(consumerSecret, "***"));
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "StyleSeason-App/1.0",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const products: WooCommerceProduct[] = await response.json();
      console.log(`Fetched ${products.length} products from WooCommerce`);

      // Process and import products
      let importedCount = 0;
      for (const product of products) {
        try {
          await ctx.runMutation(internal.woocommerce.importProduct, {
            wooProduct: product,
            baseUrl: args.baseUrl,
          });
          importedCount++;
        } catch (error) {
          console.error(`Failed to import product ${product.id}:`, error);
        }
      }

      return {
        success: true,
        message: `Successfully imported ${importedCount} out of ${products.length} products`,
        totalFetched: products.length,
        totalImported: importedCount,
      };
    } catch (error) {
      console.error("Error fetching WooCommerce products:", error);
      return {
        success: false,
        message: `Failed to fetch products: ${error}`,
        totalFetched: 0,
        totalImported: 0,
      };
    }
  },
});

export const importProduct = internalMutation({
  args: {
    wooProduct: v.any(),
    baseUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const product = args.wooProduct as WooCommerceProduct;
    
    // Skip if product already exists
    const existing = await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("retailerUrl"), product.permalink))
      .first();
    
    if (existing) {
      console.log(`Product ${product.name} already exists, skipping`);
      return;
    }

    // ENHANCED CATEGORY DETERMINATION using WordPress tags
    let category: "tops" | "bottoms" | "dresses" | "shoes" | "accessories" = "accessories";
    let subcategory: string | undefined = undefined;
    let itemType: string | undefined = undefined;
    let styleType: string | undefined = undefined;

    // First, check WordPress item type tags for precise categorization
    for (const tag of product.tags || []) {
      const itemMapping = wpItemTypeTagMapping[tag.id];
      if (itemMapping) {
        category = itemMapping.category;
        subcategory = itemMapping.subcategory;
        itemType = itemMapping.itemType;
        
        // Check if it's a style tag
        if (itemMapping.subcategory === "style") {
          styleType = itemMapping.itemType;
        }
        
        console.log(`WordPress tag ${tag.id} (${tag.name}) mapped to category: ${category}, subcategory: ${subcategory}`);
        break; // Use the first matching item type tag
      }
    }

    // Fallback to category slug mapping if no WordPress tag match
    if (!itemType) {
      for (const cat of product.categories) {
        const mappedCategory = categoryMapping[cat.slug.toLowerCase()];
        if (mappedCategory) {
          category = mappedCategory;
          subcategory = cat.name;
          break;
        }
      }
    }

    // Extract colors from attributes
    const colors: string[] = [];
    const colorAttribute = product.attributes.find(attr => 
      attr.name.toLowerCase().includes("color") || 
      attr.name.toLowerCase().includes("colour")
    );
    if (colorAttribute) {
      colors.push(...colorAttribute.options.map(color => color.toLowerCase()));
    }

    // If no color attribute, try to extract from name or description
    if (colors.length === 0) {
      const text = `${product.name} ${product.description}`.toLowerCase();
      Object.keys(colorToSeasonalTypes).forEach(color => {
        if (text.includes(color)) {
          colors.push(color);
        }
      });
    }

    // Default to neutral colors if none found
    if (colors.length === 0) {
      colors.push("neutral");
    }

    // Extract WordPress IDs and determine seasonal types
    const wpCategoryIds = product.categories.map(cat => cat.id);
    const wpTagIds = product.tags?.map(tag => tag.id) || [];
    const wpSeasonalTypeIds: number[] = [];
    const seasonalTypes: Array<"Winter" | "Spring" | "Summer" | "Autumn"> = [];

    // Check for WordPress seasonal type categories first
    product.categories.forEach(cat => {
      if (wpSeasonalTypeMapping[cat.id]) {
        wpSeasonalTypeIds.push(cat.id);
        const seasonalType = wpSeasonalTypeMapping[cat.id];
        if (!seasonalTypes.includes(seasonalType)) {
          seasonalTypes.push(seasonalType);
        }
      }
    });

    // Check WordPress color tags for seasonal types
    if (seasonalTypes.length === 0) {
      product.tags?.forEach(tag => {
        if (wpColorToSeasonalTypes[tag.id]) {
          wpColorToSeasonalTypes[tag.id].forEach(type => {
            if (!seasonalTypes.includes(type)) {
              seasonalTypes.push(type);
            }
          });
        }
      });
    }

    // If still no seasonal types, fall back to color name detection
    if (seasonalTypes.length === 0) {
      colors.forEach(color => {
        const types = colorToSeasonalTypes[color.toLowerCase()];
        if (types) {
          types.forEach(type => {
            if (!seasonalTypes.includes(type)) {
              seasonalTypes.push(type);
            }
          });
        }
      });
    }

    // Default to all seasons if none determined
    if (seasonalTypes.length === 0) {
      seasonalTypes.push("Winter", "Spring", "Summer", "Autumn");
    }

    // Extract sizes from attributes
    const sizes: string[] = [];
    const sizeAttribute = product.attributes.find(attr => 
      attr.name.toLowerCase().includes("size")
    );
    if (sizeAttribute) {
      sizes.push(...sizeAttribute.options);
    } else {
      // Default sizes
      sizes.push("XS", "S", "M", "L", "XL");
    }

    // Parse price
    const price = parseFloat(product.price || product.regular_price || "0");

    // Enhanced tags creation including item type and style
    const tags: string[] = [
      ...product.categories.map(cat => cat.name.toLowerCase()),
      ...product.attributes.flatMap(attr => attr.options.map(opt => opt.toLowerCase())),
    ];
    
    // Add item type and style type to tags
    if (itemType) tags.push(itemType);
    if (styleType) tags.push(styleType);

    // Clean description (remove HTML tags)
    const cleanDescription = product.short_description || product.description || "";
    const description = cleanDescription.replace(/<[^>]*>/g, "").trim();
    
    // Extract image URLs
    const imageUrls = product.images?.map(img => img.src) || [];

    // Extract Amazon affiliate URL from meta data or external URL
    let amazonUrl: string | undefined = undefined;
    
    // First check if the product has an external URL (for external/affiliate products)
    if (product.external_url && product.external_url.includes('amazon.com')) {
      amazonUrl = product.external_url;
      console.log(`Found Amazon URL in external_url for ${product.name}: ${amazonUrl}`);
    }
    
    // Also check meta data for various possible field names
    if (!amazonUrl && product.meta_data) {
      // Look for common meta field names that might contain Amazon URLs
      const amazonMeta = product.meta_data.find(meta => 
        meta.key === 'amazon_url' || 
        meta.key === 'affiliate_url' || 
        meta.key === 'external_url' ||
        meta.key === '_product_url' ||
        meta.key === 'amazon_link' ||
        meta.key === 'buy_now_url' ||
        meta.key === 'product_url' ||
        meta.key === '_external_url'
      );
      
      if (amazonMeta && typeof amazonMeta.value === 'string' && amazonMeta.value.includes('amazon.com')) {
        amazonUrl = amazonMeta.value;
        console.log(`Found Amazon URL in meta_data for ${product.name}: ${amazonUrl}`);
      }
    }
    
    // Debug: Log all meta data keys for the first few products to help identify the correct field
    if (product.meta_data && product.meta_data.length > 0) {
      console.log(`Meta data keys for ${product.name}:`, product.meta_data.map(m => m.key));
    }

    try {
      await ctx.db.insert("products", {
        name: product.name,
        description: description.substring(0, 500), // Limit description length
        category,
        subcategory: subcategory || product.categories[0]?.name,
        retailer: "ShopYourShade",
        retailerUrl: product.permalink,
        amazonUrl,
        price,
        currency: "USD",
        images: [], // Empty for now
        externalImageUrls: imageUrls,
        colors,
        seasonalTypes,
        sizes,
        tags: tags.slice(0, 10), // Limit tags
        isActive: product.status === "publish",
        wpCategoryIds,
        wpSeasonalTypeIds,
        wpTagIds,
      });

      console.log(`Successfully imported product: ${product.name} (Item: ${itemType || 'unknown'}, Category: ${category}, Colors: ${colors.join(", ")}, Seasonal types: ${seasonalTypes.join(", ")})`);
    } catch (error) {
      console.error(`Failed to insert product ${product.name}:`, error);
      throw error;
    }
  },
});

// List first 5 products to get valid IDs
export const listProducts = action({
  args: {},
  handler: async (ctx, args) => {
    const baseUrl = "https://shopyourshade.com";
    const consumerKey = "ck_e007af3f5d93bc28e7226af121893f5d4a4b87dc";
    const consumerSecret = "cs_5b96db4d4a3b939f4561e6bf42a54ae9c72c5e00";
    
    const url = `${baseUrl}/wp-json/wc/v3/products?per_page=5&consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`;
    
    const response = await fetch(url);
    const products: WooCommerceProduct[] = await response.json();
    
    return products.map(p => ({ id: p.id, name: p.name, permalink: p.permalink }));
  },
});

// Test function to fetch a single product and examine its meta data
export const testFetchProduct = action({
  args: { productId: v.number() },
  handler: async (ctx, args) => {
    const baseUrl = "https://shopyourshade.com";
    const consumerKey = "ck_e007af3f5d93bc28e7226af121893f5d4a4b87dc";
    const consumerSecret = "cs_5b96db4d4a3b939f4561e6bf42a54ae9c72c5e00";
    
    const url = `${baseUrl}/wp-json/wc/v3/products/${args.productId}?consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`;
    
    const response = await fetch(url);
    const product: WooCommerceProduct = await response.json();
    
    return {
      name: product.name,
      permalink: product.permalink,
      external_url: product.external_url,
      meta_data: product.meta_data || [],
    };
  },
});

// Enhanced debug function to analyze ALL meta data comprehensively
export const debugAmazonUrls = action({
  args: { productId: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const baseUrl = "https://shopyourshade.com";
    const consumerKey = "ck_e007af3f5d93bc28e7226af121893f5d4a4b87dc";
    const consumerSecret = "cs_5b96db4d4a3b939f4561e6bf42a54ae9c72c5e00";
    
    // Get multiple products to analyze patterns
    const productIds = args.productId ? [args.productId] : [];
    
    // If no specific product ID, get first 10 products
    if (productIds.length === 0) {
      const listUrl = `${baseUrl}/wp-json/wc/v3/products?per_page=10&consumer_key=${consumerKey}&consumer_secret=${consumerSecret}&_fields=id`;
      const listResponse = await fetch(listUrl);
      const productList = await listResponse.json();
      productIds.push(...productList.map((p: any) => p.id));
    }
    
    const results: Array<{
      productId: number;
      name?: string;
      external_url?: string | null;
      hasExternalUrl?: boolean;
      externalUrlContainsAmazon?: boolean;
      metaDataCount?: number;
      allMetaKeys?: string[];
      urlRelatedMeta?: Array<{ key: string; value: any; hasAmazon: boolean }>;
      amazonMeta?: Array<{ key: string; value: any }>;
      error?: string;
    }> = [];
    
    for (const productId of productIds.slice(0, 5)) { // Limit to 5 products to avoid timeout
      try {
        const url = `${baseUrl}/wp-json/wc/v3/products/${productId}?consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`;
        const response = await fetch(url);
        const product: WooCommerceProduct = await response.json();
        
        // Comprehensive analysis
        const analysis = {
          productId: product.id,
          name: product.name,
          external_url: product.external_url || null,
          hasExternalUrl: !!product.external_url,
          externalUrlContainsAmazon: product.external_url?.includes('amazon.com') || false,
          metaDataCount: product.meta_data?.length || 0,
          allMetaKeys: product.meta_data?.map(m => m.key) || [],
          urlRelatedMeta: product.meta_data?.filter(m => 
            m.key.toLowerCase().includes('url') || 
            m.key.toLowerCase().includes('link') || 
            m.key.toLowerCase().includes('amazon') ||
            m.key.toLowerCase().includes('affiliate') ||
            m.key.toLowerCase().includes('external') ||
            m.key.toLowerCase().includes('product')
          ).map(m => ({ key: m.key, value: m.value, hasAmazon: String(m.value).includes('amazon.com') })) || [],
          // Look for any meta that contains amazon.com
          amazonMeta: product.meta_data?.filter(m => 
            String(m.value).includes('amazon.com')
          ).map(m => ({ key: m.key, value: m.value })) || [],
        };
        
        results.push(analysis);
      } catch (error) {
        results.push({
          productId,
          error: String(error),
        });
      }
    }
    
    // Summary analysis
    const validResults = results.filter(r => !r.error);
    const summary = {
      totalProductsAnalyzed: results.length,
      productsWithExternalUrl: validResults.filter(r => r.hasExternalUrl).length,
      productsWithAmazonExternalUrl: validResults.filter(r => r.externalUrlContainsAmazon).length,
      productsWithAmazonMeta: validResults.filter(r => r.amazonMeta && r.amazonMeta.length > 0).length,
      commonMetaKeys: [...new Set(validResults.flatMap(r => r.allMetaKeys || []))].sort(),
      urlRelatedKeys: [...new Set(validResults.flatMap(r => (r.urlRelatedMeta || []).map((m: any) => m.key)))].sort(),
    };
    
    return {
      summary,
      productDetails: results,
      recommendation: summary.productsWithAmazonExternalUrl > 0 
        ? "Use external_url field - Amazon URLs found there"
        : summary.productsWithAmazonMeta > 0 
        ? "Check specific meta fields that contain Amazon URLs"
        : "No Amazon URLs found in analyzed products. May need to check different products or fields.",
    };
  },
});

export const importShopYourShadeProducts = action({
  args: {},
  handler: async (ctx) => {
    const baseUrl = "https://shopyourshade.com";
    
    try {
      // Try to fetch products from multiple pages
      let totalImported = 0;
      let page = 1;
      let hasMorePages = true;

      while (hasMorePages && page <= 5) { // Limit to 5 pages to avoid timeout
        const result = await ctx.runAction(api.woocommerce.fetchWooCommerceProducts, {
          baseUrl,
          page,
          perPage: 50,
        });

        if (result.success) {
          totalImported += result.totalImported;
          
          // If we got less than the requested amount, we've reached the end
          if (result.totalFetched < 50) {
            hasMorePages = false;
          } else {
            page++;
          }
        } else {
          console.error(`Failed to fetch page ${page}:`, result.message);
          hasMorePages = false;
        }
      }

      return {
        success: true,
        message: `Successfully imported ${totalImported} products from ShopYourShade with complete WordPress integration (158 colors + item type tags)`,
        totalImported,
      };
    } catch (error) {
      console.error("Error importing ShopYourShade products:", error);
      return {
        success: false,
        message: `Failed to import products: ${error}`,
        totalImported: 0,
      };
    }
  },
});

export const addSampleProduct = internalMutation({
  args: {},
  handler: async (ctx) => {
    await ctx.db.insert("products", {
      name: "ShopYourShade Sample Item",
      description: "Sample product from ShopYourShade integration",
      category: "tops" as const,
      retailer: "ShopYourShade",
      retailerUrl: "https://shopyourshade.com",
      price: 99.99,
      currency: "USD",
      images: [],
      colors: ["black"],
      seasonalTypes: ["Winter"] as ("Winter" | "Spring" | "Summer" | "Autumn")[],
      sizes: ["M"],
      tags: ["sample"],
      isActive: true,
    });
  },
});

export const triggerImport = action({
  args: {},
  handler: async (ctx): Promise<{ success: boolean; message: string; totalImported: number }> => {
    return await ctx.runAction(api.woocommerce.importShopYourShadeProducts, {});
  },
});

// Enhanced function to get comprehensive color analysis statistics
export const getColorAnalysisStats = action({
  args: {},
  handler: async (ctx) => {
    const winterColors = Object.entries(wpColorToSeasonalTypes).filter(([_, types]) => types.includes("Winter")).length;
    const springColors = Object.entries(wpColorToSeasonalTypes).filter(([_, types]) => types.includes("Spring")).length;
    const summerColors = Object.entries(wpColorToSeasonalTypes).filter(([_, types]) => types.includes("Summer")).length;
    const autumnColors = Object.entries(wpColorToSeasonalTypes).filter(([_, types]) => types.includes("Autumn")).length;

    return {
      totalColorMappings: Object.keys(wpColorToSeasonalTypes).length,
      seasonalBreakdown: {
        Winter: winterColors,
        Spring: springColors,
        Summer: summerColors,
        Autumn: autumnColors,
      },
      colorNameMappings: Object.keys(colorToSeasonalTypes).length,
      itemTypeMappings: Object.keys(wpItemTypeTagMapping).length,
      systemComplete: true,
      description: "Complete WordPress integration: 158 colors + 14 item types + style tags",
    };
  },
});

// New function to analyze a product's seasonal compatibility
export const analyzeProductSeasonalTypes = action({
  args: {
    productName: v.string(),
    productDescription: v.string(),
    colors: v.array(v.string()),
    wpTagIds: v.optional(v.array(v.number())),
  },
  handler: async (ctx, args) => {
    const seasonalTypes: Array<"Winter" | "Spring" | "Summer" | "Autumn"> = [];
    const analysisDetails: string[] = [];
    let itemType: string | undefined = undefined;
    let category: string | undefined = undefined;

    // Check WordPress item type tags first
    if (args.wpTagIds) {
      args.wpTagIds.forEach(tagId => {
        const itemMapping = wpItemTypeTagMapping[tagId];
        if (itemMapping) {
          itemType = itemMapping.itemType;
          category = itemMapping.category;
          analysisDetails.push(`WordPress tag ${tagId} identifies item as "${itemMapping.itemType}" in category "${itemMapping.category}"`);
        }
      });
    }

    // Check WordPress color tags
    if (args.wpTagIds) {
      args.wpTagIds.forEach(tagId => {
        if (wpColorToSeasonalTypes[tagId]) {
          wpColorToSeasonalTypes[tagId].forEach(type => {
            if (!seasonalTypes.includes(type)) {
              seasonalTypes.push(type);
              analysisDetails.push(`WordPress color tag ${tagId} indicates ${type} season`);
            }
          });
        }
      });
    }

    // Analyze color names
    args.colors.forEach(color => {
      const types = colorToSeasonalTypes[color.toLowerCase()];
      if (types) {
        types.forEach(type => {
          if (!seasonalTypes.includes(type)) {
            seasonalTypes.push(type);
            analysisDetails.push(`Color "${color}" suggests ${type} season`);
          }
        });
      }
    });

    // Text analysis of name and description
    const text = `${args.productName} ${args.productDescription}`.toLowerCase();
    Object.entries(colorToSeasonalTypes).forEach(([colorName, types]) => {
      if (text.includes(colorName)) {
        types.forEach(type => {
          if (!seasonalTypes.includes(type)) {
            seasonalTypes.push(type);
            analysisDetails.push(`Text contains "${colorName}" indicating ${type} season`);
          }
        });
      }
    });

    return {
      seasonalTypes: seasonalTypes.length > 0 ? seasonalTypes : ["Winter", "Spring", "Summer", "Autumn"],
      analysisDetails,
      itemType,
      category,
      confidence: seasonalTypes.length > 0 ? "High" : "Low - defaulted to all seasons",
    };
  },
});

// Function to get WordPress integration statistics
export const getWordPressIntegrationStats = action({
  args: {},
  handler: async (ctx) => {
    return {
      seasonalTypeCategories: Object.keys(wpSeasonalTypeMapping).length,
      colorTags: Object.keys(wpColorToSeasonalTypes).length,
      itemTypeTags: Object.keys(wpItemTypeTagMapping).length,
      totalMappings: Object.keys(wpSeasonalTypeMapping).length + 
                    Object.keys(wpColorToSeasonalTypes).length + 
                    Object.keys(wpItemTypeTagMapping).length,
      breakdown: {
        seasonalCategories: wpSeasonalTypeMapping,
        itemTypes: Object.fromEntries(
          Object.entries(wpItemTypeTagMapping).map(([id, mapping]) => [
            id, 
            `${mapping.itemType} (${mapping.category})`
          ])
        ),
      },
    };
  },
});
