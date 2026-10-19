import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type { AddToItineraryPayload } from '@/types/trip';

export async function GET() {
  try {
    const items = await prisma.itineraryItem.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      items,
      count: items.length,
      demoNote: 'Single shared demo itinerary for current local deployment.',
    });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'digest' in error && String(error.digest).startsWith('NEXT_')) {
      throw error;
    }
    console.error('Failed to fetch itinerary items:', error);
    return NextResponse.json(
      { error: 'DATABASE_ERROR', message: 'Failed to retrieve itinerary items from the database.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    let body: Partial<AddToItineraryPayload>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'INVALID_JSON', message: 'Malformed JSON payload.' },
        { status: 400 }
      );
    }

    const {
      destinationId,
      name,
      location,
      category,
      description,
      imageUrl,
      coordinatesLat,
      coordinatesLon,
      notes,
      plannedDate,
    } = body;

    // Validation
    if (!destinationId || typeof destinationId !== 'string' || !destinationId.trim()) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Field "destinationId" is required and must be a non-empty string.' },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Field "name" is required and must be a non-empty string.' },
        { status: 400 }
      );
    }

    const cleanDestinationId = destinationId.trim();

    // Check for existing duplicate before insert
    const existing = await prisma.itineraryItem.findUnique({
      where: { destinationId: cleanDestinationId },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: 'DUPLICATE_ITEM',
          message: `"${name}" is already in your itinerary.`,
          existingItem: existing,
        },
        { status: 409 }
      );
    }

    // Create item
    const newItem = await prisma.itineraryItem.create({
      data: {
        destinationId: cleanDestinationId,
        name: name.trim(),
        location: (location && typeof location === 'string' ? location.trim() : 'Curated Destination'),
        category: (category && typeof category === 'string' ? category.trim() : 'Curated Landmark'),
        description: (description && typeof description === 'string' ? description.trim() : ''),
        imageUrl: typeof imageUrl === 'string' ? imageUrl : null,
        coordinatesLat: typeof coordinatesLat === 'number' && !isNaN(coordinatesLat) ? coordinatesLat : null,
        coordinatesLon: typeof coordinatesLon === 'number' && !isNaN(coordinatesLon) ? coordinatesLon : null,
        notes: typeof notes === 'string' ? notes.trim() : null,
        plannedDate: plannedDate && typeof plannedDate === 'string' ? new Date(plannedDate) : null,
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'digest' in error && String(error.digest).startsWith('NEXT_')) {
      throw error;
    }

    // Handle concurrent duplicate constraint violation from Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        {
          error: 'DUPLICATE_ITEM',
          message: 'This destination is already in your itinerary.',
        },
        { status: 409 }
      );
    }

    console.error('Failed to create itinerary item:', error);
    return NextResponse.json(
      { error: 'DATABASE_ERROR', message: 'Failed to save destination to the database.' },
      { status: 500 }
    );
  }
}
