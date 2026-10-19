'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ArrowUpRight, Compass, Bookmark, Check } from 'lucide-react';
import type { PlaceItem } from '@/types/trip';

interface DestinationCardProps {
  place: PlaceItem;
  isSaved?: boolean;
  onToggleSave?: (place: PlaceItem) => void;
  isSaving?: boolean;
}

export function DestinationCard({
  place,
  isSaved = false,
  onToggleSave,
  isSaving = false,
}: DestinationCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-[#E8E1D7] shadow-2xs hover:shadow-md transition-all duration-200">
      {/* Destination Image with consistent aspect ratio */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#DCE5D9]/30">
        {place.imageUrl ? (
          <Image
            src={place.imageUrl}
            alt={place.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-103"
            unoptimized={place.imageUrl.includes('upload.wikimedia.org')}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-4 text-[#6C7069]">
            <Compass className="h-8 w-8 text-[#193B2C]/40 mb-1" aria-hidden="true" />
            <span className="text-xs font-medium">Regional Landmark</span>
          </div>
        )}

        {/* Category Pill with subtle terracotta highlight */}
        <div className="absolute top-3 left-3">
          <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide bg-[#F8F5EF]/95 backdrop-blur-xs text-[#C98262] border border-[#C98262]/25 shadow-2xs">
            {place.category}
          </span>
        </div>

        {/* Quick Save Bookmark Action */}
        {onToggleSave && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSave(place);
            }}
            disabled={isSaving}
            className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-150 backdrop-blur-xs shadow-2xs cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#193B2C] ${
              isSaved
                ? 'bg-[#193B2C] text-white hover:bg-[#13291F]'
                : 'bg-[#F8F5EF]/95 text-[#242823] hover:text-[#193B2C] hover:bg-white'
            }`}
            title={isSaved ? 'In your itinerary' : 'Save to itinerary'}
            aria-label={isSaved ? `Remove ${place.name} from itinerary` : `Save ${place.name} to itinerary`}
          >
            {isSaved ? (
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Title and Location */}
        <div className="flex-1">
          <div className="flex items-center gap-1.5 text-xs text-[#6C7069] mb-1">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#193B2C]" aria-hidden="true" />
            <span className="truncate">{place.location}</span>
          </div>
          <h3 className="font-semibold text-lg text-[#242823] tracking-tight group-hover:text-[#193B2C] transition-colors line-clamp-1">
            {place.name}
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-[#6C7069] line-clamp-2 leading-relaxed">
            {place.description}
          </p>
        </div>

        {/* Card Footer Action */}
        <div className="mt-4 pt-3.5 border-t border-[#E8E1D7]/70 flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#6C7069] uppercase tracking-wider">
            {isSaved ? (
              <span className="text-[#193B2C] font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" /> Saved to Trip
              </span>
            ) : (
              `${place.sourceProvider} Verified`
            )}
          </span>
          <Link
            href={`/destinations/${encodeURIComponent(place.id)}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-[#193B2C] group-hover:text-[#13291F] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#193B2C] rounded-sm py-0.5 px-1"
            aria-label={`View details for ${place.name}`}
          >
            <span>View Details</span>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
