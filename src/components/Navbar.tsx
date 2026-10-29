import React, { useState } from 'react';
import { ShoppingBag, Search, X, Menu, User, Warehouse, Sparkles } from 'lucide-react';
import { ProductCategory } from '../types/store';
import { UserProfile } from '../services/api';

interface NavbarProps {
  activeCategory: ProductCategory;
  onSelectCategory: (category: ProductCategory) => void;
  cartItemCount: number;
  onOpenCart: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentUser: UserProfile | null;
  onOpenAccount: () => void;
  onOpenAdminWarehouse?: () => void;
  onOpenSkinAnalysis: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeCategory,
  onSelectCategory,
  cartItemCount,
  onOpenCart,
  searchQuery,
  onSearchChange,
  currentUser,
  onOpenAccount,
  onOpenAdminWarehouse,
  onOpenSkinAnalysis,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const categories: ProductCategory[] = ['All', 'Skincare', 'Serums', 'Cleansers', 'Sun Care', 'Makeup'];

  return (
    <header className="sticky top-0 z-40 bg-[#faf9f6]/90 backdrop-blur-md border-b border-stone-200/80 transition-all">
      {/* Top Announcement Bar */}
      <div className="bg-stone-900 text-stone-200 text-xs py-1.5 px-4 text-center font-medium tracking-wide">
        <span>Complimentary Standard Delivery on orders over $60 &middot; AI-Guided Skincare Science</span>
      </div>

      {/* Main Top Bar (Strict 3-Zone Contract) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectCategory('All')}
            className="text-left group cursor-pointer focus:outline-none"
            aria-label="SmartGlow Home"
          >
            <span className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900 group-hover:text-stone-700 transition-colors">
              SmartGlow
            </span>
          </button>
        </div>

        {/* Zone 2: Clean Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-stone-600">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`cursor-pointer whitespace-nowrap transition-colors relative py-1 hover:text-stone-900 ${
                activeCategory === cat ? 'text-stone-950 font-semibold' : ''
              }`}
            >
              {cat}
              {activeCategory === cat && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900 rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Zone 3: Actions (Search, Cart & Mobile Toggle) */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Search Toggle */}
          <div className="relative">
            {isSearchOpen ? (
              <div className="flex items-center bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 shadow-xs w-48 sm:w-64 transition-all">
                <Search className="w-4 h-4 text-stone-400 shrink-0 mr-2" />
                <input
                  type="text"
                  placeholder="Search products or ingredients..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  autoFocus
                  className="w-full text-xs text-stone-800 bg-transparent focus:outline-none"
                />
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    onSearchChange('');
                  }}
                  className="text-stone-400 hover:text-stone-700 cursor-pointer ml-1"
                  aria-label="Close search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Open search bar"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* AI Skin Analysis Button */}
          <button
            onClick={onOpenSkinAnalysis}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-900 bg-amber-50/80 hover:bg-amber-100/90 border border-amber-300/80 rounded-lg transition-all cursor-pointer shadow-xs"
            title="Launch AI Skin Analysis"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="hidden sm:inline">AI Skin Analysis</span>
          </button>

          {/* Admin Warehouse Button (Visible only to Admin) */}
          {currentUser?.role === 'admin' && onOpenAdminWarehouse && (
            <button
              onClick={onOpenAdminWarehouse}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-all cursor-pointer shadow-xs"
              title="Warehouse Inventory Control"
            >
              <Warehouse className="w-3.5 h-3.5 text-amber-800" />
              <span>Warehouse</span>
            </button>
          )}

          {/* Customer Account Button */}
          <button
            onClick={onOpenAccount}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-800 bg-white hover:bg-stone-100 border border-stone-300/80 rounded-lg transition-all cursor-pointer shadow-xs"
            aria-label={currentUser ? `Account for ${currentUser.fullName}` : 'Sign in to your account'}
          >
            <User className="w-3.5 h-3.5 text-stone-700" />
            <span className="hidden sm:inline font-medium">
              {currentUser ? currentUser.fullName.split(' ')[0] : 'Sign In'}
            </span>
          </button>

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-stone-900 bg-stone-100/90 hover:bg-stone-200/90 border border-stone-300/80 rounded-lg transition-all cursor-pointer shadow-xs focus:ring-2 focus:ring-stone-400 focus:outline-none"
            aria-label={`Shopping bag containing ${cartItemCount} items`}
          >
            <ShoppingBag className="w-4 h-4 text-stone-800" />
            <span className="hidden sm:inline text-xs font-medium uppercase tracking-wider">Bag</span>
            <span className="font-mono-num text-xs bg-stone-900 text-stone-50 px-2 py-0.5 rounded-full font-semibold">
              {cartItemCount}
            </span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-stone-700 hover:text-stone-950 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-[#faf9f6] px-4 py-4 space-y-3">
          <div className="space-y-2 pb-2 border-b border-stone-200">
            <button
              onClick={() => {
                onOpenSkinAnalysis();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-amber-50 border border-amber-300 rounded-lg text-xs font-semibold text-amber-950 shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Launch AI Skin Analysis</span>
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onOpenAccount();
                  setIsMobileMenuOpen(false);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-white border border-stone-300 rounded-lg text-xs font-medium text-stone-800"
              >
                <User className="w-4 h-4 text-stone-700" />
                <span>{currentUser ? currentUser.fullName : 'Account / Sign In'}</span>
              </button>
              {currentUser?.role === 'admin' && onOpenAdminWarehouse && (
                <button
                  onClick={() => {
                    onOpenAdminWarehouse();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-amber-50 border border-amber-300 rounded-lg text-xs font-semibold text-amber-900"
                >
                  <Warehouse className="w-4 h-4 text-amber-800" />
                  <span>Warehouse</span>
                </button>
              )}
            </div>
          </div>

          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2 px-2">
            Categories
          </div>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                onSelectCategory(cat);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeCategory === cat
                  ? 'bg-stone-900 text-stone-50 font-semibold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
