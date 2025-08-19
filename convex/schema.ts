import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // Existing tables
  products: defineTable({
    name: v.string(),
    description: v.string(),
    category: v.union(v.literal("tops"), v.literal("bottoms"), v.literal("dresses"), v.literal("shoes"), v.literal("accessories")),
    subcategory: v.optional(v.string()),
    retailer: v.string(),
    retailerUrl: v.string(),
    amazonUrl: v.optional(v.string()), // Direct Amazon affiliate URL
    price: v.number(),
    currency: v.string(),
    images: v.array(v.id("_storage")),
    colors: v.array(v.string()),
    seasonalTypes: v.array(v.union(v.literal("Winter"), v.literal("Spring"), v.literal("Summer"), v.literal("Autumn"))),
    sizes: v.array(v.string()),
    tags: v.array(v.string()),
    isActive: v.boolean(),
    externalImageUrls: v.optional(v.array(v.string())),
    wpCategoryIds: v.optional(v.array(v.number())),
    wpSeasonalTypeIds: v.optional(v.array(v.number())),
    wpTagIds: v.optional(v.array(v.number())),
  }).searchIndex("search_products", {
    searchField: "name",
    filterFields: ["category", "retailer"],
  }),

  favorites: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_product", ["userId", "productId"]),

  quizResults: defineTable({
    userId: v.id("users"),
    seasonalType: v.union(v.literal("Winter"), v.literal("Spring"), v.literal("Summer"), v.literal("Autumn")),
    answers: v.array(v.object({
      questionId: v.string(),
      answer: v.string(),
    })),
    description: v.string(),
    colors: v.array(v.string()),
  }).index("by_user", ["userId"]),

  outfits: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    productIds: v.array(v.id("products")),
    wardrobeItemIds: v.optional(v.array(v.id("wardrobeItems"))), // Added wardrobe items support
    occasion: v.optional(v.string()),
    seasonalType: v.optional(v.union(v.literal("Winter"), v.literal("Spring"), v.literal("Summer"), v.literal("Autumn"))),
    isPublic: v.boolean(),
  }).index("by_user", ["userId"]),

  // New social tables
  friendships: defineTable({
    requesterId: v.id("users"),
    addresseeId: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("declined"), v.literal("blocked")),
  })
    .index("by_requester", ["requesterId"])
    .index("by_addressee", ["addresseeId"])
    .index("by_users", ["requesterId", "addresseeId"]),

  messages: defineTable({
    senderId: v.id("users"),
    receiverId: v.id("users"),
    content: v.string(),
    messageType: v.union(v.literal("text"), v.literal("product_share"), v.literal("outfit_share")),
    productId: v.optional(v.id("products")),
    outfitId: v.optional(v.id("outfits")),
    isRead: v.boolean(),
  })
    .index("by_conversation", ["senderId", "receiverId"])
    .index("by_receiver", ["receiverId"]),

  productShares: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    message: v.optional(v.string()),
    sharedWith: v.array(v.id("users")),
    isPublic: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_product", ["productId"]),

  socialPosts: defineTable({
    userId: v.id("users"),
    content: v.string(),
    postType: v.union(v.literal("text"), v.literal("product"), v.literal("outfit"), v.literal("quiz_result"), v.literal("image")),
    productId: v.optional(v.id("products")),
    outfitId: v.optional(v.id("outfits")),
    imageUrls: v.optional(v.array(v.string())),
    likes: v.array(v.id("users")),
    isPublic: v.boolean(),
  })
    .index("by_user", ["userId"]),

  postComments: defineTable({
    postId: v.id("socialPosts"),
    userId: v.id("users"),
    content: v.string(),
  })
    .index("by_post", ["postId"])
    .index("by_user", ["userId"]),

  // Outfit scheduling table
  scheduledOutfits: defineTable({
    userId: v.id("users"),
    outfitId: v.id("outfits"),
    date: v.string(), // ISO date string (YYYY-MM-DD)
    notes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "date"])
    .index("by_outfit", ["outfitId"]),

  // Virtual wardrobe table
  wardrobeItems: defineTable({
    userId: v.id("users"),
    name: v.string(),
    category: v.union(v.literal("tops"), v.literal("bottoms"), v.literal("dresses"), v.literal("shoes"), v.literal("accessories")),
    subcategory: v.optional(v.string()),
    originalImageId: v.id("_storage"),
    processedImageId: v.optional(v.id("_storage")),
    processedImageUrl: v.optional(v.string()), // For caching the processed image URL
    colors: v.array(v.string()),
    tags: v.array(v.string()),
    brand: v.optional(v.string()),
    notes: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_category", ["userId", "category"]),

  // Groups feature tables
  groups: defineTable({
    name: v.string(),
    seasonalType: v.union(
      v.literal("Winter"),
      v.literal("Spring"),
      v.literal("Summer"),
      v.literal("Autumn")
    ),
    description: v.string(),
    memberCount: v.number(),
    coverImageUrl: v.optional(v.string()),
    themeColor: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_seasonal_type", ["seasonalType"])
    .index("by_active", ["isActive"]),

  groupMemberships: defineTable({
    userId: v.id("users"),
    groupId: v.id("groups"),
    joinedAt: v.number(),
    memberType: v.union(
      v.literal("member"),
      v.literal("moderator"),
      v.literal("expert")
    ),
    isActive: v.boolean(),
    lastActivityAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_group", ["groupId"])
    .index("by_user_and_group", ["userId", "groupId"]),

  groupPosts: defineTable({
    groupId: v.id("groups"),
    userId: v.id("users"),
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
    likes: v.array(v.id("users")),
    isPinned: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_user", ["userId"])
    .index("by_group_and_type", ["groupId", "postType"])
    .index("by_created", ["createdAt"]),

  groupComments: defineTable({
    postId: v.id("groupPosts"),
    userId: v.id("users"),
    content: v.string(),
    likes: v.array(v.id("users")),
    createdAt: v.number(),
  })
    .index("by_post", ["postId"])
    .index("by_user", ["userId"]),

  groupActivities: defineTable({
    groupId: v.id("groups"),
    userId: v.id("users"),
    activityType: v.union(
      v.literal("joined"),
      v.literal("posted"),
      v.literal("commented"),
      v.literal("liked"),
      v.literal("shared")
    ),
    targetId: v.optional(v.string()), // ID of post, comment, etc.
    targetType: v.optional(v.string()), // "post", "comment", etc.
    createdAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_user", ["userId"])
    .index("by_created", ["createdAt"]),

  groupChallenges: defineTable({
    groupId: v.id("groups"),
    title: v.string(),
    description: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    category: v.string(),
    participants: v.array(v.id("users")),
    winnerId: v.optional(v.id("users")),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_active", ["isActive"]),
};

export default defineSchema({
  ...authTables,
  // Override the users table to add custom fields
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // Custom field for admin role
    isAdmin: v.optional(v.boolean()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),
  ...applicationTables,
});
