import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

interface ProductBrowserProps {
  setCurrentPage: (page: string) => void;
  favoritesOnly?: boolean; // New prop to enable favorites-only mode
}

export function ProductBrowser({ setCurrentPage, favoritesOnly = false }: ProductBrowserProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSeasonalType, setSelectedSeasonalType] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showShareModal, setShowShareModal] = useState<Id<"products"> | null>(null);
  const [showProductModal, setShowProductModal] = useState<Id<"products"> | null>(null);
  const [strictFiltering, setStrictFiltering] = useState(false);
  const [currentPage, setCurrentPageState] = useState(1);
  const [pageSize] = useState(20);

  const userSeasonalType = useQuery(api.quiz.getUserSeasonalType);
  
  // Get user favorites for favorites-only mode
  const userFavorites = useQuery(api.products.getUserFavorites);
  
  const productsResult = useQuery(api.products.getProducts, {
    category: selectedCategory ? selectedCategory as any : undefined,
    seasonalType: selectedSeasonalType ? selectedSeasonalType as any : undefined,
    strictSeasonalFiltering: strictFiltering,
    page: currentPage,
    pageSize: pageSize,
  });
  
  const searchResult = useQuery(
    api.products.searchProducts,
    searchTerm.length >= 2
      ? {
          searchTerm,
          category: selectedCategory ? selectedCategory as any : undefined,
          seasonalType: selectedSeasonalType ? selectedSeasonalType as any : undefined,
          strictSeasonalFiltering: strictFiltering,
          page: currentPage,
          pageSize: pageSize,
        }
      : "skip"
  );

  const toggleFavorite = useMutation(api.products.toggleFavorite);
  const shareProduct = useMutation(api.social.shareProduct);
  const friends = useQuery(api.social.getFriends);
  const insertSampleProducts = useMutation(api.products.insertSampleProducts);

  // Auto-set user's seasonal type when available
  useEffect(() => {
    if (userSeasonalType && !selectedSeasonalType) {
      setSelectedSeasonalType(userSeasonalType.seasonalType);
    }
  }, [userSeasonalType, selectedSeasonalType]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPageState(1);
  }, [selectedCategory, selectedSeasonalType, searchTerm, strictFiltering]);

  // Determine which result to display
  let displayResult;
  
  if (favoritesOnly) {
    // In favorites-only mode, use user favorites and apply filters
    let filteredFavorites = userFavorites || [];
    
    // Apply search filter
    if (searchTerm.length >= 2) {
      filteredFavorites = filteredFavorites.filter(product =>
        product && (
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      filteredFavorites = filteredFavorites.filter(product => product && product.category === selectedCategory);
    }
    
    // Apply seasonal type filter
    if (selectedSeasonalType) {
      if (strictFiltering) {
        filteredFavorites = filteredFavorites.filter(product => {
          if (!product) return false;
          const hasSeasonalType = Array.isArray(product.seasonalTypes) && product.seasonalTypes.includes(selectedSeasonalType as any);
          const isMultiSeasonal = Array.isArray(product.seasonalTypes) && product.seasonalTypes.length > 2;
          return hasSeasonalType && !isMultiSeasonal;
        });
      } else {
        filteredFavorites = filteredFavorites.filter(product => 
          product && Array.isArray(product.seasonalTypes) && product.seasonalTypes.includes(selectedSeasonalType as any)
        );
      }
    }
    
    // Apply pagination to favorites
    const totalCount = filteredFavorites.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const offset = (currentPage - 1) * pageSize;
    const paginatedFavorites = filteredFavorites.slice(offset, offset + pageSize);
    
    displayResult = {
      products: paginatedFavorites,
      pagination: {
        currentPage,
        totalPages,
        totalCount,
        pageSize,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      }
    };
  } else {
    // Normal mode - use regular product queries
    displayResult = searchTerm.length >= 2 ? searchResult : productsResult;
  }
  
  // Extract products and pagination safely
  const products = displayResult?.products || [];
  const pagination = displayResult?.pagination || null;

  // Memoize static arrays to ensure stability and prevent re-renders
  const categories = React.useMemo(() => [
    { id: "", label: "All Categories", icon: "🛍️" },
    { id: "tops", label: "Tops", icon: "👕" },
    { id: "bottoms", label: "Bottoms", icon: "👖" },
    { id: "dresses", label: "Dresses", icon: "👗" },
    { id: "shoes", label: "Shoes", icon: "👠" },
    { id: "accessories", label: "Accessories", icon: "👜" },
    // Specific clothing items
    { id: "sweaters", label: "Sweaters", icon: "🧥" },
    { id: "cardigans", label: "Cardigans", icon: "🧥" },
    { id: "blouses", label: "Blouses", icon: "👚" },
    { id: "tanks", label: "Tank Tops", icon: "👕" },
    { id: "jackets", label: "Jackets", icon: "🧥" },
    { id: "coats", label: "Coats", icon: "🧥" },
    { id: "skirts", label: "Skirts", icon: "👗" },
    { id: "shorts", label: "Shorts", icon: "🩳" },
    { id: "scarves", label: "Scarves", icon: "🧣" },
    // Style categories
    { id: "office-wear", label: "Office Wear", icon: "💼" },
    { id: "casual", label: "Casual", icon: "👕" },
    { id: "work-wear", label: "Work Wear", icon: "👔" },
    { id: "evening-wear", label: "Evening Wear", icon: "✨" },
  ], []);

  const seasonalTypes = React.useMemo(() => [
    { id: "", label: "All Seasons", color: "bg-gray-100" },
    { id: "Winter", label: "Winter", color: "bg-blue-100" },
    { id: "Spring", label: "Spring", color: "bg-green-100" },
    { id: "Summer", label: "Summer", color: "bg-yellow-100" },
    { id: "Autumn", label: "Autumn", color: "bg-orange-100" },
  ], []);

  const handleToggleFavorite = async (productId: Id<"products">) => {
    try {
      await toggleFavorite({ productId });
    } catch (error) {
      toast.error("Please log in to favorite products");
    }
  };

  const handleShareProduct = async (productId: Id<"products">, friendIds: Id<"users">[], message?: string) => {
    try {
      await shareProduct({ productId, friendIds, message });
      toast.success("Product shared successfully!");
      setShowShareModal(null);
    } catch (error) {
      toast.error("Failed to share product");
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPageState(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddSampleProducts = async () => {
    try {
      await insertSampleProducts({});
      toast.success("Sample products added successfully!");
    } catch (error) {
      toast.error("Failed to add sample products");
    }
  };

  const handleBackToAllProducts = () => {
    // Clear all filters and go back to browse mode
    setSelectedCategory("");
    setSelectedSeasonalType("");
    setSearchTerm("");
    setStrictFiltering(false);
    setCurrentPageState(1);
    setCurrentPage("browse");
  };

  // Show loading state only when we're actually loading
  const isLoading = favoritesOnly ? userFavorites === undefined : displayResult === undefined;
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {favoritesOnly ? "Your Favorites" : "Browse Products"}
          </h1>
          <p className="text-gray-600">Loading products...</p>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            {favoritesOnly ? "Your Favorites" : "Browse Products"}
          </h1>
          {favoritesOnly && (
            <button
              onClick={handleBackToAllProducts}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              ← Back to All Products
            </button>
          )}
        </div>
        <p className="text-gray-600">
          {favoritesOnly 
            ? "Your curated collection of favorite fashion items"
            : "Discover curated fashion items perfect for your style"
          }
          {userSeasonalType && (
            <span className="ml-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
              {userSeasonalType.seasonalType} Type
            </span>
          )}
        </p>
        {favoritesOnly && (
          <div className="mt-2 px-4 py-2 bg-pink-50 border border-pink-200 rounded-lg inline-block">
            <span className="text-pink-700 text-sm font-medium">
              ❤️ Showing only your favorite items
            </span>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder={favoritesOnly ? "Search your favorites..." : "Search products..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Category</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === category.id
                      ? "bg-purple-100 text-purple-700 border border-purple-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Seasonal Type Filter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">Seasonal Type</h3>
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={strictFiltering}
                  onChange={(e) => setStrictFiltering(e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-gray-600">Strict filtering</span>
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              {seasonalTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedSeasonalType(type.id)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    selectedSeasonalType === type.id
                      ? `${type.color} border-2 border-purple-300`
                      : `${type.color} hover:opacity-80`
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
            {strictFiltering && (
              <p className="text-xs text-gray-500 mt-1">
                Strict filtering shows only products specifically designed for the selected season
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Results Summary */}
      {pagination && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)} of{' '}
              {pagination.totalCount} {favoritesOnly ? "favorite " : ""}products
              {searchTerm && ` for "${searchTerm}"`}
            </p>
            <div className="text-sm text-gray-500">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.length > 0 ? (
          products.map((product) => {
            if (!product) return null;
            return (
              <ProductCard
                key={product._id}
                product={product}
                onToggleFavorite={() => handleToggleFavorite(product._id)}
                onShare={() => setShowShareModal(product._id)}
                onViewDetails={() => setShowProductModal(product._id)}
              />
            );
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-6xl mb-4">
              {favoritesOnly ? "❤️" : "🔍"}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {favoritesOnly ? "No favorites found" : "No products found"}
            </h3>
            <p className="text-gray-600 mb-4">
              {favoritesOnly 
                ? searchTerm || selectedCategory || selectedSeasonalType
                  ? "No favorites match your current filters. Try adjusting your search or filters."
                  : "You haven't favorited any products yet. Browse products and click the heart icon to add favorites!"
                : searchTerm 
                  ? "Try adjusting your filters or search terms to find more products." 
                  : "The catalog is empty. Add some sample products to get started!"
              }
            </p>
            {favoritesOnly ? (
              <button
                onClick={handleBackToAllProducts}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Browse All Products
              </button>
            ) : !searchTerm && (
              <div className="space-y-3">
                <button
                  onClick={handleAddSampleProducts}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mr-3"
                >
                  Add Sample Products
                </button>
                <button
                  onClick={() => setCurrentPage("admin")}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Go to Admin Panel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(1)}
                disabled={!pagination.hasPreviousPage}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                First
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPreviousPage}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
            </div>

            <div className="flex items-center space-x-2">
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.currentPage <= 3) {
                  pageNum = i + 1;
                } else if (pagination.currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      pageNum === pagination.currentPage
                        ? "bg-purple-600 text-white"
                        : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={!pagination.hasNextPage}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Last
              </button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Jump to page:{' '}
              <input
                type="number"
                min="1"
                max={pagination.totalPages}
                value={pagination.currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value);
                  if (page >= 1 && page <= pagination.totalPages) {
                    handlePageChange(page);
                  }
                }}
                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {' '}of {pagination.totalPages}
            </p>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {showProductModal && (
        <ProductDetailModal
          productId={showProductModal}
          onClose={() => setShowProductModal(null)}
          onToggleFavorite={() => handleToggleFavorite(showProductModal)}
          onShare={() => {
            setShowProductModal(null);
            setShowShareModal(showProductModal);
          }}
        />
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          productId={showShareModal}
          friends={friends || []}
          onShare={handleShareProduct}
          onClose={() => setShowShareModal(null)}
        />
      )}
    </div>
  );
}

function ProductCard({ product, onToggleFavorite, onShare, onViewDetails }: any) {
  // Early return if product is invalid
  if (!product || typeof product !== 'object' || !product._id) {
    return null;
  }

  const isFavorited = useQuery(api.products.isProductFavorited, { productId: product._id });

  const getSeasonalTypeColor = (type: string) => {
    const colors = {
      Winter: "bg-blue-100 text-blue-800",
      Spring: "bg-green-100 text-green-800",
      Summer: "bg-yellow-100 text-yellow-800",
      Autumn: "bg-orange-100 text-orange-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  // Safely process product arrays
  const colors = Array.isArray(product.colors) ? product.colors.filter((color: any) => color && typeof color === 'string') : [];
  const seasonalTypes = Array.isArray(product.seasonalTypes) ? product.seasonalTypes.filter((type: any) => type && typeof type === 'string') : [];
  const imageUrls = Array.isArray(product.imageUrls) ? product.imageUrls.filter((url: any) => url && typeof url === 'string') : [];

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Product Image - Clickable */}
      <div 
        className="relative h-64 bg-gray-100 cursor-pointer"
        onClick={onViewDetails}
      >
        {imageUrls.length > 0 ? (
          <img
            src={imageUrls[0]}
            alt={product.name || 'Product'}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
            <span className="text-4xl">👗</span>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isFavorited
                ? "bg-pink-100 text-pink-600"
                : "bg-white/80 text-gray-600 hover:bg-pink-100 hover:text-pink-600"
            }`}
          >
            {isFavorited ? "❤️" : "🤍"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare();
            }}
            className="w-8 h-8 rounded-full bg-white/80 text-gray-600 hover:bg-purple-100 hover:text-purple-600 flex items-center justify-center transition-colors"
          >
            📤
          </button>
        </div>

        {/* View Details Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 hover:opacity-100 transition-opacity duration-200">
            <span className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium shadow-lg">
              View Details
            </span>
          </div>
        </div>
      </div>

      {/* Product Info - Also clickable */}
      <div className="p-4 pb-6 cursor-pointer" onClick={onViewDetails}>
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-purple-600 transition-colors">
          {product.name || 'Unnamed Product'}
        </h3>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-purple-600">
            ${product.price || '0'}
          </span>
          <span className="text-sm text-gray-500">{product.retailer || 'Unknown'}</span>
        </div>

        {/* Colors */}
        {colors.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {colors.slice(0, 4).map((color: string, index: number) => (
              <span
                key={`${color}-${index}`}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
              >
                {color}
              </span>
            ))}
            {colors.length > 4 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                +{colors.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Seasonal Types */}
        {seasonalTypes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {seasonalTypes.map((type: string, index: number) => (
              <span
                key={`${type}-${index}`}
                className={`px-2 py-1 rounded text-xs ${getSeasonalTypeColor(type)}`}
              >
                {type}
              </span>
            ))}
          </div>
        )}

        {/* Shop Button */}
        <a
          href={product.amazonUrl || product.retailerUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-center block"
        >
          {product.amazonUrl ? 'Shop on Amazon' : 'Shop Now'}
        </a>
      </div>
    </div>
  );
}

function ProductDetailModal({ productId, onClose, onToggleFavorite, onShare }: any) {
  const product = useQuery(api.products.getProduct, { productId });
  const isFavorited = useQuery(api.products.isProductFavorited, { productId });

  if (!product) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  const getSeasonalTypeColor = (type: string) => {
    const colors = {
      Winter: "bg-blue-100 text-blue-800",
      Spring: "bg-green-100 text-green-800",
      Summer: "bg-yellow-100 text-yellow-800",
      Autumn: "bg-orange-100 text-orange-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const colors = Array.isArray(product.colors) ? product.colors.filter((color: any) => color && typeof color === 'string') : [];
  const seasonalTypes = Array.isArray(product.seasonalTypes) ? product.seasonalTypes.filter((type: any) => type && typeof type === 'string') : [];
  const imageUrls = Array.isArray(product.imageUrls) ? product.imageUrls.filter((url: any) => url && typeof url === 'string') : [];
  const sizes = Array.isArray(product.sizes) ? product.sizes.filter((size: any) => size && typeof size === 'string') : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex flex-1 min-h-0">
          {/* Image Section */}
          <div className="w-1/2 bg-gray-100">
            {imageUrls.length > 0 ? (
              <img
                src={imageUrls[0]}
                alt={product.name || 'Product'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span className="text-8xl">👗</span>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="w-1/2 flex flex-col">
            {/* Header */}
            <div className="p-6 pb-0 flex-shrink-0">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 pr-4">
                  {product.name || 'Unnamed Product'}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="px-6 flex-1 overflow-y-auto">
              <div className="space-y-4">
              {/* Price and Retailer */}
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-purple-600">
                  ${product.price || '0'}
                </span>
                <span className="text-gray-500">{product.retailer || 'Unknown'}</span>
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Colors */}
              {colors.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Available Colors</h3>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color: string, index: number) => (
                      <span
                        key={`${color}-${index}`}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {sizes.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Available Sizes</h3>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size: string, index: number) => (
                      <span
                        key={`${size}-${index}`}
                        className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Seasonal Types */}
              {seasonalTypes.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Seasonal Types</h3>
                  <div className="flex flex-wrap gap-2">
                    {seasonalTypes.map((type: string, index: number) => (
                      <span
                        key={`${type}-${index}`}
                        className={`px-3 py-1 rounded-full text-sm ${getSeasonalTypeColor(type)}`}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Category and Subcategory */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Category</h3>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm capitalize">
                    {product.category || 'Unknown'}
                  </span>
                  {product.subcategory && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm capitalize">
                      {product.subcategory}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 pb-4">
                <button
                  onClick={onToggleFavorite}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    isFavorited
                      ? "bg-pink-100 text-pink-700 hover:bg-pink-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {isFavorited ? "❤️ Favorited" : "🤍 Add to Favorites"}
                </button>
                <button
                  onClick={onShare}
                  className="flex-1 py-3 px-4 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-colors"
                >
                  📤 Share
                </button>
              </div>
              </div>
            </div>

            {/* Footer with Shop Button - Always Visible */}
            <div className="p-6 pt-4 flex-shrink-0 border-t border-gray-100">
              <a
                href={product.amazonUrl || product.retailerUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors text-center block font-medium"
              >
                {product.amazonUrl ? 'Shop on Amazon' : 'Shop Now'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShareModal({ productId, friends, onShare, onClose }: any) {
  const [selectedFriends, setSelectedFriends] = useState<Id<"users">[]>([]);
  const [message, setMessage] = useState("");

  const product = useQuery(api.products.getProduct, { productId });

  const handleFriendToggle = (friendId: Id<"users">) => {
    setSelectedFriends(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleShare = () => {
    if (selectedFriends.length === 0) {
      toast.error("Please select at least one friend");
      return;
    }
    onShare(productId, selectedFriends, message);
  };

  // Ensure friends is always a valid array
  const friendsList = Array.isArray(friends) ? friends.filter(friend => friend && typeof friend === 'object' && friend._id) : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Share Product</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          {product && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900">{product.name}</p>
              <p className="text-sm text-gray-600">${product.price} • {product.retailer}</p>
            </div>
          )}
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add a message (optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Check out this amazing product!"
                className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select friends to share with
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {friendsList.length > 0 ? (
                  friendsList.map((friend: any) => (
                    <label
                      key={friend._id}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFriends.includes(friend._id)}
                        onChange={() => handleFriendToggle(friend._id)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-semibold text-sm">
                          {friend.name?.[0] || "?"}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{friend.name}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No friends to share with. Add some friends first!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleShare}
              disabled={selectedFriends.length === 0}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Share ({selectedFriends.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
