import React from 'react';
import { ProductCategory, Product } from '../types/store';

interface CategoryNavProps {
  activeCategory: ProductCategory;
  onSelectCategory: (category: ProductCategory) => void;
  products: Product[];
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  activeCategory,
  onSelectCategory,
  products,
}) => {
  const categories: { label: ProductCategory; count: number }[] = [
    { label: 'All', count: products.length },
    { label: 'Skincare', count: products.filter((p) => p.category === 'Skincare').length },
    { label: 'Serums', count: products.filter((p) => p.category === 'Serums').length },
    { label: 'Cleansers', count: products.filter((p) => p.category === 'Cleansers').length },
    { label: 'Sun Care', count: products.filter((p) => p.category === 'Sun Care').length },
    { label: 'Makeup', count: products.filter((p) => p.category === 'Makeup').length },
  ];

  return (
    <div className="border-b border-stone-200/80 bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => onSelectCategory(cat.label)}
                className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-stone-400 ${
                  isActive
                    ? 'bg-stone-900 text-stone-50 shadow-xs'
                    : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100/80'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[11px] font-mono-num px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-stone-800 text-stone-300' : 'bg-stone-200/70 text-stone-600'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
