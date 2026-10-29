import React from 'react';
import { ArrowDown, Sparkles, ShieldCheck, Leaf, Truck } from 'lucide-react';

interface HeroProps {
  onShopClick: () => void;
  onExploreConcerns: () => void;
  onStartSkinAnalysis?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onShopClick, onExploreConcerns, onStartSkinAnalysis }) => {
  return (
    <section className="relative overflow-hidden border-b border-stone-200 bg-[#f7f5f0]">
      {/* Editorial Split Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Narrative & Action */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-stone-600">
              <span className="text-amber-800">Clean Botanical Actives</span>
              <span aria-hidden="true">&middot;</span>
              <span>Dermatological Precision</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 leading-[1.12]">
              Luminous skincare calibrated for your unique complexion.
            </h1>

            <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl">
              SmartGlow harmonizes high-potency bio-actives with intelligent skin analysis. Clean, vegan formulations designed to nourish lipid barriers, clarify tone, and restore healthy radiance.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onShopClick}
                className="px-6 py-3.5 bg-stone-900 text-stone-50 font-medium text-sm rounded-lg hover:bg-stone-800 transition-colors shadow-sm cursor-pointer focus:ring-2 focus:ring-stone-500 focus:outline-none flex items-center gap-2 whitespace-nowrap"
              >
                <span>Shop the Collection</span>
                <ArrowDown className="w-4 h-4" />
              </button>

              {onStartSkinAnalysis && (
                <button
                  onClick={onStartSkinAnalysis}
                  className="px-5 py-3.5 bg-amber-100/80 text-amber-950 hover:bg-amber-200/90 border border-amber-300/80 font-medium text-sm rounded-lg transition-colors cursor-pointer focus:ring-2 focus:ring-amber-400 focus:outline-none flex items-center gap-2 whitespace-nowrap shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <span>AI Skin Analysis</span>
                </button>
              )}

              <button
                onClick={onExploreConcerns}
                className="px-5 py-3.5 bg-white text-stone-800 hover:bg-stone-50 border border-stone-300 font-medium text-sm rounded-lg transition-colors cursor-pointer focus:ring-2 focus:ring-stone-400 focus:outline-none flex items-center gap-2 whitespace-nowrap"
              >
                <span>Filter by Concern</span>
              </button>
            </div>

            {/* Prototype Notice */}
            <div className="pt-2 text-xs text-stone-500 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-600/70" />
              <span>Phase 2 Storefront Prototype &middot; Demo Catalog Active</span>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-stone-200/80 bg-stone-100 aspect-16/10 sm:aspect-16/9 lg:aspect-4/3">
              <img
                src="/src/assets/images/hero_smartglow_cosmetics_1793111027189.jpg"
                alt="SmartGlow luxury skincare bottles and creams on smooth travertine stone pedestal"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 text-white p-3 rounded-xl bg-stone-900/60 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-stone-100">Featured Botanical Series</p>
                  <p className="text-stone-300">Clean 100% vegan active extracts</p>
                </div>
                <button
                  onClick={onShopClick}
                  className="px-3 py-1.5 bg-white text-stone-900 font-semibold rounded-md hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  View All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust & Craftsmanship Strip */}
      <div className="border-t border-stone-200/70 bg-white/70 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center gap-1.5">
              <Leaf className="w-5 h-5 text-emerald-800" />
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">100% Vegan & Cruelty-Free</h4>
              <p className="text-xs text-stone-500">Ethically formulated without animal byproducts</p>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-amber-800" />
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Dermatologist Tested</h4>
              <p className="text-xs text-stone-500">Patch-verified for barrier tolerance & safety</p>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Sparkles className="w-5 h-5 text-indigo-800" />
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Clinically Guided Actives</h4>
              <p className="text-xs text-stone-500">Stabilized Vitamin C, Ceramides, & Niacinamide</p>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Truck className="w-5 h-5 text-stone-800" />
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Free Delivery Over $60</h4>
              <p className="text-xs text-stone-500">Fast carbon-neutral shipping on orders</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
