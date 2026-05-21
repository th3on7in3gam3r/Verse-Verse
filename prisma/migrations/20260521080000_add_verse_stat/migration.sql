-- Create a lightweight verse engagement table to persist amen counts.
CREATE TABLE "VerseStat" (
  "verseId" text PRIMARY KEY NOT NULL,
  "amenCount" integer NOT NULL DEFAULT 0,
  "updatedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
