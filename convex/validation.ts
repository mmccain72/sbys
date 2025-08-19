// Input validation and sanitization utilities for security
import { v } from "convex/values";

// HTML/Script injection prevention
export const sanitizeString = (input: string | undefined | null): string => {
  if (!input) return "";
  
  // Remove HTML tags and script injections
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/[<>]/g, "")
    .trim()
    .substring(0, 1000); // Limit length to prevent DoS
};

// Validate and sanitize product search input
export const validateSearchTerm = (searchTerm: string): string => {
  // Remove special characters that could be used for injection
  const sanitized = searchTerm
    .replace(/[^\w\s-]/g, "") // Keep only alphanumeric, spaces, and hyphens
    .trim()
    .substring(0, 100); // Limit search term length
  
  if (sanitized.length < 2) {
    throw new Error("Search term must be at least 2 characters");
  }
  
  return sanitized;
};

// Validate price input
export const validatePrice = (price: number): number => {
  if (isNaN(price) || price < 0) {
    throw new Error("Invalid price value");
  }
  
  if (price > 1000000) {
    throw new Error("Price exceeds maximum allowed value");
  }
  
  // Round to 2 decimal places
  return Math.round(price * 100) / 100;
};

// Validate page numbers for pagination
export const validatePageNumber = (page: number | undefined, maxPage: number = 100): number => {
  const pageNum = page || 1;
  
  if (!Number.isInteger(pageNum) || pageNum < 1) {
    return 1;
  }
  
  if (pageNum > maxPage) {
    return maxPage;
  }
  
  return pageNum;
};

// Validate page size for pagination
export const validatePageSize = (size: number | undefined, maxSize: number = 50): number => {
  const pageSize = size || 20;
  
  if (!Number.isInteger(pageSize) || pageSize < 1) {
    return 20;
  }
  
  if (pageSize > maxSize) {
    return maxSize;
  }
  
  return pageSize;
};

// Validate URL to prevent open redirect vulnerabilities
export const validateUrl = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    
    // Only allow HTTPS URLs for security
    if (parsedUrl.protocol !== "https:") {
      throw new Error("Only HTTPS URLs are allowed");
    }
    
    // Whitelist of allowed domains
    const allowedDomains = [
      "shopyourshade.com",
      "amazon.com",
      "www.amazon.com"
    ];
    
    if (!allowedDomains.some(domain => parsedUrl.hostname.endsWith(domain))) {
      throw new Error("URL domain not allowed");
    }
    
    return url;
  } catch (error) {
    throw new Error("Invalid URL format");
  }
};

// Validate color input
export const validateColor = (color: string): string => {
  const sanitized = sanitizeString(color).toLowerCase();
  
  // Basic color name validation - could be extended with a whitelist
  if (!/^[a-z\s-]+$/.test(sanitized)) {
    throw new Error("Invalid color name");
  }
  
  return sanitized.substring(0, 50);
};

// Validate seasonal type
export const validateSeasonalType = (type: string): "Winter" | "Spring" | "Summer" | "Autumn" => {
  const validTypes = ["Winter", "Spring", "Summer", "Autumn"];
  
  if (!validTypes.includes(type)) {
    throw new Error(`Invalid seasonal type. Must be one of: ${validTypes.join(", ")}`);
  }
  
  return type as "Winter" | "Spring" | "Summer" | "Autumn";
};

// Validate category
export const validateCategory = (category: string): "tops" | "bottoms" | "dresses" | "shoes" | "accessories" => {
  const validCategories = ["tops", "bottoms", "dresses", "shoes", "accessories"];
  
  if (!validCategories.includes(category)) {
    throw new Error(`Invalid category. Must be one of: ${validCategories.join(", ")}`);
  }
  
  return category as "tops" | "bottoms" | "dresses" | "shoes" | "accessories";
};

// Validate array of strings (for tags, colors, etc.)
export const validateStringArray = (arr: string[], maxLength: number = 20): string[] => {
  if (!Array.isArray(arr)) {
    return [];
  }
  
  return arr
    .slice(0, maxLength) // Limit array size
    .map(item => sanitizeString(item))
    .filter(item => item.length > 0);
};

// Validate product data
export const validateProductData = (data: any) => {
  return {
    name: sanitizeString(data.name).substring(0, 200),
    description: sanitizeString(data.description).substring(0, 1000),
    category: data.category ? validateCategory(data.category) : "accessories",
    price: validatePrice(data.price || 0),
    colors: validateStringArray(data.colors || [], 10),
    sizes: validateStringArray(data.sizes || [], 10),
    tags: validateStringArray(data.tags || [], 20),
    retailerUrl: data.retailerUrl ? validateUrl(data.retailerUrl) : "",
    amazonUrl: data.amazonUrl ? validateUrl(data.amazonUrl) : undefined,
  };
};

// Rate limiting helper (to be used with a rate limiting service)
export const checkRateLimit = (userId: string, action: string, maxRequests: number = 10, windowMs: number = 60000) => {
  // This would integrate with a rate limiting service like Redis
  // For now, we'll just log the attempt
  console.log(`Rate limit check: User ${userId} performing ${action}`);
  
  // In production, implement actual rate limiting logic here
  // Throw an error if rate limit exceeded
  // throw new Error("Rate limit exceeded. Please try again later.");
  
  return true;
};