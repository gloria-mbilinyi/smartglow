import { useState, useMemo, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategoryNav } from './components/CategoryNav';
import { FilterBar } from './components/FilterBar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { MOCK_PRODUCTS } from './data/mockProducts';
import { Product, ProductCategory, CartItem, FilterState } from './types/store';
import { Sparkles, RotateCcw } from 'lucide-react';

export default function App() {
  // Storefront Filtering State
  const [filterState, setFilterState] = useState<FilterState>({
    category: 'All',
    skinType: 'All',
    skinConcern: 'All',
    searchQuery: '',
    sortBy: 'featured',
  });

  // Selected Product for PDP Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Cart State with LocalStorage Persistence
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('smartglow_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Reference for scrolling down to catalog
  const catalogRef = useRef<HTMLDivElement>(null);

  // Save cart changes
  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    try {
      localStorage.setItem('smartglow_cart', JSON.stringify(items));
    } catch {
      // Storage error fallback
    }
  };

  const handleAddToCart = (product: Product, quantity = 1) => {
    const existingIndex = cartItems.findIndex((item) => item.product.id === product.id);
    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity = Math.min(
        product.stockCount,
        updated[existingIndex].quantity + quantity
      );
      saveCart(updated);
    } else {
      saveCart([...cartItems, { product, quantity }]);
    }
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
    } else {
      const updated = cartItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
      saveCart(updated);
    }
  };

  const handleRemoveCartItem = (productId: string) => {
    const updated = cartItems.filter((item) => item.product.id !== productId);
    saveCart(updated);
  };

  const handleClearCart = () => {
    saveCart([]);
  };

  // Filter Updates
  const updateFilter = (updates: Partial<FilterState>) => {
    setFilterState((prev) => ({ ...prev, ...updates }));
  };

  const resetFilters = () => {
    setFilterState({
      category: 'All',
      skinType: 'All',
      skinConcern: 'All',
      searchQuery: '',
      sortBy: 'featured',
    });
  };

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Filtered & Sorted Products Memo
  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((product) => {
      // Category filter
      if (filterState.category !== 'All' && product.category !== filterState.category) {
        return false;
      }

      // Skin Type filter
      if (filterState.skinType !== 'All') {
        const matchesType =
          product.skinTypes.includes('All') || product.skinTypes.includes(filterState.skinType);
        if (!matchesType) return false;
      }

      // Skin Concern filter
      if (filterState.skinConcern !== 'All') {
        const matchesConcern =
          product.skinConcerns.includes('All') ||
          product.skinConcerns.includes(filterState.skinConcern);
        if (!matchesConcern) return false;
      }

      // Search Query filter
      if (filterState.searchQuery.trim() !== '') {
        const query = filterState.searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesSub = product.subtitle.toLowerCase().includes(query);
        const matchesIngredients = product.keyIngredients.some((i) =>
          i.toLowerCase().includes(query)
        );
        const matchesDesc = product.description.toLowerCase().includes(query);
        if (!matchesName && !matchesSub && !matchesIngredients && !matchesDesc) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (filterState.sortBy === 'price-asc') return a.price - b.price;
      if (filterState.sortBy === 'price-desc') return b.price - a.price;
      if (filterState.sortBy === 'rating') return b.rating - a.rating;
      return 0; // 'featured' retains original catalogue order
    });
  }, [filterState]);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900 flex flex-col font-sans selection:bg-stone-900 selection:text-white">
      {/* Navigation */}
      <Navbar
        activeCategory={filterState.category}
        onSelectCategory={(cat: ProductCategory) => {
          updateFilter({ category: cat });
          scrollToCatalog();
        }}
        cartItemCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={filterState.searchQuery}
        onSearchChange={(q) => updateFilter({ searchQuery: q })}
      />

      {/* Hero Section */}
      <Hero
        onShopClick={scrollToCatalog}
        onExploreConcerns={() => {
          updateFilter({ skinConcern: 'Dullness' });
          scrollToCatalog();
        }}
      />

      {/* Catalog Area Anchor */}
      <div ref={catalogRef} />

      {/* Category Navigation Bar */}
      <CategoryNav
        activeCategory={filterState.category}
        onSelectCategory={(cat) => updateFilter({ category: cat })}
        products={MOCK_PRODUCTS}
      />

      {/* Filter and Search Bar */}
      <FilterBar
        filterState={filterState}
        onChangeFilter={updateFilter}
        onResetFilters={resetFilters}
        totalResults={filteredProducts.length}
      />

      {/* Product Grid Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {filteredProducts.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center space-y-4 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="font-display text-xl font-semibold text-stone-800">
              No matching formulations found
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              We couldn't find any products matching your current filters. Try selecting "All" or resetting your search parameters.
            </p>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-stone-50 text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          /* 3-Column Desktop / 2-Column Tablet / 1-Column Mobile Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={(p) => handleAddToCart(p, 1)}
                onSelectProduct={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p, qty) => {
          handleAddToCart(p, qty);
          setIsCartOpen(true);
        }}
      />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
      />

      {/* Footer */}
      <Footer onSelectCategory={(cat) => updateFilter({ category: cat })} />
    </div>
  );
}
