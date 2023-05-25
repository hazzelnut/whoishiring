-- CreateTable
CREATE TABLE "Story" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "firebaseId" INTEGER NOT NULL,
    "firebaseCreatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL,

    "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "by" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "htmlText" TEXT NOT NULL,
    "firebaseId" INTEGER NOT NULL,
    "firebaseCreatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL,
    "storyId" INTEGER NOT NULL,
    "json" JSONB,
    "remote" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[] NOT NULL,

    "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryToTags" (
    "id" SERIAL NOT NULL,
    "storyId" INTEGER NOT NULL,
    "tag" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "storyToTagId" TEXT NOT NULL, 

    "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL,

    CONSTRAINT "StoryToTags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Story_firebaseId_key" ON "Story"("firebaseId");

-- CreateIndex - need uniqueness to do upsert
CREATE UNIQUE INDEX "StoryToTags_storyToTagId_key" ON "StoryToTags"("storyToTagId");

-- CreateIndex
CREATE UNIQUE INDEX "Item_firebaseId_key" ON "Item"("firebaseId");

-- CreateIndex on firebaseCreatedAt for descending
CREATE INDEX "Item_firebaseCreatedAt_desc_key" ON "Item"("firebaseCreatedAt" DESC);

-- CreateIndex on storyId for where / equality chec
CREATE INDEX "Item_storyId_key" ON "Item"("storyId");

-- CreateIndex on count for ordering 
CREATE INDEX "StoryToTags_count_key" ON "StoryToTags"("count");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryToTags" ADD CONSTRAINT "StoryToTags_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateColumn For Full Text Search
ALTER TABLE "Item" ADD COLUMN "fts" TSVECTOR GENERATED ALWAYS AS (TO_TSVECTOR('english', ("text"))) STORED;

-- CreateIndex For Full Text Search
CREATE INDEX "Item_text_key" ON "Item" USING GIN("fts");
