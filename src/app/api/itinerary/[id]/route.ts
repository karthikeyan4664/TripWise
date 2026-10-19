import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== 'string' || !id.trim()) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Item ID is required.' },
        { status: 400 }
      );
    }

    const cleanId = id.trim();

    // Check if the item exists by primary key id or by destinationId
    const item = await prisma.itineraryItem.findFirst({
      where: {
        OR: [{ id: cleanId }, { destinationId: cleanId }],
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Itinerary item not found.' },
        { status: 404 }
      );
    }

    await prisma.itineraryItem.delete({
      where: { id: item.id },
    });

    return NextResponse.json({
      success: true,
      message: `"${item.name}" was removed from your itinerary.`,
      removedId: item.id,
      destinationId: item.destinationId,
    });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'digest' in error && String(error.digest).startsWith('NEXT_')) {
      throw error;
    }
    console.error('Failed to delete itinerary item:', error);
    return NextResponse.json(
      { error: 'DATABASE_ERROR', message: 'Failed to delete itinerary item.' },
      { status: 500 }
    );
  }
}
