'use client';

import { useState, type FormEvent } from 'react';
import { Search, Compass, ArrowRight, Loader2 } from 'lucide-react';

const curatedSuggestions = [
  'Kyoto',
  'Amalfi Coast',
  'Swiss Alps',
  'Paris',
  'Reykjavik',
];

interface HeroSearchProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  currentQuery: string;
}

export function HeroSearch({ onSearch, isLoading, currentQuery }: HeroSearchProps) {
  const [destination, setDestination] = useState(currentQuery || '');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = destination.trim();
    if (!trimmed) return;
    onSearch(trimmed);
  };

  const handleSuggestionClick = (name: string) => {
    setDestination(name);
    onSearch(name);
  };

  return (
    <section className="relative pt-10 pb-12 sm:pt-14 sm:pb-16">
      <div className="mx-auto max-w-4xl text-center px-4 sm:px-6">
        {/* Subtle Editorial Sub-badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-5 rounded-full bg-[#DCE5D9]/70 border border-[#193B2C]/15 text-[#193B2C] text-xs font-medium tracking-wide">
          <Compass className="w-3.5 h-3.5 text-[#193B2C]" aria-hidden="true" />
          <span>Curated Regional Intelligence</span>
        </div>

        {/* Clear Editorial Headline */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#242823] leading-[1.15]">
          Curate journeys with quiet precision.
        </h1>

        {/* Supporting Description */}
        <p className="mt-3.5 text-base sm:text-lg text-[#6C7069] max-w-2xl mx-auto leading-relaxed">
          Explore verified destinations, cultural landmarks, and serene regional itineraries tailored for the mindful traveler.
        </p>

        {/* Search Panel */}
        <div className="mt-8 mx-auto max-w-2xl">
          <form
            onSubmit={handleSubmit}
            className="p-2 sm:p-2.5 rounded-2xl bg-white border border-[#E8E1D7] shadow-xs transition-all focus-within:border-[#193B2C]/50 focus-within:shadow-md"
            role="search"
            aria-label="Destination Search"
          >
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              {/* Destination Input */}
              <div className="relative flex-1 w-full flex items-center">
                <label htmlFor="destination-input" className="sr-only">
                  Destination name
                </label>
                <Search
                  className="absolute left-3.5 w-4 h-4 text-[#6C7069]"
                  aria-hidden="true"
                />
                <input
                  id="destination-input"
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Search city, region, or landmark... e.g. Kyoto, Alps"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm text-[#242823] placeholder-[#6C7069]/70 bg-transparent rounded-xl focus:outline-none"
                />
              </div>

              {/* Submit Action Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm text-white bg-[#193B2C] hover:bg-[#13291F] active:bg-[#13291F] shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#193B2C] focus-visible:ring-offset-2 transition-colors cursor-pointer shrink-0 disabled:opacity-75"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <span>Discover</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Suggestions */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-[#6C7069]">
            <span className="font-medium text-[#242823]/80">Explore:</span>
            {curatedSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="hover:text-[#193B2C] hover:underline transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#193B2C] rounded-xs px-1"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
