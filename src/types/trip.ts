/**
 * TripWise Domain Types
 * Defines data structures for real external places, search filters, and itineraries.
 */

export interface PlaceCategory {
  id: string;
  label: string;
  kindsQuery?: string;
}

export interface PlaceItem {
  id: string;
  name: string;
  location: string;
  category: string;
  description: string;
  imageUrl: string | null;
  imageThumbnailUrl?: string | null;
  coordinates?: {
    lat: number;
    lon: number;
  };
  wikipediaUrl?: string;
  sourceProvider: 'OpenTripMap' | 'Wikimedia';
}

export interface PlacesSearchResponse {
  query: string;
  results: PlaceItem[];
  totalResults: number;
  provider: 'OpenTripMap' | 'Wikimedia';
  apiKeyMissing: boolean;
  setupInstructions?: string;
  error?: string;
}

export interface SearchFilters {
  destination: string;
  category?: string;
  sortBy?: 'relevance' | 'name';
}

export interface ItineraryItemData {
  id: string;
  destinationId: string;
  name: string;
  location: string;
  category: string;
  description: string;
  imageUrl?: string | null;
  coordinatesLat?: number | null;
  coordinatesLon?: number | null;
  notes?: string | null;
  plannedDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AddToItineraryPayload {
  destinationId: string;
  name: string;
  location: string;
  category: string;
  description: string;
  imageUrl?: string | null;
  coordinatesLat?: number | null;
  coordinatesLon?: number | null;
  notes?: string | null;
  plannedDate?: string | null;
}
