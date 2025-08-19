// Configuration management for sensitive data
// Uses Convex environment variables for production security

export const getWooCommerceConfig = () => {
  // In production, these should be set via Convex dashboard environment variables
  // For local development, you can pass them as arguments to the functions
  
  // Check if we're in a Convex environment with access to process.env
  const config = {
    consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
    consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
    baseUrl: process.env.WOOCOMMERCE_BASE_URL || "https://shopyourshade.com"
  };

  return config;
};

// Validate that required configuration is present
export const validateWooCommerceConfig = (consumerKey?: string, consumerSecret?: string) => {
  if (!consumerKey || !consumerSecret) {
    throw new Error(
      "WooCommerce API credentials are not configured. " +
      "Please set WOOCOMMERCE_CONSUMER_KEY and WOOCOMMERCE_CONSUMER_SECRET " +
      "environment variables in the Convex dashboard or pass them as function arguments."
    );
  }
  
  // Basic validation to ensure they're not the hardcoded values
  if (consumerKey.startsWith("ck_e007af3f5d93bc28e7226af121893f5d4a4b87dc")) {
    console.warn("Warning: Using hardcoded WooCommerce credentials. This is a security risk!");
  }
  
  return { consumerKey, consumerSecret };
};