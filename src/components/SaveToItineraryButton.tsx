'use client';

import { useState, useEffect } from 'react';
import { Bookmark, Check, Loader2 } from 'lucide-react';
import type { PlaceItem, ItineraryItemData } from '@/types/trip';

interface SaveToItineraryButtonProps {
  place: PlaceItem;
}

export function SaveToItineraryButton({ place }: SaveToItineraryButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function checkStatus() {
      try {
        const res = await fetch('/api/itinerary');
        if (res.ok) {
          const data: { items: ItineraryItemData[] } = await res.json();
          const match = data.items.some((item) => item.destinationId === place.id);
          if (!ignore) {
            setIsSaved(match);
          }
        }
      } catch (err) {
        console.error('Failed to check itinerary status:', err);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void checkStatus();

    return () => {
      ignore = true;
    };
  }, [place.id]);

  const handleToggle = async () => {
    setIsUpdating(true);
    setFeedback(null);

    if (isSaved) {
      // Remove
      try {
        const res = await fetch(`/api/itinerary/${encodeURIComponent(place.id)}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setIsSaved(false);
          setFeedback('Removed from itinerary');
          setTimeout(() => setFeedback(null), 3000);
        }
      } catch (err) {
        console.error('Failed to remove from itinerary:', err);
      } finally {
        setIsUpdating(false);
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

        if (res.status === 201) {
          setIsSaved(true);
          setFeedback('Saved to itinerary');
          setTimeout(() => setFeedback(null), 3000);
        } else if (res.status === 409) {
          setIsSaved(true);
          setFeedback('Already in itinerary');
          setTimeout(() => setFeedback(null), 3000);
        }
      } catch (err) {
        console.error('Failed to save to itinerary:', err);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-[#6C7069] bg-[#F8F5EF] border border-[#E8E1D7]">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>Checking itinerary...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isUpdating}
        className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm shadow-xs transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#193B2C] focus-visible:ring-offset-2 ${
          isSaved
            ? 'bg-[#193B2C] text-white hover:bg-red-800'
            : 'bg-[#193B2C] text-white hover:bg-[#13291F] active:bg-[#13291F]'
        }`}
        aria-label={isSaved ? 'Remove from itinerary' : 'Save to itinerary'}
      >
        {isUpdating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Updating...</span>
          </>
        ) : isSaved ? (
          <>
            <Check className="w-4 h-4" />
            <span>Saved in Itinerary</span>
          </>
        ) : (
          <>
            <Bookmark className="w-4 h-4" />
            <span>Save to Itinerary</span>
          </>
        )}
      </button>

      {feedback && (
        <span className="text-xs font-medium text-[#193B2C] animate-in fade-in duration-200">
          {feedback}
        </span>
      )}
    </div>
  );
}
