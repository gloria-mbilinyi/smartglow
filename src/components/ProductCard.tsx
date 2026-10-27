import React, { useState } from 'react';
import { Star, Plus, Check } from 'lucide-react';
import { Product } from '../types/store';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onSelectProduct,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <article
      onClick={() => onSelectProduct(product)}
      className="group relative flex flex-col bg-white rounded-xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      {/* Product Image Stage (4:3 Aspect Ratio) */}
      <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden">
        {/* Subtle Tag */}
        {product.tag && (
          <div className="absolute top-3 left-3 z-10 text-[11px] font-medium tracking-wider uppercase px-2.5 py-0.5 bg-stone-900/80 backdrop-blur-xs text-white rounded-md shadow-xs">
            {product.tag}
          </div>
        )}

        <img
          src={product.imageUrl}
          alt={product.name}
          referrerPolicy="no-referrer"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* CSS Fallback Container if loading or failed */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-100 text-stone-400">
            <span className="font-display text-sm tracking-wider text-stone-500 font-medium">SmartGlow</span>
          </div>
        )}

        {/* Quick Add Overlay on Desktop Hover */}
        <div className="absolute inset-x-3 bottom-3 z-10 hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleQuickAdd}
            className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ${
              justAdded
                ? 'bg-emerald-800 text-white'
                : 'bg-white/95 backdrop-blur-xs text-stone-900 hover:bg-stone-900 hover:text-white border border-stone-200'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added to Bag</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Quick Add</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Card Content & Details */}
      <div className="flex flex-col flex-1 p-4 sm:p-5 justify-between">
        <div className="space-y-2">
          {/* Metadata Row: Category & Rating */}
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="uppercase tracking-wider font-semibold text-[11px] text-stone-600">
              {product.category}
            </span>
            <div className="flex items-center gap-1 font-mono-num text-[12px] text-stone-700">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-stone-400">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="font-display text-base font-semibold text-stone-900 group-hover:text-stone-700 transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Subtitle / Key Claim */}
          <p className="text-xs text-stone-500 line-clamp-1">{product.subtitle}</p>

          {/* Ingredient Highlights */}
          <div className="pt-1 text-[11px] text-stone-500 line-clamp-1">
            <span className="text-stone-400 font-medium">Actives: </span>
            <span>{product.keyIngredients.slice(0, 2).join(' · ')}</span>
          </div>

          {/* Target Skin Types */}
          <div className="text-[11px] text-stone-600 flex items-center gap-1.5 pt-0.5">
            <span className="text-stone-400">For:</span>
            <span className="font-medium text-stone-800">
              {product.skinTypes.includes('All')
                ? 'All skin types'
                : product.skinTypes.slice(0, 2).join(', ')}
            </span>
          </div>
        </div>

        {/* Bottom Row: Price & Mobile Add Button */}
        <div className="pt-4 mt-2 border-t border-stone-100 flex items-center justify-between">
          <div>
            <span className="font-mono-num text-base font-bold text-stone-900">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-[11px] text-stone-400 ml-1.5">{product.volume}</span>
          </div>

          <button
            onClick={handleQuickAdd}
            className="sm:hidden p-2 rounded-lg bg-stone-900 text-white hover:bg-stone-800 active:scale-95 transition-all cursor-pointer"
            aria-label={`Add ${product.name} to cart`}
          >
            {justAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </article>
  );
};
