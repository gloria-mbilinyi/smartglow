import React from 'react';
import { ProductCategory } from '../types/store';

interface FooterProps {
  onSelectCategory: (category: ProductCategory) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-2">
            <span className="font-display text-2xl font-bold tracking-tight text-white block">
              SmartGlow
            </span>
            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed max-w-md">
              AI-calibrated botanical cosmetics and dermatologically inspired skincare. Formulated to harmonize with your unique complexion and skin barrier.
            </p>
            <div className="pt-2 text-[11px] text-stone-500">
              Prototype Monorepo &middot; React + TypeScript &middot; FastAPI &middot; Flutter &middot; TensorFlow
            </div>
          </div>

          {/* Catalog Categories */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Formulations
            </h4>
            <ul className="space-y-2">
              {(['Skincare', 'Serums', 'Cleansers', 'Sun Care', 'Makeup'] as ProductCategory[]).map(
                (cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => {
                        onSelectCategory(cat);
                        window.scrollTo({ top: 400, behavior: 'smooth' });
                      }}
                      className="text-stone-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {cat}
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Ethics & Science */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Ethics & Quality
            </h4>
            <ul className="space-y-2 text-stone-400">
              <li>100% Leaping Bunny Cruelty-Free</li>
              <li>Sulfate-Free & Phthalate-Free</li>
              <li>Cold-Pressed Botanical Actives</li>
              <li>Recyclable Amber & Frosted Glass</li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="mt-12 pt-8 border-t border-stone-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-stone-400 text-[11px]">
          <p>
            &copy; {new Date().getFullYear()} SmartGlow Cosmetics Platform. All rights reserved.
          </p>
          <p className="text-center md:text-right max-w-xl text-stone-400">
            <strong>Demonstration Notice:</strong> SmartGlow is a software engineering prototype. Products and ingredients are for application testing and do not constitute clinical diagnoses or verified medical claims.
          </p>
        </div>
      </div>
    </footer>
  );
};
