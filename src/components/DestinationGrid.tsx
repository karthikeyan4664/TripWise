'use client';

import { DestinationCard } from './DestinationCard';
import type { PlaceItem } from '@/types/trip';
import { Compass, AlertCircle, Sparkles, SlidersHorizontal } from 'lucide-react';

interface DestinationGridProps {
  places: PlaceItem[];
  isLoading: boolean;
  query: string;
  error?: string | null;
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  sortBy: 'relevance' | 'name';
  onSelectSortBy: (sort: 'relevance' | 'name') => void;
  savedDestinationIds?: Set<string>;
  onToggleSaveDestination?: (place: PlaceItem) => void;
}

const categories = [
  { id: 'all', label: 'All Destinations' },
  { id: 'cultural', label: 'Historic & Cultural' },
  { id: 'nature', label: 'Nature & Scenic' },
  { id: 'architecture', label: 'Architecture & Heritage' },
];

export function DestinationGrid({
  places,
  isLoading,
  query,
  error,
  activeCategory,
  onSelectCategory,
  sortBy,
  onSelectSortBy,
  savedDestinationIds = new Set(),
  onToggleSaveDestination,
}: DestinationGridProps) {
  return (
    <section id="destinations-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
      {/* Section Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E8E1D7] pb-4 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#193B2C]">
            <Compass className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Destination Explorer</span>
          </div>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#242823]">
            {query ? `Discoveries in ${query}` : 'Curated Destinations'}
          </h2>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label htmlFor="sort-select" className="text-xs font-medium text-[#6C7069] flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Sort by:</span>
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => onSelectSortBy(e.target.value as 'relevance' | 'name')}
            className="text-xs font-medium text-[#242823] bg-white border border-[#E8E1D7] rounded-lg px-2.5 py-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#193B2C] cursor-pointer"
          >
            <option value="relevance">Relevance</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#193B2C] cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-[#193B2C] text-white shadow-2xs'
                : 'bg-white border border-[#E8E1D7] text-[#6C7069] hover:text-[#242823] hover:border-[#193B2C]/30'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && !isLoading && (
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center my-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700 mb-3">
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="text-base font-semibold text-red-900">Destination Service Notice</h3>
          <p className="mt-1 text-sm text-red-700 max-w-md mx-auto">{error}</p>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-white border border-[#E8E1D7] overflow-hidden shadow-2xs"
            >
              <div className="aspect-[16/10] bg-[#E8E1D7]/50 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-3 w-1/3 bg-[#E8E1D7]/60 rounded-md animate-pulse" />
                <div className="h-5 w-3/4 bg-[#E8E1D7]/70 rounded-md animate-pulse" />
                <div className="h-3 w-full bg-[#E8E1D7]/50 rounded-md animate-pulse" />
                <div className="h-3 w-4/5 bg-[#E8E1D7]/50 rounded-md animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Populated Destination Cards */}
      {!isLoading && !error && places.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {places.map((place) => (
            <DestinationCard
              key={place.id}
              place={place}
              isSaved={savedDestinationIds.has(place.id)}
              onToggleSave={onToggleSaveDestination}
            />
          ))}
        </div>
      )}

      {/* Empty Search Results */}
      {!isLoading && !error && query && places.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#E8E1D7] bg-white p-10 sm:p-14 text-center my-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DCE5D9]/50 text-[#193B2C] mb-4">
            <Compass className="h-7 w-7" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-semibold text-[#242823]">
            No destinations found for &ldquo;{query}&rdquo;
          </h3>
          <p className="mt-2 max-w-md mx-auto text-sm text-[#6C7069] leading-relaxed">
            Try searching for a renowned city, cultural capital, national park, or geographic region (e.g., Kyoto, Amalfi Coast, Swiss Alps, Paris).
          </p>
        </div>
      )}

      {/* Initial Landing State before any query */}
      {!isLoading && !error && !query && (
        <div className="rounded-2xl border border-dashed border-[#E8E1D7] bg-white p-10 sm:p-14 text-center my-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DCE5D9]/50 text-[#193B2C] mb-4">
            <Sparkles className="h-7 w-7" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-semibold text-[#242823]">
            Begin Your Destination Discovery
          </h3>
          <p className="mt-2 max-w-md mx-auto text-sm text-[#6C7069] leading-relaxed">
            Enter a destination or select a suggestion above to explore live geographic records, cultural highlights, and regional photography.
          </p>
        </div>
      )}
    </section>
  );
}
