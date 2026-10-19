import { NextRequest, NextResponse } from 'next/server';
import type { PlaceItem } from '@/types/trip';

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Destination ID is required' }, { status: 400 });
    }

    const openTripMapApiKey = process.env.OPENTRIPMAP_API_KEY;

    // Check if ID is an OpenTripMap XID (typically starts with W, N, R followed by digits)
    const isOpenTripMapXid = /^[A-Za-z]\d+/.test(id);

    if (isOpenTripMapXid && openTripMapApiKey) {
      try {
        const detailRes = await fetch(
          `https://api.opentripmap.com/0.1/en/places/xid/${id}?apikey=${openTripMapApiKey}`,
          { next: { revalidate: 3600 } }
        );

        if (detailRes.ok) {
          const d = await detailRes.json();
          if (d.name) {
            const placeItem: PlaceItem = {
              id: d.xid || id,
              name: d.name,
              location: d.address?.city || d.address?.country || 'Curated Location',
              category: deriveCategory(d.name, d.wikipedia_extracts?.text || '', d.kinds),
              description:
                d.wikipedia_extracts?.text ||
                'Verified cultural or natural destination documented in geographic registries.',
              imageUrl: d.preview?.source || d.image || null,
              coordinates: d.point ? { lat: d.point.lat, lon: d.point.lon } : undefined,
              wikipediaUrl: d.wikipedia ? `https://en.wikipedia.org/wiki/${encodeURIComponent(d.wikipedia.replace(/^en:/, ''))}` : undefined,
              sourceProvider: 'OpenTripMap',
            };
            return NextResponse.json(placeItem);
          }
        }
      } catch (err) {
        console.error('Error fetching OpenTripMap details:', err);
      }
    }

    // Otherwise, fetch via Wikimedia Page ID API
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&pageids=${encodeURIComponent(id)}&prop=pageimages|extracts|coordinates|info&inprop=url&piprop=original|thumbnail&pithumbsize=1200&explaintext=1`;

    const wikiRes = await fetch(wikiUrl, {
      headers: {
        'User-Agent': 'TripWiseTravelPlanner/1.0 (contact: info@tripwise.local)',
      },
      next: { revalidate: 3600 },
    });

    if (!wikiRes.ok) {
      return NextResponse.json({ error: 'Destination details could not be retrieved.' }, { status: 502 });
    }

    const wikiData = await wikiRes.json();
    const page = wikiData.query?.pages?.[id];

    if (!page || page.missing !== undefined) {
      return NextResponse.json({ error: 'Destination not found.' }, { status: 404 });
    }

    const placeItem: PlaceItem = {
      id: String(page.pageid),
      name: page.title,
      location: 'Curated Regional Destination',
      category: deriveCategory(page.title, page.extract || ''),
      description: page.extract || 'Documented landmark and regional destination.',
      imageUrl: page.original?.source || page.thumbnail?.source || null,
      coordinates: page.coordinates?.[0]
        ? { lat: page.coordinates[0].lat, lon: page.coordinates[0].lon }
        : undefined,
      wikipediaUrl: page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
      sourceProvider: 'Wikimedia',
    };

    return NextResponse.json(placeItem);
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'digest' in err && String(err.digest).startsWith('NEXT_')) {
      throw err;
    }
    console.error('Destination detail route error:', err);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
