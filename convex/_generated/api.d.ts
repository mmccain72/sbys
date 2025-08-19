/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as aiColorChat from "../aiColorChat.js";
import type * as auth from "../auth.js";
import type * as bulkImport from "../bulkImport.js";
import type * as config from "../config.js";
import type * as groups from "../groups.js";
import type * as http from "../http.js";
import type * as outfits from "../outfits.js";
import type * as products from "../products.js";
import type * as quiz from "../quiz.js";
import type * as rateLimiter from "../rateLimiter.js";
import type * as removeBackground from "../removeBackground.js";
import type * as router from "../router.js";
import type * as social from "../social.js";
import type * as validation from "../validation.js";
import type * as wardrobe from "../wardrobe.js";
import type * as woocommerce from "../woocommerce.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  aiColorChat: typeof aiColorChat;
  auth: typeof auth;
  bulkImport: typeof bulkImport;
  config: typeof config;
  groups: typeof groups;
  http: typeof http;
  outfits: typeof outfits;
  products: typeof products;
  quiz: typeof quiz;
  rateLimiter: typeof rateLimiter;
  removeBackground: typeof removeBackground;
  router: typeof router;
  social: typeof social;
  validation: typeof validation;
  wardrobe: typeof wardrobe;
  woocommerce: typeof woocommerce;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
