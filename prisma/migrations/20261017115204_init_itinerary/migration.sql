-- CreateTable
CREATE TABLE "ItineraryItem" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "coordinatesLat" DOUBLE PRECISION,
    "coordinatesLon" DOUBLE PRECISION,
    "notes" TEXT,
    "plannedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItineraryItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ItineraryItem_destinationId_key" ON "ItineraryItem"("destinationId");

-- CreateIndex
CREATE INDEX "ItineraryItem_destinationId_idx" ON "ItineraryItem"("destinationId");
