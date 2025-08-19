import { httpRouter } from "convex/server";

const http = httpRouter();

// Add any custom HTTP routes here
// Example:
// http.route({
//   path: "/api/webhook",
//   method: "POST",
//   handler: httpAction(async (ctx, request) => {
//     // Handle webhook
//   }),
// });

export default http;
