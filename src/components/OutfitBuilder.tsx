import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";
import { WardrobeCapture } from "./WardrobeCapture";

interface OutfitBuilderProps {
  setCurrentPage: (page: string) => void;
}

// Product skeleton component for loading states
function ProductSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200"></div>
      <div className="p-3">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

// Outfit skeleton component for loading states
function OutfitSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
      <div className="h-5 bg-gray-200 rounded mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-3/4 mb-3"></div>
      <div className="flex items-center justify-between">
        <div className="h-3 bg-gray-200 rounded w-20"></div>
        <div className="h-3 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  );
}

export function OutfitBuilder({ setCurrentPage }: OutfitBuilderProps) {
  const [selectedItems, setSelectedItems] = useState<Record<string, any>>({});
  const [selectedWardrobeItems, setSelectedWardrobeItems] = useState<Record<string, any>>({});
  const [outfitName, setOutfitName] = useState("");
  const [outfitDescription, setOutfitDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [activeTab, setActiveTab] = useState<"builder" | "wardrobe" | "saved" | "calendar">("builder");
  const [showWardrobeCapture, setShowWardrobeCapture] = useState(false);
  const [activeBuilderTab, setActiveBuilderTab] = useState<"store" | "wardrobe">("store");
  
  // Product filtering state
  const [currentPage, setCurrentPageNum] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loadedProducts, setLoadedProducts] = useState<any[]>([]);
  
  // Calendar state
  const [selectedDateForAssignment, setSelectedDateForAssignment] = useState<string | null>(null);
  const [showOutfitSelector, setShowOutfitSelector] = useState(false);

  const userSeasonalType = useQuery(api.quiz.getUserSeasonalType);
  const userOutfits = useQuery(api.outfits.getUserOutfits);
  const userWardrobeItems = useQuery(api.wardrobe.getWardrobeItems, {});
  const createOutfit = useMutation(api.outfits.createOutfit);
  const deleteOutfit = useMutation(api.outfits.deleteOutfit);
  const deleteWardrobeItem = useMutation(api.wardrobe.deleteWardrobeItem);
  const updateWardrobeItem = useMutation(api.wardrobe.updateWardrobeItem);
  const scheduleOutfit = useMutation(api.outfits.scheduleOutfit);
  const removeScheduledOutfit = useMutation(api.outfits.removeScheduledOutfit);

  // Get the current week's dates
  const getWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const weekDates = getWeekDates();
  const startDate = weekDates[0].toISOString().split('T')[0];
  const endDate = weekDates[6].toISOString().split('T')[0];

  // Fetch scheduled outfits for the week
  const scheduledOutfits = useQuery(api.outfits.getScheduledOutfits, {
    startDate,
    endDate,
  });

  // Product query with pagination and filters
  const productsQuery = searchTerm 
    ? useQuery(api.products.searchProducts, {
        searchTerm,
        category: categoryFilter as any || undefined,
        seasonalType: userSeasonalType?.seasonalType,
        page: currentPage,
        pageSize: 30,
      })
    : useQuery(api.products.getProducts, {
        category: categoryFilter as any || undefined,
        seasonalType: userSeasonalType?.seasonalType,
        page: currentPage,
        pageSize: 30,
      });

  // Accumulate products when loading more
  useMemo(() => {
    if (productsQuery?.products) {
      if (currentPage === 1) {
        setLoadedProducts(productsQuery.products);
      } else {
        setLoadedProducts(prev => [...prev, ...productsQuery.products]);
      }
    }
  }, [productsQuery?.products, currentPage]);

  const pagination = productsQuery?.pagination;

  const categories = [
    { id: "tops", label: "Tops", icon: "👕" },
    { id: "bottoms", label: "Bottoms", icon: "👖" },
    { id: "dresses", label: "Dresses", icon: "👗" },
  ];

  const subcategories: Record<string, Array<{ id: string; label: string }>> = {
    tops: [
      { id: "sweaters", label: "Sweaters" },
      { id: "cardigans", label: "Cardigans" },
      { id: "blouses", label: "Blouses" },
      { id: "tanks", label: "Tank Tops" },
      { id: "jackets", label: "Jackets" },
      { id: "coats", label: "Coats" },
    ],
    bottoms: [
      { id: "pants", label: "Pants" },
      { id: "skirts", label: "Skirts" },
      { id: "shorts", label: "Shorts" },
    ],
    dresses: [
      { id: "casual", label: "Casual" },
      { id: "office-wear", label: "Office Wear" },
      { id: "evening-wear", label: "Evening Wear" },
    ],
  };

  // Filter products by subcategory
  const filteredProducts = useMemo(() => {
    if (!subcategoryFilter) return loadedProducts;
    return loadedProducts.filter((product: any) => {
      if (product.subcategory === subcategoryFilter) return true;
      if (product.tags?.includes(subcategoryFilter)) return true;
      return false;
    });
  }, [loadedProducts, subcategoryFilter]);

  const handleSelectItem = (category: string, product: any, isWardrobe: boolean = false) => {
    if (isWardrobe) {
      setSelectedWardrobeItems(prev => ({
        ...prev,
        [category]: product,
      }));
    } else {
      setSelectedItems(prev => ({
        ...prev,
        [category]: product,
      }));
    }
  };

  const handleRemoveItem = (category: string, isWardrobe: boolean = false) => {
    if (isWardrobe) {
      setSelectedWardrobeItems(prev => {
        const newItems = { ...prev };
        delete newItems[category];
        return newItems;
      });
    } else {
      setSelectedItems(prev => {
        const newItems = { ...prev };
        delete newItems[category];
        return newItems;
      });
    }
  };

  const handleSaveOutfit = async () => {
    if (!outfitName.trim()) {
      toast.error("Please enter an outfit name");
      return;
    }

    const totalItems = Object.keys(selectedItems).length + Object.keys(selectedWardrobeItems).length;
    if (totalItems === 0) {
      toast.error("Please select at least one item");
      return;
    }

    try {
      await createOutfit({
        name: outfitName,
        description: outfitDescription || undefined,
        productIds: Object.values(selectedItems).map((product: any) => product._id),
        wardrobeItemIds: Object.keys(selectedWardrobeItems).length > 0 
          ? Object.values(selectedWardrobeItems).map((item: any) => item._id)
          : undefined,
        isPublic,
      });

      toast.success("Outfit saved successfully!");
      setOutfitName("");
      setOutfitDescription("");
      setSelectedItems({});
      setSelectedWardrobeItems({});
      setActiveTab("saved");
    } catch (error) {
      toast.error("Failed to save outfit");
    }
  };

  const handleDeleteOutfit = async (outfitId: Id<"outfits">) => {
    if (!confirm("Are you sure you want to delete this outfit? This will also remove it from your calendar.")) {
      return;
    }

    try {
      await deleteOutfit({ outfitId });
      toast.success("Outfit deleted successfully");
    } catch (error) {
      toast.error("Failed to delete outfit");
    }
  };

  const handleAssignOutfit = (date: string) => {
    setSelectedDateForAssignment(date);
    setShowOutfitSelector(true);
  };

  const handleScheduleOutfit = async (outfitId: Id<"outfits">) => {
    if (!selectedDateForAssignment) return;

    try {
      await scheduleOutfit({
        outfitId,
        date: selectedDateForAssignment,
      });
      toast.success("Outfit scheduled successfully!");
      setShowOutfitSelector(false);
      setSelectedDateForAssignment(null);
    } catch (error) {
      toast.error("Failed to schedule outfit");
    }
  };

  const handleRemoveScheduledOutfit = async (date: string) => {
    try {
      await removeScheduledOutfit({ date });
      toast.success("Outfit removed from calendar");
    } catch (error) {
      toast.error("Failed to remove outfit");
    }
  };

  const handleClearFilters = () => {
    setCategoryFilter("");
    setSubcategoryFilter("");
    setSearchTerm("");
    setCurrentPageNum(1);
    setLoadedProducts([]);
  };

  const handleLoadMore = () => {
    if (pagination?.hasNextPage) {
      setCurrentPageNum(prev => prev + 1);
    }
  };

  if (!userSeasonalType) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Take Your Color Quiz First
          </h2>
          <p className="text-gray-600 mb-6">
            To build outfits with your perfect colors, please complete the color analysis quiz.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Outfit Builder</h1>
        <p className="text-gray-600">Create and save your perfect looks</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "builder", label: "Build Outfit", icon: "✨" },
              { id: "wardrobe", label: "My Wardrobe", icon: "👔" },
              { id: "saved", label: "Saved Outfits", icon: "💾" },
              { id: "calendar", label: "Weekly Calendar", icon: "📅" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "builder" && (
            <BuilderTabContent />
          )}

          {activeTab === "wardrobe" && (
            <WardrobeTabContent />
          )}

          {activeTab === "saved" && (
            <SavedTabContent />
          )}

          {activeTab === "calendar" && (
            <CalendarTabContent />
          )}
        </div>
      </div>
    </div>
  );

  // Builder Tab Component
  function BuilderTabContent() {
    return (
      <div className="space-y-6">
        {/* Selected Items Display */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Outfit</h3>
          <div className="grid grid-cols-3 gap-4">
            {categories.map((category) => {
              const selectedItem = selectedItems[category.id] || selectedWardrobeItems[category.id];
              const isWardrobe = !!selectedWardrobeItems[category.id];
              return (
              <div key={category.id} className="text-center">
                <div className="w-full h-32 bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center mb-2 transition-all hover:border-purple-400">
                  {selectedItem ? (
                    <div className="relative w-full h-full">
                      {selectedItem.imageUrls?.[0] || selectedItem.processedImageUrl ? (
                        <img
                          src={selectedItem.imageUrls?.[0] || selectedItem.processedImageUrl}
                          alt={selectedItem.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="text-2xl">{category.icon}</span>
                        </div>
                      )}
                      {isWardrobe && (
                        <div className="absolute top-1 left-1 bg-purple-600 text-white text-xs px-1 rounded">
                          My
                        </div>
                      )}
                      <button
                        onClick={() => handleRemoveItem(category.id, isWardrobe)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors shadow-lg"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      <div className="text-2xl mb-1">{category.icon}</div>
                      <div className="text-xs">Add {category.label}</div>
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-700">{category.label}</p>
              </div>
            );
            })}
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPageNum(1);
                  setLoadedProducts([]);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setSubcategoryFilter("");
                setCurrentPageNum(1);
                setLoadedProducts([]);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Subcategory Filter */}
            {categoryFilter && subcategories[categoryFilter] && (
              <select
                value={subcategoryFilter}
                onChange={(e) => {
                  setSubcategoryFilter(e.target.value);
                  setCurrentPageNum(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All {categoryFilter}</option>
                {subcategories[categoryFilter].map((subcat) => (
                  <option key={subcat.id} value={subcat.id}>
                    {subcat.label}
                  </option>
                ))}
              </select>
            )}

            {/* Clear Filters */}
            {(searchTerm || categoryFilter || subcategoryFilter) && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear Filters
              </button>
            )}

            {/* Results Count */}
            <div className="text-sm text-gray-600">
              {pagination && (
                <span>
                  Showing {loadedProducts.length} of {pagination.totalCount} items
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Toggle between Store and Wardrobe */}
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setActiveBuilderTab("store")}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              activeBuilderTab === "store"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            🏬 Store Products
          </button>
          <button
            onClick={() => setActiveBuilderTab("wardrobe")}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              activeBuilderTab === "wardrobe"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            👔 My Wardrobe
          </button>
        </div>

        {/* Product/Wardrobe Selection */}
        <div>
          {activeBuilderTab === "store" ? (
            <>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Choose Items from Store
            </h3>
          </div>
          
          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {productsQuery === undefined ? (
              // Loading skeletons
              Array.from({ length: 10 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product: any) => (
                <div 
                  key={product._id} 
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-48 bg-gray-100">
                    {product.imageUrls?.[0] ? (
                      <img
                        src={product.imageUrls[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-3xl">👗</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                      {product.name}
                    </h4>
                    <p className="text-purple-600 font-semibold text-sm mb-2">
                      ${product.price}
                    </p>
                    <button
                      onClick={() => handleSelectItem(product.category, product, false)}
                      className="w-full bg-purple-600 text-white py-2 px-3 rounded text-sm hover:bg-purple-700 transition-colors"
                    >
                      Add to Outfit
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No products found matching your filters</p>
              </div>
            )}
          </div>

          {/* Load More Button */}
          {pagination?.hasNextPage && (
            <div className="mt-6 text-center">
              <button
                onClick={handleLoadMore}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Load More Products
              </button>
            </div>
          )}
            </>
          ) : (
            // Wardrobe Items
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Choose Items from Your Wardrobe
                </h3>
              </div>
              
              {/* Wardrobe Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {userWardrobeItems === undefined ? (
                  // Loading skeletons
                  Array.from({ length: 10 }).map((_, i) => (
                    <ProductSkeleton key={i} />
                  ))
                ) : userWardrobeItems && userWardrobeItems.length > 0 ? (
                  userWardrobeItems.map((item: any) => (
                    <div 
                      key={item._id} 
                      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="h-48 bg-gray-100 relative">
                        {item.processedImageUrl ? (
                          <img
                            src={item.processedImageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span className="text-3xl">👗</span>
                          </div>
                        )}
                        <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                          My Item
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                          {item.name}
                        </h4>
                        {item.brand && (
                          <p className="text-gray-500 text-xs mb-2">{item.brand}</p>
                        )}
                        <button
                          onClick={() => handleSelectItem(item.category, item, true)}
                          className="w-full bg-purple-600 text-white py-2 px-3 rounded text-sm hover:bg-purple-700 transition-colors"
                        >
                          Add to Outfit
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-500 mb-4">No items in your wardrobe yet</p>
                    <button
                      onClick={() => setActiveTab("wardrobe")}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Add Items to Wardrobe
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Save Outfit Form */}
        {(Object.keys(selectedItems).length > 0 || Object.keys(selectedWardrobeItems).length > 0) && (
          <div className="bg-purple-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Save Your Outfit</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Outfit Name *
                </label>
                <input
                  type="text"
                  value={outfitName}
                  onChange={(e) => setOutfitName(e.target.value)}
                  placeholder="e.g., Office Meeting Look"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={outfitDescription}
                  onChange={(e) => setOutfitDescription(e.target.value)}
                  placeholder="Perfect for professional meetings..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
                  Make this outfit public (others can see and get inspired)
                </label>
              </div>
              <button
                onClick={handleSaveOutfit}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Save Outfit
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Wardrobe Tab Component
  function WardrobeTabContent() {
    const [editingItem, setEditingItem] = useState<any>(null);
    const [editName, setEditName] = useState("");
    const [editBrand, setEditBrand] = useState("");
    const [editNotes, setEditNotes] = useState("");

    const handleEditItem = (item: any) => {
      setEditingItem(item);
      setEditName(item.name);
      setEditBrand(item.brand || "");
      setEditNotes(item.notes || "");
    };

    const handleSaveEdit = async () => {
      if (!editingItem) return;

      try {
        await updateWardrobeItem({
          wardrobeItemId: editingItem._id,
          name: editName,
          brand: editBrand || undefined,
          notes: editNotes || undefined,
        });
        toast.success("Item updated successfully");
        setEditingItem(null);
      } catch (error) {
        toast.error("Failed to update item");
      }
    };

    const handleDeleteItem = async (itemId: Id<"wardrobeItems">) => {
      if (!confirm("Are you sure you want to delete this item from your wardrobe?")) {
        return;
      }

      try {
        await deleteWardrobeItem({ wardrobeItemId: itemId });
        toast.success("Item removed from wardrobe");
      } catch (error) {
        toast.error("Failed to delete item");
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Your Wardrobe</h3>
          <button
            onClick={() => setShowWardrobeCapture(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <span>📸</span>
            <span>Add Item</span>
          </button>
        </div>

        {userWardrobeItems === undefined ? (
          // Loading skeletons
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : userWardrobeItems && userWardrobeItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {userWardrobeItems.map((item: any) => (
              <div 
                key={item._id} 
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-48 bg-gray-100 relative">
                  {item.processedImageUrl ? (
                    <img
                      src={item.processedImageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-3xl">👗</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded">
                      {item.category}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                    {item.name}
                  </h4>
                  {item.brand && (
                    <p className="text-gray-500 text-xs mb-2">{item.brand}</p>
                  )}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditItem(item)}
                      className="flex-1 bg-gray-100 text-gray-700 py-1 px-2 rounded text-xs hover:bg-gray-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item._id)}
                      className="flex-1 bg-red-100 text-red-600 py-1 px-2 rounded text-xs hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">👔</div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No items in your wardrobe yet</h4>
            <p className="text-gray-600 mb-6">
              Add your own clothes to mix with store products
            </p>
            <button
              onClick={() => setShowWardrobeCapture(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Add Your First Item
            </button>
          </div>
        )}

        {/* Edit Modal */}
        {editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Edit Item</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand (optional)
                  </label>
                  <input
                    type="text"
                    value={editBrand}
                    onChange={(e) => setEditBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setEditingItem(null)}
                    className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wardrobe Capture Modal */}
        {showWardrobeCapture && (
          <WardrobeCapture 
            onItemAdded={() => {
              setShowWardrobeCapture(false);
              // Refetch will happen automatically
            }}
            onClose={() => setShowWardrobeCapture(false)}
          />
        )}
      </div>
    );
  }

  // Saved Tab Component
  function SavedTabContent() {
    return (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Saved Outfits</h3>
        {userOutfits === undefined ? (
          // Loading skeletons
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <OutfitSkeleton key={i} />
            ))}
          </div>
        ) : userOutfits && userOutfits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userOutfits.map((outfit: any) => (
              <div key={outfit._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Outfit Preview Images */}
                <div className="h-48 bg-gray-100 relative">
                  <div className="grid grid-cols-2 gap-1 h-full p-1">
                    {(outfit.allItems || outfit.products).slice(0, 4).map((item: any, idx: number) => (
                      <div key={idx} className="bg-white rounded overflow-hidden relative">
                        {item.imageUrls?.[0] || item.processedImageUrl ? (
                          <img
                            src={item.imageUrls?.[0] || item.processedImageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span className="text-xl">👗</span>
                          </div>
                        )}
                        {item.isWardrobeItem && (
                          <div className="absolute top-1 left-1 bg-purple-600 text-white text-xs px-1 rounded">
                            My
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{outfit.name}</h4>
                  {outfit.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{outfit.description}</p>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {(outfit.productIds?.length || 0) + (outfit.wardrobeItemIds?.length || 0)} items
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs ${outfit.isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {outfit.isPublic ? "Public" : "Private"}
                      </span>
                      <button
                        onClick={() => handleDeleteOutfit(outfit._id)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                        title="Delete outfit"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">👗</div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No saved outfits yet</h4>
            <p className="text-gray-600 mb-4">Start building your first outfit!</p>
            <button
              onClick={() => setActiveTab("builder")}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Build an Outfit
            </button>
          </div>
        )}
      </div>
    );
  }

  // Calendar Tab Component  
  function CalendarTabContent() {
    return (
      <div className="space-y-4">
        {/* Header with elegant gradient background */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-purple-700 to-pink-700 p-6 text-white">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-1">Your Week at a Glance</h3>
              <p className="text-white/90 text-sm">
                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className="text-right">
              <div className="text-white/90 text-xs uppercase tracking-wider font-medium">This Week</div>
              <div className="text-2xl font-bold">
                {scheduledOutfits?.length || 0}/7
              </div>
              <div className="text-white/90 text-xs">Outfits Planned</div>
            </div>
          </div>
        </div>

        {/* Compact Week View with improved design */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDates.map((date, index) => {
            const dateStr = date.toISOString().split('T')[0];
            const scheduledOutfit = scheduledOutfits?.find((so: any) => so.date === dateStr);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNumber = date.getDate();
            const isToday = new Date().toDateString() === date.toDateString();
            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
            
            return (
              <div 
                key={dateStr} 
                className={`
                  group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg
                  ${isToday 
                    ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg ring-2 ring-purple-300' 
                    : isPast
                    ? 'bg-gray-50 border border-gray-200'
                    : 'bg-white border border-gray-200 hover:border-purple-300'
                  }
                `}
              >
                {/* Day Header */}
                <div className={`p-3 pb-2 text-center ${isToday ? 'text-white' : isPast ? 'text-gray-400' : 'text-gray-700'}`}>
                  <div className="text-xs font-semibold uppercase tracking-wider mb-1">{dayName}</div>
                  <div className={`text-lg font-bold ${isToday ? 'text-white' : 'text-gray-900'}`}>
                    {dayNumber}
                  </div>
                  {isToday && (
                    <div className="absolute top-1 right-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
                
                {/* Outfit Content */}
                <div className="px-3 pb-3">
                  {scheduledOutfit ? (
                    <div className="space-y-2">
                      {/* Compact outfit preview */}
                      <div className="relative group/outfit">
                        <div className="h-20 bg-gray-100 rounded-lg overflow-hidden shadow-sm">
                          {scheduledOutfit.outfit.products[0]?.imageUrls?.[0] ? (
                            <img
                              src={scheduledOutfit.outfit.products[0].imageUrls[0]}
                              alt={scheduledOutfit.outfit.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover/outfit:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <span className="text-2xl">👗</span>
                            </div>
                          )}
                          {/* Overlay with outfit details */}
                          <div className="absolute inset-0 bg-black/0 group-hover/outfit:bg-black/40 transition-all duration-300 flex items-center justify-center">
                            <div className="text-white text-xs font-medium opacity-0 group-hover/outfit:opacity-100 transition-opacity duration-300 text-center px-2">
                              {scheduledOutfit.outfit.productIds?.length || 0} items
                            </div>
                          </div>
                        </div>
                        
                        {/* Outfit name */}
                        <div className={`text-xs font-medium mt-1 line-clamp-1 ${isToday ? 'text-white' : 'text-gray-700'}`}>
                          {scheduledOutfit.outfit.name}
                        </div>
                      </div>
                      
                      {/* Remove button */}
                      <button
                        onClick={() => handleRemoveScheduledOutfit(dateStr)}
                        className={`
                          w-full text-xs py-1.5 px-2 rounded-md font-medium transition-all duration-200 group-hover:scale-105
                          ${isToday 
                            ? 'bg-white/20 text-white hover:bg-white/30 border border-white/30' 
                            : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                          }
                        `}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Empty state with add button */}
                      <div className={`
                        h-20 rounded-lg border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group-hover:border-purple-400
                        ${isToday 
                          ? 'border-white/40 bg-white/10' 
                          : isPast
                          ? 'border-gray-200 bg-gray-50'
                          : 'border-gray-300 bg-gray-50 hover:bg-purple-50'
                        }
                      `}>
                        <div className={`text-2xl transition-transform duration-300 group-hover:scale-125 ${
                          isToday ? 'text-white/60' : isPast ? 'text-gray-300' : 'text-gray-400 group-hover:text-purple-500'
                        }`}>
                          +
                        </div>
                      </div>
                      
                      {/* Add outfit button */}
                      <button
                        onClick={() => handleAssignOutfit(dateStr)}
                        disabled={isPast}
                        className={`
                          w-full text-xs py-1.5 px-2 rounded-md font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                          ${isToday 
                            ? 'bg-white/20 text-white hover:bg-white/30 border border-white/30' 
                            : isPast
                            ? 'bg-gray-100 text-gray-400 border border-gray-200'
                            : 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 hover:from-purple-200 hover:to-pink-200 border border-purple-200 group-hover:scale-105'
                          }
                        `}
                      >
                        {isPast ? 'Past' : 'Add Outfit'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Weekly Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="text-2xl font-bold text-purple-700">{scheduledOutfits?.length || 0}</div>
            <div className="text-purple-600 text-sm font-medium">Outfits Planned</div>
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 border border-pink-200">
            <div className="text-2xl font-bold text-pink-700">{7 - (scheduledOutfits?.length || 0)}</div>
            <div className="text-pink-600 text-sm font-medium">Days to Plan</div>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
            <div className="text-2xl font-bold text-indigo-700">
              {scheduledOutfits?.reduce((total: number, outfit: any) => total + (outfit.outfit.productIds?.length || 0), 0) || 0}
            </div>
            <div className="text-indigo-600 text-sm font-medium">Total Items</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
            <div className="text-2xl font-bold text-emerald-700">
              {Math.round(((scheduledOutfits?.length || 0) / 7) * 100)}%
            </div>
            <div className="text-emerald-600 text-sm font-medium">Week Complete</div>
          </div>
        </div>

        {/* Enhanced Outfit Selector Modal */}
        {showOutfitSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              {/* Modal Header with gradient */}
              <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20"></div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-1">Choose an Outfit</h3>
                    <p className="text-white/90 text-sm">
                      for {selectedDateForAssignment && new Date(selectedDateForAssignment).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowOutfitSelector(false);
                      setSelectedDateForAssignment(null);
                    }}
                    className="text-white bg-gray-900/30 hover:bg-gray-900/50 rounded-full p-2 transition-all duration-200 backdrop-blur-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
                {userOutfits && userOutfits.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {userOutfits.map((outfit: any, index: number) => (
                      <button
                        key={outfit._id}
                        onClick={() => handleScheduleOutfit(outfit._id)}
                        className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-purple-300 hover:shadow-lg transition-all duration-300 text-left transform hover:scale-105"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {/* Outfit Preview */}
                        <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                          {outfit.products[0]?.imageUrls?.[0] ? (
                            <img
                              src={outfit.products[0].imageUrls[0]}
                              alt={outfit.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <span className="text-4xl">👗</span>
                            </div>
                          )}
                          
                          {/* Overlay with quick info */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-2 left-2 right-2">
                              <div className="text-white text-xs font-medium">
                                {(outfit.productIds?.length || 0) + (outfit.wardrobeItemIds?.length || 0)} items
                              </div>
                              {outfit.isPublic && (
                                <div className="text-green-300 text-xs">Public</div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Outfit Details */}
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-purple-700 transition-colors">
                            {outfit.name}
                          </h4>
                          {outfit.description && (
                            <p className="text-xs text-gray-500 line-clamp-1 mb-2">
                              {outfit.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {(outfit.productIds?.length || 0) + (outfit.wardrobeItemIds?.length || 0)} items
                            </span>
                            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                      <span className="text-4xl">👗</span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No outfits available</h4>
                    <p className="text-gray-500 mb-6">Create some outfits first to schedule them!</p>
                    <button
                      onClick={() => {
                        setShowOutfitSelector(false);
                        setActiveTab("builder");
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Build Your First Outfit
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
