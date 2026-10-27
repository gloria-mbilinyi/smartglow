import React from 'react';
import { Filter, SlidersHorizontal, RotateCcw, Search, X } from 'lucide-react';
import { FilterState, SkinType, SkinConcern } from '../types/store';

interface FilterBarProps {
  filterState: FilterState;
  onChangeFilter: (updates: Partial<FilterState>) => void;
  onResetFilters: () => void;
  totalResults: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filterState,
  onChangeFilter,
  onResetFilters,
  totalResults,
}) => {
  const skinTypes: SkinType[] = ['All', 'Normal', 'Dry', 'Oily', 'Combination', 'Sensitive'];
  const skinConcerns: SkinConcern[] = [
    'All',
    'Dullness',
    'Hyperpigmentation',
    'Dehydration',
    'Acne & Pores',
    'Redness',
    'Fine Lines',
  ];

  const hasActiveFilters =
    filterState.category !== 'All' ||
    filterState.skinType !== 'All' ||
    filterState.skinConcern !== 'All' ||
    filterState.searchQuery.trim() !== '' ||
    filterState.sortBy !== 'featured';

  return (
    <div className="bg-white/90 border-b border-stone-200/90 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Top Controls Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by keyword or ingredient..."
              value={filterState.searchQuery}
              onChange={(e) => onChangeFilter({ searchQuery: e.target.value })}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-lg text-stone-800 placeholder-stone-400 focus:bg-white focus:border-stone-400 focus:ring-1 focus:ring-stone-400 focus:outline-none transition-all"
            />
            {filterState.searchQuery && (
              <button
                onClick={() => onChangeFilter({ searchQuery: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                aria-label="Clear search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns & Sorting */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
            {/* Skin Type Filter */}
            <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5">
              <label htmlFor="skin-type-select" className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Skin Type:
              </label>
              <select
                id="skin-type-select"
                value={filterState.skinType}
                onChange={(e) => onChangeFilter({ skinType: e.target.value as SkinType })}
                className="text-xs sm:text-sm text-stone-800 bg-transparent focus:outline-none cursor-pointer font-medium"
              >
                {skinTypes.map((t) => (
                  <option key={t} value={t}>
                    {t === 'All' ? 'All Types' : t}
                  </option>
                ))}
              </select>
            </div>

            {/* Skin Concern Filter */}
            <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5">
              <label htmlFor="skin-concern-select" className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Concern:
              </label>
              <select
                id="skin-concern-select"
                value={filterState.skinConcern}
                onChange={(e) => onChangeFilter({ skinConcern: e.target.value as SkinConcern })}
                className="text-xs sm:text-sm text-stone-800 bg-transparent focus:outline-none cursor-pointer font-medium"
              >
                {skinConcerns.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Concerns' : c}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5">
              <label htmlFor="sort-by-select" className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Sort:
              </label>
              <select
                id="sort-by-select"
                value={filterState.sortBy}
                onChange={(e) =>
                  onChangeFilter({
                    sortBy: e.target.value as FilterState['sortBy'],
                  })
                }
                className="text-xs sm:text-sm text-stone-800 bg-transparent focus:outline-none cursor-pointer font-medium"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                onClick={onResetFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Counter & Active Pills */}
        <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-stone-700 font-mono-num">{totalResults}</span>
            <span>{totalResults === 1 ? 'formulation found' : 'formulations found'}</span>
            {filterState.category !== 'All' && (
              <>
                <span aria-hidden="true">&middot;</span>
                <span className="text-stone-800 font-medium">{filterState.category}</span>
              </>
            )}
            {filterState.skinType !== 'All' && (
              <>
                <span aria-hidden="true">&middot;</span>
                <span>Type: <strong className="text-stone-800">{filterState.skinType}</strong></span>
              </>
            )}
            {filterState.skinConcern !== 'All' && (
              <>
                <span aria-hidden="true">&middot;</span>
                <span>Concern: <strong className="text-stone-800">{filterState.skinConcern}</strong></span>
              </>
            )}
          </div>

          <div className="hidden sm:block text-[11px] text-stone-400">
            Dermatologically benchmarked demo formulations
          </div>
        </div>
      </div>
    </div>
  );
};
