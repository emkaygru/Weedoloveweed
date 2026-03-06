-- Add anonymous field to Thought
ALTER TABLE "Thought" ADD COLUMN "anonymous" BOOLEAN NOT NULL DEFAULT false;

-- Add munchies field to Entry
ALTER TABLE "Entry" ADD COLUMN "munchies" JSONB;

-- Create TBreak table
CREATE TABLE "TBreak" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "goalDays" INTEGER,
    CONSTRAINT "TBreak_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "TBreak" ADD CONSTRAINT "TBreak_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
