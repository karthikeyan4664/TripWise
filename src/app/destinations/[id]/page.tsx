import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Compass, ExternalLink, Globe } from 'lucide-react';
import type { PlaceItem } from '@/types/trip';
import { SaveToItineraryButton } from '@/components/SaveToItineraryButton';

async function getPlaceDetails(id: string): Promise<PlaceItem | null> {
  const openTripMapApiKey = process.env.OPENTRIPMAP_API_KEY;
  const isOpenTripMapXid = /^[A-Za-z]\d+/.test(id);

  if (isOpenTripMapXid && openTripMapApiKey) {
    try {
      const res = await fetch(
        `https://api.opentripmap.com/0.1/en/places/xid/${id}?apikey=${openTripMapApiKey}`,
        { next: { revalidate: 3600 } }
      );
      if (res.ok) {
        const d = await res.json();
        if (d.name) {
          return {
            id: d.xid || id,
            name: d.name,
            location: d.address?.city || d.address?.country || 'Curated Location',
            category: 'Historic & Cultural',
            description: d.wikipedia_extracts?.text || 'Documented landmark in geographic registries.',
            imageUrl: d.preview?.source || d.image || null,
            coordinates: d.point ? { lat: d.point.lat, lon: d.point.lon } : undefined,
            wikipediaUrl: d.wikipedia ? `https://en.wikipedia.org/wiki/${encodeURIComponent(d.wikipedia.replace(/^en:/, ''))}` : undefined,
            sourceProvider: 'OpenTripMap',
          };
        }
      }
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'digest' in e && String(e.digest).startsWith('NEXT_')) {
        throw e;
      }
    }
  }

  // Fetch from Wikipedia API
  try {
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&pageids=${encodeURIComponent(id)}&prop=pageimages|extracts|coordinates|info&inprop=url&piprop=original|thumbnail&pithumbsize=1200&explaintext=1`;
    const res = await fetch(wikiUrl, {
      headers: {
        'User-Agent': 'TripWiseTravelPlanner/1.0 (contact: info@tripwise.local)',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;
    const data = await res.json();
    const page = data.query?.pages?.[id];

    if (!page || page.missing !== undefined) return null;

    return {
      id: String(page.pageid),
      name: page.title,
      location: 'Curated Destination',
      category: 'Verified Landmark',
      description: page.extract || 'Documented landmark and regional destination.',
      imageUrl: page.original?.source || page.thumbnail?.source || null,
      coordinates: page.coordinates?.[0]
        ? { lat: page.coordinates[0].lat, lon: page.coordinates[0].lon }
        : undefined,
      wikipediaUrl: page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
      sourceProvider: 'Wikimedia',
    };
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'digest' in e && String(e.digest).startsWith('NEXT_')) {
      throw e;
    }
    return null;
  }
}

function DestinationDetailSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="h-5 w-28 bg-[#E8E1D7] rounded-md animate-pulse mb-6" />
      <div className="overflow-hidden rounded-3xl bg-white border border-[#E8E1D7] shadow-sm">
        <div className="aspect-[16/9] sm:aspect-[21/9] w-full bg-[#E8E1D7]/40 animate-pulse" />
        <div className="p-6 sm:p-10 space-y-4">
          <div className="h-4 w-1/4 bg-[#E8E1D7]/50 rounded-md animate-pulse" />
          <div className="h-8 w-2/3 bg-[#E8E1D7]/70 rounded-md animate-pulse" />
          <div className="h-4 w-full bg-[#E8E1D7]/40 rounded-md animate-pulse" />
          <div className="h-4 w-5/6 bg-[#E8E1D7]/40 rounded-md animate-pulse" />
        </div>
      </div>
    </div>
  );
}

async function DestinationDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const place = await getPlaceDetails(id);

  if (!place) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#193B2C] hover:text-[#13291F] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#193B2C] rounded-sm py-1"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to Explore</span>
        </Link>
      </div>

      {/* Main Destination Showcase Card */}
      <div className="overflow-hidden rounded-3xl bg-white border border-[#E8E1D7] shadow-sm">
        {/* Destination Imagery */}
        <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full bg-[#DCE5D9]/40">
          {place.imageUrl ? (
            <Image
              src={place.imageUrl}
              alt={place.name}
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover"
              unoptimized={place.imageUrl.includes('upload.wikimedia.org')}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-8 text-[#6C7069]">
              <Compass className="h-12 w-12 text-[#193B2C]/40 mb-2" aria-hidden="true" />
              <span className="text-sm font-medium">Regional Landmark Registry</span>
            </div>
          )}

          <div className="absolute top-4 left-4">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#F8F5EF]/95 backdrop-blur-xs text-[#C98262] border border-[#C98262]/30 shadow-2xs">
              {place.category}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-10">
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#6C7069] mb-3">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#193B2C]" aria-hidden="true" />
              <span>{place.location}</span>
            </div>
            {place.coordinates && (
              <div className="flex items-center gap-1.5 font-mono text-[11px] bg-[#F8F5EF] px-2 py-0.5 rounded-md border border-[#E8E1D7]">
                <Globe className="h-3 w-3 text-[#193B2C]" aria-hidden="true" />
                <span>
                  {place.coordinates.lat.toFixed(4)}&deg;N, {place.coordinates.lon.toFixed(4)}&deg;E
                </span>
              </div>
            )}
            <span className="ml-auto text-[11px] text-[#6C7069] uppercase tracking-wider">
              ID: {place.id}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#242823]">
              {place.name}
            </h1>
            <SaveToItineraryButton place={place} />
          </div>

          <div className="mt-6 pt-6 border-t border-[#E8E1D7] text-sm sm:text-base text-[#242823] leading-relaxed space-y-4">
            {place.description.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {/* External Reference & Metadata */}
          <div className="mt-8 pt-6 border-t border-[#E8E1D7] flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-[#6C7069]">
              Source: <span className="font-medium text-[#242823]">{place.sourceProvider} Geographic Directory</span>
            </div>
            {place.wikipediaUrl && (
              <a
                href={place.wikipediaUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#193B2C] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#193B2C] rounded-sm py-1 px-1"
              >
                <span>Read Encyclopedia Article</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function DestinationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<DestinationDetailSkeleton />}>
      <DestinationDetailContent params={params} />
    </Suspense>
  );
}
