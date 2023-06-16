import { sql } from "drizzle-orm";
import { serial, text, timestamp, integer, pgTable, jsonb, boolean, uniqueIndex } from "drizzle-orm/pg-core";
 
export const Story = pgTable("Story", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  firebaseId: integer("firebaseId").notNull(),
  firebaseCreatedAt: timestamp("firebaseCreatedAt", { precision: 3, withTimezone: true }).notNull(),
  createdAt: timestamp("createdAt", { precision: 3, withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updatedAt", { precision: 3, withTimezone: true }).notNull(),
}, (table) => {
  return {
    firebaseIdIdx: uniqueIndex("Story_firebaseId_key").on(table.firebaseId),
  }
});

export const Item = pgTable("Item", {
  id: serial("id").primaryKey(),
  by: text("by").notNull(),
  text: text("text").notNull(),
  htmlText: text("htmlText").notNull(),
  firebaseId: integer("firebaseId").notNull(),
  firebaseCreatedAt: timestamp("firebaseCreatedAt", { precision: 3, withTimezone: true }).notNull(),
  storyId: integer("storyId").notNull().references(() => Story.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
  json: jsonb("json"),
  remote: boolean("remote").notNull().default(false),
  tags: text("tags").array().notNull(), 
  // fts: tsvector("fts"), TODO: Add full text search

  createdAt: timestamp("createdAt", { precision: 3, withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updatedAt", { precision: 3, withTimezone: true }).notNull(),
}, (table) => {
  return {
    firebaseIdIdx: uniqueIndex("Item_firebaseId_key").on(table.firebaseId),
  }
});

export const StoryToTags = pgTable("StoryToTags", {
  id: serial("id").primaryKey(),
  storyId: integer("storyId").notNull().references(() => Story.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
  tag: text("tag").notNull(),
  count: integer("count").notNull(),
  storyToTagId: text("storyToTagId").notNull(),

  createdAt: timestamp("createdAt", { precision: 3, withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updatedAt", { precision: 3, withTimezone: true }).notNull(),
}, (table) => {
  return {
    storyToTagIdIdx: uniqueIndex("StoryToTags_storyToTagId_key").on(table.storyToTagId),
  }
});
