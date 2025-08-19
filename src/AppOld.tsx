import React, { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Dashboard } from "./components/Dashboard";
import { QuizPage } from "./components/QuizPage";
import { ProductBrowser } from "./components/ProductBrowser";
import { OutfitBuilder } from "./components/OutfitBuilder";
import { SocialHub } from "./components/SocialHub";
import { UserProfile } from "./components/UserProfile";
import { AdminPanel } from "./components/AdminPanel";
import { ColorPaletteReference } from "./components/ColorPaletteReference";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { PWAFeatures } from "./components/PWAFeatures";
import { Toaster } from "sonner";

export default function App() {
  const user = useQuery(api.auth.loggedInUser);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check for favorites-only mode when navigating to browse page
  useEffect(() => {
    if (currentPage === "browse") {
      const shouldShowFavoritesOnly = localStorage.getItem('viewFavoritesOnly') === 'true';
      setFavoritesOnly(shouldShowFavoritesOnly);
      
      // Clear the flag after using it
      if (shouldShowFavoritesOnly) {
        localStorage.removeItem('viewFavoritesOnly');
      }
    } else {
      setFavoritesOnly(false);
    }
  }, [currentPage]);

  const handlePageChange = (page: string) => {
    // Prevent non-admin users from accessing admin page
    if (page === "admin" && !user?.isAdmin) {
      return;
    }
    setCurrentPage(page);
    setIsMobileMenuOpen(false); // Close mobile menu when navigating
    // Reset favorites-only mode when changing pages
    if (page !== "browse") {
      setFavoritesOnly(false);
    }
  };

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (user === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <PWAInstallPrompt />
        <OfflineIndicator />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">StyleSeason</h1>
              <p className="text-gray-600">Discover your perfect seasonal colors and style</p>
            </div>
            <SignInForm />
          </div>
        </div>
        <Toaster position="top-center" />
      </div>
    );
  }

  // Build navigation items - only include Admin for admin users
  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "quiz", label: "Color Quiz", icon: "🎨" },
    { id: "browse", label: "Browse", icon: "🛍️" },
    { id: "outfits", label: "Outfits", icon: "👗" },
    { id: "social", label: "Social", icon: "👥" },
    { id: "colors", label: "Colors", icon: "🌈" },
    { id: "profile", label: "Profile", icon: "👤" },
    ...(user?.isAdmin ? [{ id: "admin", label: "Admin", icon: "⚙️" }] : []),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <PWAInstallPrompt />
      <OfflineIndicator />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-purple-600 hover:bg-gray-100"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-purple-600">StyleSeason</h1>
              {favoritesOnly && (
                <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
                  ❤️ Favorites Only
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden sm:flex sm:items-center">
                Welcome, {user.name || user.email || "User"}!
                {user?.isAdmin && (
                  <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    Admin
                  </span>
                )}
              </span>
              <SignOutButton />
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:block border-t border-gray-200">
          <div className="container mx-auto px-4">
            <nav className="flex space-x-8">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handlePageChange(item.id)}
                  className={`flex items-center space-x-2 px-3 py-4 border-b-2 font-medium text-sm transition-colors ${
                    currentPage === item.id
                      ? "border-purple-500 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <>
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="md:hidden bg-white border-b border-gray-200 shadow-lg relative z-50">
            <div className="px-4 py-2 space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handlePageChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    currentPage === item.id
                      ? "bg-purple-100 text-purple-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {currentPage === "dashboard" && <Dashboard setCurrentPage={handlePageChange} />}
          {currentPage === "quiz" && <QuizPage setCurrentPage={handlePageChange} />}
          {currentPage === "browse" && (
            <ProductBrowser 
              setCurrentPage={handlePageChange} 
              favoritesOnly={favoritesOnly}
            />
          )}
          {currentPage === "outfits" && <OutfitBuilder setCurrentPage={handlePageChange} />}
          {currentPage === "social" && <SocialHub setCurrentPage={handlePageChange} />}
          {currentPage === "profile" && <UserProfile setCurrentPage={handlePageChange} />}
          {currentPage === "admin" && user?.isAdmin && <AdminPanel setCurrentPage={handlePageChange} />}
          {currentPage === "admin" && !user?.isAdmin && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-700 mb-4">Access Denied</h2>
              <p className="text-gray-600">You do not have permission to access this page.</p>
              <button
                onClick={() => handlePageChange("dashboard")}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Return to Dashboard
              </button>
            </div>
          )}
          {currentPage === "colors" && <ColorPaletteReference setCurrentPage={handlePageChange} />}
        </div>
      </main>

      <Toaster position="top-center" />
    </div>
  );
}