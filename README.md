# StyleSeason - Social Fashion Platform with Seasonal Color Analysis
  
A comprehensive social fashion platform built with React 19, TypeScript, and Convex real-time database. Features seasonal color communities, social feeds, and AI-powered styling recommendations.

## ✨ Features
- 🏘️ Seasonal color groups (Winter/Spring/Summer/Autumn)  
- 📱 Real-time social feeds with image sharing
- 🎨 144-color seasonal database with educational content
- 👑 Admin authentication with role-based access
- 📱 Mobile-responsive PWA design

This is a project built with [Chef](https://chef.convex.dev) using [Convex](https://convex.dev) as its backend.
 You can find docs about Chef with useful information like how to deploy to production [here](https://docs.convex.dev/chef).
  
This project is connected to the Convex deployment named [`courteous-sparrow-250`](https://dashboard.convex.dev/d/courteous-sparrow-250).
  
## Project structure
  
The frontend code is in the `app` directory and is built with [Vite](https://vitejs.dev/).
  
The backend code is in the `convex` directory.
  
`npm run dev` will start the frontend and backend servers.

## App authentication

Chef apps use [Convex Auth](https://auth.convex.dev/) with Anonymous auth for easy sign in. You may wish to change this before deploying your app.

## Developing and deploying your app

Check out the [Convex docs](https://docs.convex.dev/) for more information on how to develop with Convex.
* If you're new to Convex, the [Overview](https://docs.convex.dev/understanding/) is a good place to start
* Check out the [Hosting and Deployment](https://docs.convex.dev/production/) docs for how to deploy your app
* Read the [Best Practices](https://docs.convex.dev/understanding/best-practices/) guide for tips on how to improve you app further

## HTTP API

User-defined http routes are defined in the `convex/router.ts` file. We split these routes into a separate file from `convex/http.ts` to allow us to prevent the LLM from modifying the authentication routes.
