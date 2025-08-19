# Virtual Wardrobe Feature Documentation

## Overview
The Virtual Wardrobe feature allows users to upload and manage their personal clothing items, mix them with store products to create outfits, and leverage AI-powered background removal for professional-looking wardrobe items.

## Key Features

### 1. Camera Capture & Upload
- **Camera Integration**: Direct camera access for capturing clothing photos
- **File Upload**: Support for uploading existing photos
- **Mobile-Optimized**: PWA camera API support for seamless mobile experience
- **Guide Overlay**: Visual guides to help users position clothes correctly

### 2. AI Background Removal
- **Remove.bg Integration**: Professional background removal using Remove.bg API
- **Automatic Processing**: Images are automatically processed upon upload
- **Fallback Support**: Gracefully handles cases when API is unavailable
- **Color Detection**: Automatic detection of dominant colors in clothing

### 3. Wardrobe Management
- **My Wardrobe Tab**: Dedicated tab in OutfitBuilder for personal items
- **Edit Functionality**: Edit names, categories, brands, and notes
- **Delete Capability**: Remove items from wardrobe
- **Category Organization**: Items organized by clothing categories

### 4. Outfit Builder Integration
- **Mixed Outfits**: Combine personal wardrobe items with store products
- **Visual Distinction**: Clear markers to identify personal vs store items
- **Drag-and-Drop**: Same intuitive interface for both item types
- **Toggle View**: Switch between store products and wardrobe items

## Technical Implementation

### Database Schema
```typescript
wardrobeItems: {
  userId: Id<"users">
  name: string
  category: "tops" | "bottoms" | "dresses" | "shoes" | "accessories"
  subcategory?: string
  originalImageId: Id<"_storage">
  processedImageId?: Id<"_storage">
  processedImageUrl?: string
  colors: string[]
  tags: string[]
  brand?: string
  notes?: string
  isActive: boolean
  createdAt: number
  updatedAt: number
}
```

### Backend Functions
- `uploadWardrobeItem`: Upload and store clothing items
- `getWardrobeItems`: Fetch user's wardrobe with optional filtering
- `updateWardrobeItem`: Edit item details
- `deleteWardrobeItem`: Soft delete items
- `updateProcessedImage`: Update processed image after background removal

### Components
- **WardrobeCapture**: Camera/upload interface for adding items
- **WardrobeTabContent**: Display and manage wardrobe items
- **OutfitBuilder**: Enhanced to support wardrobe items

## Setup Instructions

### 1. Environment Configuration
Add your Remove.bg API key to `.env.local`:
```bash
REMOVEBG_API_KEY="your_api_key_here"
```

Get your API key from: https://www.remove.bg/users/sign_up

### 2. Database Migration
The schema updates will be automatically applied when you run the development server.

### 3. PWA Camera Support
The manifest.json has been configured with camera permissions for PWA support.

## Usage Guide

### Adding Items to Wardrobe
1. Navigate to **Outfit Builder** → **My Wardrobe** tab
2. Click **Add Item** button
3. Choose between:
   - **Upload Photo**: Select an existing image
   - **Take Photo**: Use device camera
4. Provide item details:
   - Name (required)
   - Category (auto-detected or manual)
   - Brand (optional)
   - Notes (optional)
5. Click **Add to Wardrobe**

### Creating Mixed Outfits
1. Go to **Build Outfit** tab
2. Toggle between:
   - **Store Products**: Browse and select from store
   - **My Wardrobe**: Select from personal items
3. Build your outfit by selecting items
4. Save outfit with name and description

### Managing Wardrobe Items
1. Visit **My Wardrobe** tab
2. Click **Edit** to modify item details
3. Click **Delete** to remove items
4. Items are organized by category with visual indicators

## Features in Action

### Mobile Experience
- Camera API works offline with PWA support
- Cached images for offline access
- Touch-optimized interface
- Responsive grid layout

### Visual Indicators
- **"My"** badge on personal items in outfits
- **Purple badge** showing item category
- **Store vs Wardrobe** toggle for clear distinction

### Performance Optimization
- Lazy loading of images
- Efficient caching strategy
- Optimized image processing
- Background job for AI processing

## API Integration

### Remove.bg API
- Endpoint: `https://api.remove.bg/v1.0/removebg`
- Features used:
  - Size: "preview" (for testing) or "full" (production)
  - Type: "product" (optimized for clothing)
- Fallback: Returns original image if API unavailable

## Security Considerations
- User authentication required for all operations
- Ownership verification on all mutations
- Soft delete preserves data integrity
- Secure file upload with storage validation

## Future Enhancements
- Advanced color analysis
- Clothing type auto-detection
- Outfit recommendations based on wardrobe
- Social sharing of wardrobe items
- Wardrobe statistics and insights

## Troubleshooting

### Camera Not Working
- Check browser permissions for camera access
- Ensure HTTPS connection (required for camera API)
- Try refreshing the page or restarting browser

### Background Removal Issues
- Verify Remove.bg API key is configured
- Check API quota limits
- Ensure good lighting and plain background in photos

### Upload Failures
- Check file size (recommended < 5MB)
- Ensure image format is supported (JPEG, PNG)
- Verify network connection

## Support
For issues or questions about the Virtual Wardrobe feature, please refer to the main application documentation or contact support.