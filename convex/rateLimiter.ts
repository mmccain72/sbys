import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  // API endpoints with their limits
  endpoints: {
    // WooCommerce sync - very limited since it's resource intensive
    woocommerce_sync: {
      maxRequests: 2,
      windowMs: 60 * 60 * 1000, // 1 hour
      blockDurationMs: 60 * 60 * 1000, // Block for 1 hour after limit exceeded
    },
    // Product queries - reasonable limits
    product_query: {
      maxRequests: 100,
      windowMs: 60 * 1000, // 1 minute
      blockDurationMs: 5 * 60 * 1000, // Block for 5 minutes
    },
    // Product search - moderate limits
    product_search: {
      maxRequests: 50,
      windowMs: 60 * 1000, // 1 minute
      blockDurationMs: 5 * 60 * 1000, // Block for 5 minutes
    },
    // User actions - generous limits
    user_action: {
      maxRequests: 200,
      windowMs: 60 * 1000, // 1 minute
      blockDurationMs: 2 * 60 * 1000, // Block for 2 minutes
    },
  },
};

// Types
export type RateLimitEndpoint = keyof typeof RATE_LIMIT_CONFIG.endpoints;

interface RateLimitEntry {
  count: number;
  firstRequestTime: number;
  blockedUntil?: number;
}

// In-memory storage for rate limiting (per Convex instance)
// In production, this should be stored in the database for persistence
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check if a request is rate limited
 * @param identifier - Unique identifier for the requester (userId, IP, etc.)
 * @param endpoint - The endpoint being accessed
 * @returns Object with allowed status and retry information
 */
export function checkRateLimit(
  identifier: string,
  endpoint: RateLimitEndpoint
): {
  allowed: boolean;
  remainingRequests?: number;
  resetTime?: number;
  retryAfter?: number;
} {
  const config = RATE_LIMIT_CONFIG.endpoints[endpoint];
  if (!config) {
    // Unknown endpoint - allow by default but log warning
    console.warn(`Unknown rate limit endpoint: ${endpoint}`);
    return { allowed: true };
  }

  const key = `${identifier}:${endpoint}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // Check if blocked
  if (entry?.blockedUntil && entry.blockedUntil > now) {
    return {
      allowed: false,
      retryAfter: Math.ceil((entry.blockedUntil - now) / 1000), // seconds
    };
  }

  // No previous requests or window expired
  if (!entry || now - entry.firstRequestTime > config.windowMs) {
    rateLimitStore.set(key, {
      count: 1,
      firstRequestTime: now,
    });
    return {
      allowed: true,
      remainingRequests: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    };
  }

  // Within window - check count
  if (entry.count >= config.maxRequests) {
    // Block the identifier
    entry.blockedUntil = now + config.blockDurationMs;
    rateLimitStore.set(key, entry);
    
    return {
      allowed: false,
      retryAfter: Math.ceil(config.blockDurationMs / 1000), // seconds
    };
  }

  // Increment count and allow
  entry.count++;
  rateLimitStore.set(key, entry);
  
  return {
    allowed: true,
    remainingRequests: config.maxRequests - entry.count,
    resetTime: entry.firstRequestTime + config.windowMs,
  };
}

/**
 * Clean up expired rate limit entries (should be called periodically)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  const maxAge = Math.max(
    ...Object.values(RATE_LIMIT_CONFIG.endpoints).map(
      (config) => config.windowMs + config.blockDurationMs
    )
  );

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.firstRequestTime > maxAge) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Rate limit decorator for Convex mutations and queries
 * Usage: Wrap your mutation/query handlers with this function
 */
export function withRateLimit<T extends (...args: any[]) => any>(
  endpoint: RateLimitEndpoint,
  handler: T,
  getIdentifier: (ctx: any, args: any) => string
): T {
  return (async (ctx: any, args: any) => {
    const identifier = getIdentifier(ctx, args);
    const rateLimitResult = checkRateLimit(identifier, endpoint);

    if (!rateLimitResult.allowed) {
      throw new Error(
        `Rate limit exceeded. Please try again in ${rateLimitResult.retryAfter} seconds.`
      );
    }

    // Add rate limit headers to response (if possible in your setup)
    // This would depend on your specific Convex configuration
    const result = await handler(ctx, args);
    
    // Periodically cleanup old entries (1% chance per request)
    if (Math.random() < 0.01) {
      cleanupRateLimitStore();
    }

    return result;
  }) as T;
}

// Database-backed rate limiting for persistence across instances
export const checkDatabaseRateLimit = mutation({
  args: {
    identifier: v.string(),
    endpoint: v.string(),
  },
  handler: async (ctx, args) => {
    // This would implement database-backed rate limiting
    // for production use where multiple Convex instances need
    // to share rate limit state
    
    // For now, returning a simple check
    const endpoint = args.endpoint as RateLimitEndpoint;
    const result = checkRateLimit(args.identifier, endpoint);
    
    return {
      allowed: result.allowed,
      remainingRequests: result.remainingRequests,
      resetTime: result.resetTime,
      retryAfter: result.retryAfter,
    };
  },
});

// Helper to get user identifier from context
export function getUserIdentifier(ctx: any): string {
  // Try to get authenticated user ID
  const userId = ctx.auth?.userId;
  if (userId) {
    return `user:${userId}`;
  }
  
  // Fallback to session ID or IP if available
  // This would need to be passed from the client
  return "anonymous:default";
}

// Example usage in a mutation:
/*
export const syncWooCommerceProducts = mutation({
  args: { ... },
  handler: withRateLimit(
    "woocommerce_sync",
    async (ctx, args) => {
      // Your existing sync logic here
    },
    getUserIdentifier
  ),
});
*/