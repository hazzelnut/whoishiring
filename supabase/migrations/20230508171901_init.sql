-- CreateTable
CREATE TABLE "Story" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "firebaseId" INTEGER NOT NULL,
    "firebaseCreatedAt" TIMESTAMP(3) NOT NULL,

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "by" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "firebaseId" INTEGER NOT NULL,
    "firebaseCreatedAt" TIMESTAMP(3) NOT NULL,
    "storyId" INTEGER NOT NULL,
    "json" JSONB,
    "remote" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[] NOT NULL,

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryToTags" (
    "id" SERIAL NOT NULL,
    "storyId" INTEGER NOT NULL,
    "tags" TEXT[] NOT NULL,

    CONSTRAINT "StoryToTags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Story_firebaseId_key" ON "Story"("firebaseId");

-- CreateIndex
CREATE UNIQUE INDEX "Item_firebaseId_key" ON "Item"("firebaseId");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryToTags" ADD CONSTRAINT "StoryToTags_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;