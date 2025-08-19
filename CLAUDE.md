# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Start Development
```bash
npm run dev           # Starts both frontend (Vite) and backend (Convex) in parallel
npm run dev:frontend  # Starts only the Vite frontend server with auto-open
npm run dev:backend   # Starts only the Convex backend development server
```

### Build & Validation
```bash
npm run build  # Build production frontend with Vite
npm run lint   # Run TypeScript checks for both Convex and frontend, validate Convex deployment, and build
```

The lint command performs comprehensive validation:
1. TypeScript type checking for Convex backend (`tsc -p convex`)
2. TypeScript type checking for frontend (`tsc -p .`)
3. Convex deployment validation (`convex dev --once`)
4. Production build test (`vite build`)

## Architecture Overview

### Tech Stack
- **Frontend**: React 19 with TypeScript, Vite build system, Tailwind CSS for styling
- **Backend**: Convex real-time database and serverless functions
- **Authentication**: Convex Auth with Password and Anonymous providers
- **State Management**: Convex React hooks for real-time data synchronization
- **PWA Support**: Service worker, manifest, and offline capabilities

### Project Structure

**Frontend (`/src`)**
- `App.tsx`: Main application shell with navigation and page routing
- `components/`: Feature-specific components (Dashboard, QuizPage, ProductBrowser, etc.)
- `hooks/`: Custom React hooks (e.g., usePWA for PWA features)
- Path aliasing: `@/` maps to `./src/` directory

**Backend (`/convex`)**
- `schema.ts`: Database schema definitions with tables for products, users, social features
- `auth.ts`: Authentication configuration and user queries
- `http.ts` & `router.ts`: HTTP API endpoints (authentication routes are protected)
- Feature modules: `products.ts`, `outfits.ts`, `quiz.ts`, `social.ts`, `woocommerce.ts`
- `_generated/`: Auto-generated Convex types and API definitions (do not edit)

### Key Database Tables

- **products**: Fashion items with categories, seasonal types, prices, and search capabilities
- **quizResults**: User seasonal color analysis results (Winter/Spring/Summer/Autumn)
- **outfits**: User-created outfit combinations with product references
- **favorites**: User product favorites
- **Social tables**: friendships, messages, socialPosts, postComments for social features

### Authentication Flow

The app uses Convex Auth with dual provider support:
1. Anonymous auth for quick sign-in without registration
2. Password auth for registered users
3. Authentication state is managed via `api.auth.loggedInUser` query
4. Protected routes check authentication before rendering

### Real-time Features

All data fetching uses Convex's reactive query system:
- `useQuery` hook for real-time data subscriptions
- `useMutation` hook for data modifications
- Automatic optimistic updates and conflict resolution
- WebSocket-based real-time synchronization

### PWA Capabilities

- Service worker for offline support (`public/sw.js`)
- Web app manifest for installability (`public/manifest.json`)
- Install prompt component (`PWAInstallPrompt.tsx`)
- Offline indicator (`OfflineIndicator.tsx`)

### Deployment

Connected to Convex deployment: `courteous-sparrow-250`
- Frontend deploys via Vite build
- Backend deploys to Convex cloud
- Environment variables in `.env.local` (Convex URL and deployment credentials)

### Development Notes

- The project includes Chef.convex.dev integration for development screenshots
- Zone.Identifier files are Windows-specific metadata (can be ignored)
- No test framework is currently configured
- Uses npm-run-all for parallel script execution