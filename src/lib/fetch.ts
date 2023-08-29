import { asc, desc, eq, sql, and, inArray } from "drizzle-orm";

import db from "../db/client";
import { Item, Story, StoryToTags } from "../db/schema";
import { sanitize } from "./sanitize";


export async function getLatestStory() {
  const data = await db.select()
                        .from(Story)
                        .orderBy(desc(Story.firebaseCreatedAt))
                        .limit(1)

  console.log(data)
  if (!data || data.length != 1) throw new Error('Could not fetch latest story!')
  return data[0]
}

export async function getAllStories() {
  const data = await db.select()
                       .from(Story)
                       .orderBy(desc(Story.firebaseCreatedAt))

  if (!data) throw new Error('Could not fetch any stories!')
  return data
}

export async function getJobs(url: URL) {
  const sort = url.searchParams.get('sort') || 'newest';
  const q = url.searchParams.get('q')?.trim() || '';
  const tags = url.searchParams.get('tags') || '';
  const startIndex = Number(url.searchParams.get('startIndex')) || 0
  const remote = url.searchParams.get('remote') || ''
  const savedJobs = url.searchParams.get('savedJobs') || ''

  let storyId = url.searchParams.get('storyId')
  if (!storyId) {
    const latestStory = await getLatestStory()
    storyId = (latestStory.id).toString()
  }

  // BUG: When it reaches the 1st of the month, and the data hasn't been loaded this will result in no posts being
  // shown to the user
  // Solution: Check if there's any items related to story, if not use a previous one?

  const whereClause = [eq(Item.storyId, parseInt(storyId))]

  if (q) {
    const sanitizedInput = sanitize(q)
    console.log('query: ', sanitizedInput)
    whereClause.push(sql`to_tsvector(${Item.htmlText}) @@ to_tsquery(${sanitizedInput})`)

    // TODO: Index search but make it more accurate? .htmlText seems to get more results than .text
    // especially around slashes(/) words around slashes?
  }

  if (tags) {
    const sanitizedInput = sanitize(tags)
    const query = sanitizedInput.split(',').join(' & ');
    console.log('tags: ', query)
    whereClause.push(sql`to_tsvector(${Item.htmlText}) @@ to_tsquery(${query})`)
  }

  if (remote === 'true') {
    whereClause.push(eq(Item.remote, true))
  }

  if (savedJobs) {
    const jobIds = savedJobs.split(',').map(id => parseInt(id))
    whereClause.push(inArray(Item.id, jobIds))
  }

  const data = await db.select({
                          id: Item.id,
                          by: Item.by,
                          text: Item.text,
                          htmlText: Item.htmlText,
                          firebaseCreatedAt: Item.firebaseCreatedAt,
                          firebaseId: Item.firebaseId,
                        })
                        .from(Item)
                        .where(and(...whereClause))
                        .orderBy(sort === 'oldest' ? asc(Item.firebaseCreatedAt) : desc(Item.firebaseCreatedAt))
                        .offset(startIndex)
                        .limit(12)

  if (!data) throw new Error('Could not fetch any items.')

  // TOOD: Make this a transaction SQL? combining count and job query
  const count = await db.select({ count: sql<number>`count(*)` })
                        .from(Item)
                        .where(and(...whereClause))

  console.log(count)
  if (!count) throw new Error('Could not fetch count of items.')

  return {
    data,
    ...count[0],
    storyId
  }
}

export async function getPopularTags(storyId: number) {
  const data = await db.select({
                          tag: StoryToTags.tag
                        })
                       .from(StoryToTags)
                       .where(eq(StoryToTags.storyId, storyId))
                       .orderBy(desc(StoryToTags.count))
                       .limit(20)

  if (!data) throw new Error('Could not fetch popular tags!')

  return data.map(tag => tag.tag)
}