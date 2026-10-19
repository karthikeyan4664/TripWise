import { NextRequest, NextResponse } from 'next/server';
import type { PlaceItem, PlacesSearchResponse } from '@/types/trip';

// Maps user-friendly category filters to keywords or kinds
function getCategorySearchTerm(category?: string): string {
  switch (category) {
    case 'cultural':
      return 'cultural museum historic heritage';
    case 'nature':
      return 'national park nature scenic mountains lake';
    case 'architecture':
      return 'architecture palace temple castle landmark';
    default:
      return 'attractions landmarks';
  }
}

function deriveCategory(title: string, extract: string, kinds?: string): string {
  const text = `${title} ${extract} ${kinds || ''}`.toLowerCase();
  if (text.includes('park') || text.includes('nature') || text.includes('mountain') || text.includes('lake') || text.includes('scenic')) {
    return 'Nature & Scenic';
  }
  if (text.includes('temple') || text.includes('palace') || text.includes('cathedral') || text.includes('castle') || text.includes('architecture')) {
    return 'Architecture & Heritage';
  }
  if (text.includes('museum') || text.includes('gallery') || text.includes('art') || text.includes('history') || text.includes('historic')) {
    return 'Historic & Cultural';
  }
  return 'Curated Landmark';
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q')?.trim() || '';
    const category = searchParams.get('category') || 'all';
    const sortBy = searchParams.get('sortBy') || 'relevance';

    // If no query is provided, return empty set
    if (!query) {
      return NextResponse.json<PlacesSearchResponse>({
        query: '',
        results: [],
        totalResults: 0,
        provider: 'OpenTripMap',
        apiKeyMissing: !process.env.OPENTRIPMAP_API_KEY,
        setupInstructions: !process.env.OPENTRIPMAP_API_KEY
          ? 'Add OPENTRIPMAP_API_KEY to your .env.local file to enable direct OpenTripMap queries.'
          : undefined,
      });
    }

    const openTripMapApiKey = process.env.OPENTRIPMAP_API_KEY;

    // 1. If OpenTripMap API key is provided, query OpenTripMap
    if (openTripMapApiKey) {
      try {
        const geonameUrl = `https://api.opentripmap.com/0.1/en/places/geoname?name=${encodeURIComponent(query)}&apikey=${openTripMapApiKey}`;
        const geoRes = await fetch(geonameUrl, { next: { revalidate: 3600 } });

        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.lat && geoData.lon) {
            let kinds = 'interesting_places,cultural,natural';
            if (category === 'cultural') kinds = 'cultural,historic,museums';
            if (category === 'nature') kinds = 'natural,gardens_and_parks';
            if (category === 'architecture') kinds = 'architecture,religion';

            const radiusUrl = `https://api.opentripmap.com/0.1/en/places/radius?radius=25000&lon=${geoData.lon}&lat=${geoData.lat}&kinds=${kinds}&limit=12&format=json&apikey=${openTripMapApiKey}`;
            const placesRes = await fetch(radiusUrl, { next: { revalidate: 3600 } });

            if (placesRes.ok) {
              const rawPlaces = await placesRes.json();
              if (Array.isArray(rawPlaces) && rawPlaces.length > 0) {
                const placeDetailPromises = rawPlaces.slice(0, 9).map(
                  async (p: { xid: string; name?: string }): Promise<PlaceItem | null> => {
                    try {
                      const detailRes = await fetch(
                        `https://api.opentripmap.com/0.1/en/places/xid/${p.xid}?apikey=${openTripMapApiKey}`,
                        { next: { revalidate: 3600 } }
                      );
                      if (!detailRes.ok) return null;
                      const d = await detailRes.json();
                      if (!d.name) return null;

                      return {
                        id: String(d.xid || p.xid),
                        name: String(d.name),
                        location: String(d.address?.city || d.address?.county || geoData.name || query),
                        category: deriveCategory(d.name, d.wikipedia_extracts?.text || '', d.kinds),
                        description: String(
                          d.wikipedia_extracts?.text?.slice(0, 240)?.trim() ||
                          'Verified regional landmark with documented cultural or scenic interest.'
                        ),
                        imageUrl: (d.preview?.source || d.image || null) as string | null,
                        imageThumbnailUrl: (d.preview?.source || d.image || null) as string | null,
                        coordinates: d.point
                          ? { lat: Number(d.point.lat), lon: Number(d.point.lon) }
                          : undefined,
                        wikipediaUrl: d.wikipedia
                          ? `https://en.wikipedia.org/wiki/${encodeURIComponent(d.wikipedia.replace(/^en:/, ''))}`
                          : undefined,
                        sourceProvider: 'OpenTripMap' as const,
                      };
                    } catch {
                      return null;
                    }
                  }
                );

                const settled = await Promise.all(placeDetailPromises);
                const results: PlaceItem[] = settled.filter((item): item is PlaceItem => item !== null);

                if (sortBy === 'name') {
                  results.sort((a, b) => a.name.localeCompare(b.name));
                }

                return NextResponse.json<PlacesSearchResponse>({
                  query,
                  results,
                  totalResults: results.length,
                  provider: 'OpenTripMap',
                  apiKeyMissing: false,
                });
              }
            }
          }
        }
      } catch (otmError) {
        console.error('OpenTripMap request error:', otmError);
        // Continue to fallback on network error
      }
    }

    // 2. Fallback / Keyless Mode using public Wikimedia Places API
    // Real, verified encyclopedia destination records with authentic photographs & extracts
    const categoryModifier = category !== 'all' ? getCategorySearchTerm(category) : 'landmarks attractions';
    const wikiSearchQuery = `${query} ${categoryModifier}`;
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(wikiSearchQuery)}&gsrlimit=12&prop=pageimages|extracts|coordinates&piprop=original|thumbnail&pithumbsize=800&exintro=1&explaintext=1`;

    const wikiRes = await fetch(wikiUrl, {
      headers: {
        'User-Agent': 'TripWiseTravelPlanner/1.0 (contact: info@tripwise.local)',
      },
      next: { revalidate: 3600 },
    });

    if (!wikiRes.ok) {
      return NextResponse.json<PlacesSearchResponse>(
        {
          query,
          results: [],
          totalResults: 0,
          provider: 'OpenTripMap',
          apiKeyMissing: !openTripMapApiKey,
          error: 'External destination service temporarily unavailable.',
        },
        { status: 502 }
      );
    }

    const wikiData = await wikiRes.json();
    const pages = wikiData.query?.pages || {};
    const results: PlaceItem[] = Object.values(pages)
      .filter((p: unknown): p is {
        pageid: number;
        title: string;
        extract?: string;
        thumbnail?: { source: string };
        original?: { source: string };
        coordinates?: { lat: number; lon: number }[];
      } => {
        if (!p || typeof p !== 'object') return false;
        const page = p as { title?: string; extract?: string };
        // Filter out non-place articles or disambiguations
        if (!page.title || !page.extract) return false;
        if (page.extract.includes('may refer to:') || page.title.includes('List of') || page.title.includes('Timeline of')) {
          return false;
        }
        return true;
      })
      .map((p) => {
        const cleanExtract = p.extract
          ? p.extract.replace(/\n+/g, ' ').slice(0, 220).trim() + '...'
          : 'Documented geographic destination and cultural point of interest.';

        return {
          id: String(p.pageid),
          name: p.title,
          location: query,
          category: deriveCategory(p.title, p.extract || ''),
          description: cleanExtract,
          imageUrl: p.original?.source || p.thumbnail?.source || null,
          imageThumbnailUrl: p.thumbnail?.source || p.original?.source || null,
          coordinates: p.coordinates?.[0]
            ? { lat: p.coordinates[0].lat, lon: p.coordinates[0].lon }
            : undefined,
          wikipediaUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(p.title)}`,
          sourceProvider: 'Wikimedia' as const,
        };
      });

    // Apply sorting
    if (sortBy === 'name') {
      results.sort((a, b) => a.name.localeCompare(b.name));
    }

    return NextResponse.json<PlacesSearchResponse>({
      query,
      results,
      totalResults: results.length,
      provider: openTripMapApiKey ? 'OpenTripMap' : 'Wikimedia',
      apiKeyMissing: !openTripMapApiKey,
      setupInstructions: !openTripMapApiKey
        ? 'OpenTripMap API key is not configured. To query OpenTripMap directly, obtain a free key at https://opentripmap.io/ and set OPENTRIPMAP_API_KEY in .env.local.'
        : undefined,
    });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'digest' in error && String(error.digest).startsWith('NEXT_')) {
      throw error;
    }
    console.error('Destination discovery route error:', error);
    return NextResponse.json<PlacesSearchResponse>(
      {
        query: '',
        results: [],
        totalResults: 0,
        provider: 'OpenTripMap',
        apiKeyMissing: !process.env.OPENTRIPMAP_API_KEY,
        error: 'An unexpected error occurred while querying destinations.',
      },
      { status: 500 }
    );
  }
}
