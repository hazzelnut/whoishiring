import { asc, desc, eq, sql, and } from "drizzle-orm";

import db from "../db/client";
import { Item, Story, StoryToTags } from "../db/schema";


export async function getLatestStory() {
  const data = await db.select()
                        .from(Story)
                        .orderBy(desc(Story.firebaseCreatedAt))
                        .limit(1)

  console.log(data)
  if (!data || data.length != 1) throw new Error('Could not fetch latest story!')
  return data[0]
}


export async function getJobs(url: URL) {
  const sort = url.searchParams.get('sort') || 'newest';
  const q = url.searchParams.get('q')?.trim() || '';
  const tags = url.searchParams.get('tags') || '';
  const startIndex = Number(url.searchParams.get('startIndex')) || 0
  const remote = url.searchParams.get('remote') || ''

  let storyId = url.searchParams.get('storyId');
  if (!storyId) {
    const latestStory = await getLatestStory()
    storyId = (latestStory.id).toString()
  }

  const whereClause = [eq(Item.storyId, parseInt(storyId))]

  if (q) {
    const arr = q.split(' ')
    const query = arr.map(word => `'${word}'`).join(' <-> ');
    console.log('query: ', query)
    whereClause.push(sql`to_tsvector(${Item.text}) @@ to_tsquery(${query})`)

    // TODO: create an index column for full text search
  }

  if (tags) {
    const arr = tags.split(',');
    const query = arr.map(word => `'${word}'`).join(' & ');
    console.log('tags: ', query)
    whereClause.push(sql`to_tsvector(${Item.text}) @@ to_tsquery(${query})`)

    // TODO: create an index column for full text search
  }

  if (remote === 'true') {
    whereClause.push(eq(Item.remote, true))
  }

  const data = await db.select({
                          id: Item.id,
                          by: Item.by,
                          text: Item.text,
                          htmlText: Item.htmlText,
                          firebaseCreatedAt: Item.firebaseCreatedAt,
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
  }
}


// TODO: get the latestStory
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