import React, { useState } from 'react';
import { X, Star, Check, Plus, Minus, Shield, Sparkles, AlertCircle } from 'lucide-react';
import { Product } from '../types/store';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'benefits' | 'ingredients' | 'usage'>('benefits');
  const [addedAnimation, setAddedAnimation] = useState(false);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 800);
  };

  const totalPrice = (product.price * quantity).toFixed(2);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-950/70 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8 max-h-[90vh] flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-stone-500 hover:text-stone-900 bg-white/80 hover:bg-white rounded-full transition-colors cursor-pointer shadow-xs border border-stone-200"
          aria-label="Close product view"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Product Gallery */}
        <div className="w-full md:w-1/2 bg-stone-100 flex flex-col justify-between p-6 sm:p-8 border-b md:border-b-0 md:border-r border-stone-200">
          <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden shadow-inner bg-stone-200/50">
            <img
              src={product.imageUrl}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            {product.tag && (
              <span className="absolute top-3 left-3 text-xs uppercase tracking-wider font-semibold px-2.5 py-1 bg-stone-900/90 text-white rounded-md">
                {product.tag}
              </span>
            )}
          </div>

          {/* Skin Compatibility Summary Box */}
          <div className="mt-6 p-4 rounded-xl bg-stone-50 border border-stone-200/80 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-stone-800">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>Complexion Compatibility</span>
            </div>
            <div className="text-stone-600 flex flex-wrap gap-x-2 gap-y-1">
              <span>Skin Types:</span>
              <strong className="text-stone-900 font-medium">
                {product.skinTypes.join(', ')}
              </strong>
            </div>
            <div className="text-stone-600 flex flex-wrap gap-x-2 gap-y-1">
              <span>Target Concerns:</span>
              <strong className="text-stone-900 font-medium">
                {product.skinConcerns.join(', ')}
              </strong>
            </div>
          </div>
        </div>

        {/* Right Side: Contiguous Purchase & Details Module */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[90vh]">
          <div className="space-y-4">
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                <span className="uppercase tracking-wider font-semibold">{product.category}</span>
                <span className="font-mono-num">{product.volume}</span>
              </div>

              <h2 id="modal-title" className="font-display text-2xl sm:text-3xl font-bold text-stone-900">
                {product.name}
              </h2>
              <p className="text-sm text-stone-600 mt-1">{product.subtitle}</p>

              {/* Price & Rating */}
              <div className="flex items-center justify-between pt-3 border-b border-stone-100 pb-4">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono-num text-2xl font-bold text-stone-900">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-sm">
                    In Stock ({product.stockCount} left)
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-stone-700 font-mono-num">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span className="font-semibold">{product.rating.toFixed(1)}</span>
                  <span className="text-stone-400">({product.reviewsCount} reviews)</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {product.description}
            </p>

            {/* Tab Navigation */}
            <div className="border-b border-stone-200 flex gap-4 text-xs font-semibold uppercase tracking-wider">
              <button
                onClick={() => setActiveTab('benefits')}
                className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'benefits'
                    ? 'border-stone-900 text-stone-950 font-bold'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                Key Benefits
              </button>
              <button
                onClick={() => setActiveTab('ingredients')}
                className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'ingredients'
                    ? 'border-stone-900 text-stone-950 font-bold'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                Ingredients
              </button>
              <button
                onClick={() => setActiveTab('usage')}
                className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'usage'
                    ? 'border-stone-900 text-stone-950 font-bold'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                How to Use
              </button>
            </div>

            {/* Tab Contents */}
            <div className="text-xs text-stone-600 min-h-[90px]">
              {activeTab === 'benefits' && (
                <ul className="space-y-2 list-none">
                  {product.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              )}

              {activeTab === 'ingredients' && (
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold text-stone-800">Primary Actives: </span>
                    <span>{product.keyIngredients.join(', ')}</span>
                  </div>
                  <div className="text-[11px] text-stone-500 leading-normal">
                    <span className="font-semibold text-stone-700">Full INCI: </span>
                    {product.allIngredients}
                  </div>
                </div>
              )}

              {activeTab === 'usage' && (
                <div className="space-y-2 bg-stone-50 p-3 rounded-lg border border-stone-200">
                  <div className="font-semibold text-stone-800">Dermatologist Ritual:</div>
                  <p className="leading-relaxed">{product.usage}</p>
                </div>
              )}
            </div>

            {/* Medical disclaimer note */}
            <div className="flex items-center gap-2 p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-lg text-[11px] text-amber-900">
              <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>Curated prototype formulation &middot; Intended for cosmetic skincare routines</span>
            </div>
          </div>

          {/* Purchase Controls Bottom Bar */}
          <div className="pt-6 mt-4 border-t border-stone-200 space-y-3">
            <div className="flex items-center gap-3">
              {/* Quantity Stepper */}
              <div className="flex items-center border border-stone-300 rounded-lg bg-stone-50 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1.5 hover:bg-white text-stone-700 rounded transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono-num font-semibold text-stone-900 px-3 text-xs sm:text-sm">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
                  className="p-1.5 hover:bg-white text-stone-700 rounded transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                  disabled={quantity >= product.stockCount}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Bag CTA */}
              <button
                onClick={handleAdd}
                className={`flex-1 py-3 px-6 rounded-lg text-sm font-semibold tracking-wide transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
                  addedAnimation
                    ? 'bg-emerald-800 text-white'
                    : 'bg-stone-900 hover:bg-stone-800 text-stone-50'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Bag!</span>
                  </>
                ) : (
                  <span>Add to Bag &middot; ${totalPrice}</span>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-stone-400" />
                <span>30-Day Formulation Guarantee</span>
              </span>
              <span>Free returns on unopened items</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
