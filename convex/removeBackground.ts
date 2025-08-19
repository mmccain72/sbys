// DEPRECATED: This file is kept for backward compatibility only.
// Background removal is now handled client-side using TensorFlow.js in /src/lib/backgroundRemoval.ts
// This eliminates the need for the Remove.bg API and provides free, offline background removal.

"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";

// Legacy action kept for backward compatibility
// New implementations should use client-side processing
export const removeBackground = action({
  args: {
    imageStorageId: v.id("_storage"),
    imageName: v.string(),
  },
  handler: async (ctx, args) => {
    // This action is deprecated. Background removal is now handled client-side.
    // Returning a simple response for backward compatibility.
    
    const imageUrl = await ctx.storage.getUrl(args.imageStorageId);
    
    return {
      success: false,
      error: "Server-side background removal is deprecated. Please use client-side processing.",
      processedImageUrl: imageUrl || "",
      processedImageId: args.imageStorageId,
      colors: ["#000000", "#FFFFFF", "#808080"],
      detectedCategory: "tops" as const,
      detectedTags: ["clothing"],
    };
  },
});