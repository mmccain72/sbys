import { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { PWAFeatures } from "./PWAFeatures";

interface AdminPanelProps {
  setCurrentPage: (page: string) => void;
}

export function AdminPanel({ setCurrentPage }: AdminPanelProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  
  const triggerImport = useAction(api.woocommerce.triggerImport);
  const testFetchProduct = useAction(api.woocommerce.testFetchProduct);
  const listProducts = useAction(api.woocommerce.listProducts);
  const debugAmazonUrls = useAction(api.woocommerce.debugAmazonUrls);
  const insertSampleProducts = useMutation(api.products.insertSampleProducts);
  const clearAllProducts = useMutation(api.products.clearAllProducts);
  const productCount = useQuery(api.products.countProducts);
  const productsWithAmazonUrls = useQuery(api.products.getProductsWithAmazonUrls, { limit: 5 });
  const insertBulkProducts = useMutation(api.bulkImport.insertBulkProducts);
  const insertDiverseProducts = useMutation(api.bulkImport.insertDiverseProducts);
  const getProductStats = useQuery(api.bulkImport.getProductStats);
  
  // Social sample data functions
  const createSampleFriends = useMutation(api.social.createSampleFriends);
  const createSamplePosts = useMutation(api.social.createSamplePosts);
  const createSampleMessages = useMutation(api.social.createSampleMessages);

  const handleImportProducts = async () => {
    setIsImporting(true);
    setImportResult(null);
    
    try {
      const result = await triggerImport({});
      setImportResult(result);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to import products");
      setImportResult({
        success: false,
        message: `Error: ${error}`,
        totalImported: 0,
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleInsertSampleProducts = async () => {
    setIsImporting(true);
    setImportResult(null);
    
    try {
      const result = await insertSampleProducts({});
      setImportResult({
        success: true,
        message: result,
        totalImported: 3,
      });
      toast.success("Sample products added!");
    } catch (error) {
      toast.error("Failed to add sample products");
      setImportResult({
        success: false,
        message: `Error: ${error}`,
        totalImported: 0,
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearProducts = async () => {
    const currentCount = productCount?.total || 0;
    if (!confirm(`Are you sure you want to clear ALL ${currentCount} products from the database? This cannot be undone.`)) {
      return;
    }
    
    setIsImporting(true);
    setImportResult(null);
    
    try {
      const result = await clearAllProducts({});
      setImportResult({
        success: true,
        message: result,
        totalImported: 0,
      });
      toast.success("All products cleared!");
    } catch (error) {
      console.error("Clear products error:", error);
      toast.error("Failed to clear products");
      setImportResult({
        success: false,
        message: `Error: ${error}`,
        totalImported: 0,
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleTestProduct = async () => {
    try {
      // First get the list to find a valid ID
      const productList = await listProducts({});
      if (productList.length > 0) {
        const firstProduct = productList[0];
        const result = await testFetchProduct({ productId: firstProduct.id });
        console.log("Test product result:", result);
        toast.success("Check console for product meta data");
        setImportResult({
          success: true,
          message: `Test product: ${result.name}`,
          totalImported: 0,
        });
      } else {
        toast.error("No products found to test");
      }
    } catch (error) {
      console.error("Test product error:", error);
      toast.error("Failed to test product");
    }
  };

  const handleDebugAmazonUrls = async () => {
    try {
      const result = await debugAmazonUrls({ productId: 1234 });
      console.log("Amazon URL debug result:", result);
      toast.success("Check console for Amazon URL debug info");
    } catch (error) {
      console.error("Debug Amazon URLs error:", error);
      toast.error("Failed to debug Amazon URLs");
    }
  };

  const handleInsertDiverseProducts = async (count: number) => {
    setIsImporting(true);
    setImportResult(null);
    
    try {
      const result = await insertDiverseProducts({ count });
      setImportResult({
        success: true,
        message: result,
        totalImported: count,
      });
      toast.success(`${count} diverse products added!`);
    } catch (error) {
      toast.error("Failed to add diverse products");
      setImportResult({
        success: false,
        message: `Error: ${error}`,
        totalImported: 0,
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleCreateSampleFriends = async () => {
    try {
      const result = await createSampleFriends({});
      toast.success(result);
    } catch (error) {
      toast.error("Failed to create sample friends");
    }
  };

  const handleCreateSamplePosts = async () => {
    try {
      const result = await createSamplePosts({});
      toast.success(result);
    } catch (error) {
      toast.error("Failed to create sample posts");
    }
  };

  const handleCreateSampleMessages = async () => {
    try {
      const result = await createSampleMessages({});
      toast.success(result);
    } catch (error) {
      toast.error("Failed to create sample messages");
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
        <p className="text-gray-600">Manage products and import data</p>
      </div>

      {/* Social Testing Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Social Features Testing</h2>
        </div>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Create Sample Friends & Content</h3>
            <p className="text-blue-700 text-sm mb-4">
              Create sample friends, posts, and messages to test the social features.
            </p>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleCreateSampleFriends}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Create Sample Friends
              </button>
              <button
                onClick={handleCreateSamplePosts}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                Create Sample Posts
              </button>
              <button
                onClick={handleCreateSampleMessages}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
              >
                Create Sample Messages
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Product Import</h2>
          {productCount && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">{productCount.total}</span> products total 
              ({productCount.active} active, {productCount.inactive} inactive, {productCount.withAmazonUrls} with Amazon URLs)
            </div>
          )}
        </div>

        {/* Amazon URL Status */}
        {productsWithAmazonUrls && productsWithAmazonUrls.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-900 mb-2">Products with Amazon URLs ({productsWithAmazonUrls.length})</h3>
            <div className="space-y-1">
              {productsWithAmazonUrls.slice(0, 2).map((product) => (
                <p key={product.id} className="text-sm text-green-700">• {product.name}</p>
              ))}
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Import from ShopYourShade</h3>
            <p className="text-blue-700 text-sm mb-4">
              This will fetch products from shopyourshade.com and add them to your catalog.
              Products will be automatically categorized and assigned to seasonal types based on their colors.
            </p>
            
            <button
              onClick={handleImportProducts}
              disabled={isImporting}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isImporting
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isImporting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Importing Products...</span>
                </div>
              ) : (
                "Import ShopYourShade Products"
              )}
            </button>
            
            <button
              onClick={handleTestProduct}
              className="ml-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
            >
              Test Product Meta Data
            </button>
            <button
              onClick={handleDebugAmazonUrls}
              className="ml-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
            >
              Debug Amazon URLs
            </button>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-900 mb-2">Add Sample Products</h3>
            <p className="text-green-700 text-sm mb-4">
              Add 3 sample products to test the app.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleInsertSampleProducts}
                disabled={isImporting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 text-sm"
              >
                Add 3 Samples
              </button>
              <button
                onClick={() => handleInsertDiverseProducts(100)}
                disabled={isImporting}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 text-sm"
              >
                Add 100 Products
              </button>
              <button
                onClick={() => handleInsertDiverseProducts(450)}
                disabled={isImporting}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 text-sm"
              >
                Add 450 Products
              </button>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-medium text-red-900 mb-2">Clear All Products</h3>
            <p className="text-red-700 text-sm mb-4">
              Remove all products from the database. Use this before importing with new category structure.
            </p>
            <button
              onClick={handleClearProducts}
              disabled={isImporting}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300"
            >
              Clear All Products
            </button>
          </div>

          {importResult && (
            <div className={`border rounded-lg p-4 ${
              importResult.success 
                ? "bg-green-50 border-green-200" 
                : "bg-red-50 border-red-200"
            }`}>
              <h4 className={`font-medium mb-2 ${
                importResult.success ? "text-green-900" : "text-red-900"
              }`}>
                Import Result
              </h4>
              <p className={`text-sm ${
                importResult.success ? "text-green-700" : "text-red-700"
              }`}>
                {importResult.message}
              </p>
              {importResult.totalImported > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  Total products imported: {importResult.totalImported}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Import Instructions</h2>
        
        <div className="space-y-4 text-sm text-gray-600">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">How the import works:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Fetches products from the WooCommerce REST API</li>
              <li>Maps product categories to our app categories (tops, bottoms, dresses, shoes, accessories)</li>
              <li>Extracts colors from product attributes and descriptions</li>
              <li>Assigns seasonal types based on color analysis</li>
              <li>Skips products that already exist in the database</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Category Mapping:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Tops:</strong> blouses, shirts, sweaters, tops</li>
              <li><strong>Bottoms:</strong> pants, jeans, skirts, bottoms</li>
              <li><strong>Dresses:</strong> dresses</li>
              <li><strong>Shoes:</strong> shoes, boots, sandals</li>
              <li><strong>Accessories:</strong> jewelry, bags, scarves, accessories</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Seasonal Type Assignment:</h3>
            <p>Products are automatically assigned to seasonal types based on their colors:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li><strong>Winter:</strong> black, white, navy, jewel tones</li>
              <li><strong>Spring:</strong> coral, peach, golden yellow, bright colors</li>
              <li><strong>Summer:</strong> powder blue, lavender, soft muted colors</li>
              <li><strong>Autumn:</strong> rust, olive, golden brown, earthy colors</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Social Testing:</h3>
            <p>Use the social testing buttons to:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li><strong>Create Sample Friends:</strong> Adds 4 sample users and creates friendships</li>
              <li><strong>Create Sample Posts:</strong> Adds posts from friends to test the feed</li>
              <li><strong>Create Sample Messages:</strong> Adds a conversation with your first friend</li>
            </ul>
          </div>
        </div>
      </div>

      {/* PWA Features - Only shown on admin page */}
      <PWAFeatures />
    </div>
  );
}
