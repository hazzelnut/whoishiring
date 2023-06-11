CREATE TABLE IF NOT EXISTS "Item" (
	"id" serial PRIMARY KEY NOT NULL,
	"by" text NOT NULL,
	"text" text NOT NULL,
	"htmlText" text NOT NULL,
	"firebaseId" integer NOT NULL,
	"firebaseCreatedAt" timestamp (3) with time zone NOT NULL,
	"storyId" integer NOT NULL,
	"json" jsonb,
	"remote" boolean DEFAULT false NOT NULL,
	"tags" text[] NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp (3) with time zone NOT NULL
);

CREATE TABLE IF NOT EXISTS "Story" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"firebaseId" integer NOT NULL,
	"firebaseCreatedAt" timestamp (3) with time zone NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp (3) with time zone NOT NULL
);

CREATE TABLE IF NOT EXISTS "StoryToTags" (
	"id" serial PRIMARY KEY NOT NULL,
	"storyId" integer NOT NULL,
	"tag" text NOT NULL,
	"count" integer NOT NULL,
	"storyToTagId" text NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp (3) with time zone NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "Item_firebaseId_key" ON "Item" ("firebaseId");
CREATE UNIQUE INDEX IF NOT EXISTS "Story_firebaseId_key" ON "Story" ("firebaseId");
CREATE UNIQUE INDEX IF NOT EXISTS "StoryToTags_storyToTagId_key" ON "StoryToTags" ("storyToTagId");
DO $$ BEGIN
 ALTER TABLE "Item" ADD CONSTRAINT "Item_storyId_Story_id_fk" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "StoryToTags" ADD CONSTRAINT "StoryToTags_storyId_Story_id_fk" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
