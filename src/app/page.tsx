'use client';

import { useState, useEffect } from 'react';
import { HeroSearch } from '@/components/HeroSearch';
import { DestinationGrid } from '@/components/DestinationGrid';
import type { PlaceItem, PlacesSearchResponse, ItineraryItemData } from '@/types/trip';

export default function ExplorePage() {
  const [query, setQuery] = useState('Kyoto');
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'name'>('relevance');
  const [savedDestinationIds, setSavedDestinationIds] = useState<Set<string>>(new Set());

  // Load saved itinerary destination IDs
  useEffect(() => {
    let ignore = false;

    async function fetchSavedIds() {
      try {
        const res = await fetch('/api/itinerary');
        if (res.ok) {
          const data: { items: ItineraryItemData[] } = await res.json();
          if (!ignore) {
            const idSet = new Set(data.items.map((item) => item.destinationId));
            setSavedDestinationIds(idSet);
          }
        }
      } catch (e) {
        console.error('Failed to load saved itinerary IDs:', e);
      }
    }

    void fetchSavedIds();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function load() {
      if (!query.trim()) {
        setPlaces([]);
        setIsLoading(false);
        return;
      }

      try {
        const params = new URLSearchParams({
          q: query.trim(),
          category: activeCategory,
          sortBy,
        });

        const res = await fetch(`/api/destinations?${params.toString()}`);
        if (!res.ok) {
          throw new Error('Destination service encountered a temporary error.');
        }

        const data: PlacesSearchResponse = await res.json();
        if (!ignore) {
          setPlaces(data.results || []);
          setError(null);
          setIsLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error('Failed to retrieve destinations:', err);
          setError('Could not fetch destinations at this time. Please check your internet connection.');
          setPlaces([]);
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      ignore = true;
    };
  }, [query, activeCategory, sortBy]);

  const handleSearch = (newQuery: string) => {
    setIsLoading(true);
    setQuery(newQuery);
  };

  const handleSelectCategory = (category: string) => {
    setIsLoading(true);
    setActiveCategory(category);
  };

  const handleSelectSortBy = (newSort: 'relevance' | 'name') => {
    setIsLoading(true);
    setSortBy(newSort);
  };

  const handleToggleSaveDestination = async (place: PlaceItem) => {
    const isCurrentlySaved = savedDestinationIds.has(place.id);

    if (isCurrentlySaved) {
      // Remove
      try {
        const res = await fetch(`/api/itinerary/${encodeURIComponent(place.id)}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setSavedDestinationIds((prev) => {
            const next = new Set(prev);
            next.delete(place.id);
            return next;
          });
        }
      } catch (e) {
        console.error('Failed to remove from itinerary:', e);
      }
    } else {
      // Add
      try {
        const res = await fetch('/api/itinerary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destinationId: place.id,
            name: place.name,
            location: place.location,
            category: place.category,
            description: place.description,
            imageUrl: place.imageUrl,
            coordinatesLat: place.coordinates?.lat,
            coordinatesLon: place.coordinates?.lon,
          }),
        });

        if (res.status === 201 || res.status === 409) {
          setSavedDestinationIds((prev) => {
            const next = new Set(prev);
            next.add(place.id);
            return next;
          });
        }
      } catch (e) {
        console.error('Failed to add to itinerary:', e);
      }
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <HeroSearch
        onSearch={handleSearch}
        isLoading={isLoading}
        currentQuery={query}
      />
      <DestinationGrid
        places={places}
        isLoading={isLoading}
        query={query}
        error={error}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        sortBy={sortBy}
        onSelectSortBy={handleSelectSortBy}
        savedDestinationIds={savedDestinationIds}
        onToggleSaveDestination={handleToggleSaveDestination}
      />
    </div>
  );
}
