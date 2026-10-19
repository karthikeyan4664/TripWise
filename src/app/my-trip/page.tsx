'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookmarkCheck, ArrowLeft, Calendar, Compass, Trash2, ArrowUpRight, Loader2, MapPin, Database } from 'lucide-react';
import type { ItineraryItemData } from '@/types/trip';

export default function MyTripPage() {
  const [items, setItems] = useState<ItineraryItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function fetchItinerary() {
      try {
        const res = await fetch('/api/itinerary');
        if (res.ok) {
          const data: { items: ItineraryItemData[] } = await res.json();
          if (!ignore) {
            setItems(data.items || []);
            setIsLoading(false);
          }
        }
      } catch (err) {
        if (!ignore) {
          console.error('Failed to load itinerary:', err);
          setIsLoading(false);
        }
      }
    }

    void fetchItinerary();

    return () => {
      ignore = true;
    };
  }, []);

  const handleRemove = async (id: string, name: string) => {
    if (removingId) return;
    setRemovingId(id);

    try {
      const res = await fetch(`/api/itinerary/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id && item.destinationId !== id));
      }
    } catch (err) {
      console.error(`Failed to remove "${name}" from itinerary:`, err);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 flex-1 flex flex-col">
      {/* Page Header */}
      <div className="mb-8 border-b border-[#E8E1D7] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#193B2C]">
            <BookmarkCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Itinerary Center</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-[#242823]">
            My Trip
          </h1>
          <p className="mt-1 text-sm text-[#6C7069]">
            Your central workspace for saved destinations and custom day-by-day schedules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-[#F8F5EF] text-[#6C7069] border border-[#E8E1D7]">
            <Database className="w-3 h-3 text-[#193B2C]" aria-hidden="true" />
            <span>PostgreSQL Persistent Itinerary</span>
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 text-xs font-medium text-[#193B2C] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#193B2C] rounded-sm py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Explore</span>
          </Link>
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-white border border-[#E8E1D7] overflow-hidden shadow-2xs"
            >
              <div className="aspect-[16/10] bg-[#E8E1D7]/50 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-3 w-1/3 bg-[#E8E1D7]/60 rounded-md animate-pulse" />
                <div className="h-5 w-3/4 bg-[#E8E1D7]/70 rounded-md animate-pulse" />
                <div className="h-3 w-full bg-[#E8E1D7]/50 rounded-md animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Populated Itinerary Grid */}
      {!isLoading && items.length > 0 && (
        <div className="space-y-6">
          {/* Summary Bar */}
          <div className="flex items-center justify-between text-xs text-[#6C7069]">
            <span>
              Saved destinations: <strong className="text-[#242823]">{items.length}</strong>
            </span>
            <span className="text-[11px]">
              Single shared demo itinerary &bull; Stored in local database
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <article
                key={item.id}
                className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-[#E8E1D7] shadow-2xs hover:shadow-md transition-all duration-200"
              >
                {/* Destination Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#DCE5D9]/30">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-103"
                      unoptimized={item.imageUrl.includes('upload.wikimedia.org')}
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center p-4 text-[#6C7069]">
                      <Compass className="h-8 w-8 text-[#193B2C]/40 mb-1" aria-hidden="true" />
                      <span className="text-xs font-medium">Regional Landmark</span>
                    </div>
                  )}

                  {/* Category Pill with terracotta highlight */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide bg-[#F8F5EF]/95 backdrop-blur-xs text-[#C98262] border border-[#C98262]/25 shadow-2xs">
                      {item.category}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id, item.name)}
                    disabled={removingId === item.id}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-[#6C7069] hover:text-red-700 hover:bg-white transition-colors shadow-2xs cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                    title={`Remove ${item.name} from itinerary`}
                    aria-label={`Remove ${item.name} from itinerary`}
                  >
                    {removingId === item.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                {/* Card Content */}
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 text-xs text-[#6C7069] mb-1">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-[#193B2C]" aria-hidden="true" />
                      <span className="truncate">{item.location}</span>
                    </div>
                    <h2 className="font-semibold text-lg text-[#242823] tracking-tight group-hover:text-[#193B2C] transition-colors line-clamp-1">
                      {item.name}
                    </h2>
                    <p className="mt-2 text-xs sm:text-sm text-[#6C7069] line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-4 pt-3.5 border-t border-[#E8E1D7]/70 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-[#193B2C] flex items-center gap-1">
                      <BookmarkCheck className="w-3.5 h-3.5" /> Saved
                    </span>
                    <Link
                      href={`/destinations/${encodeURIComponent(item.destinationId)}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#193B2C] group-hover:text-[#13291F] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#193B2C] rounded-sm py-0.5 px-1"
                      aria-label={`View details for ${item.name}`}
                    >
                      <span>View Details</span>
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Sensible, Honest Empty State for My Trip */}
      {!isLoading && items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#E8E1D7] bg-white p-8 sm:p-14 text-center shadow-xs my-auto">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DCE5D9]/60 text-[#193B2C] mb-4">
            <Calendar className="h-7 w-7" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-semibold text-[#242823]">
            No trips planned yet
          </h2>
          <p className="mt-2 max-w-md mx-auto text-sm text-[#6C7069] leading-relaxed">
            Explore destinations and discover inspiring regions to begin building your personal itinerary.
          </p>

          <div className="mt-8 flex items-center justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm text-white bg-[#193B2C] hover:bg-[#13291F] shadow-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#193B2C] focus-visible:ring-offset-2"
            >
              <Compass className="w-4 h-4" aria-hidden="true" />
              <span>Explore Destinations</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
