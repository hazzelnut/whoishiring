import pLimit from "p-limit";
import { htmlToText } from "html-to-text";
import { tags } from "./tags";

import db from "./client";
import { Story, Item, StoryToTags } from "./schema"
import { InferModel } from "drizzle-orm";

interface ItemJson {
  by: string;
  id: number;
  parent: number;
  text: string;
  time: number;
  type: string;
  deleted?: boolean;
  dead?: boolean;
  kids?: number[];
}

interface StoryItemJson {
  by: string;
  id: number;
  kids: number[];
  title: string;
  time: number;
}


export async function fetchItemJson<T>(itemId: number): Promise<T> {
  const firebaseUrl = "https://hacker-news.firebaseio.com/v0";
  const firebaseItem = (itemId: number) => `${firebaseUrl}/item/${itemId}.json`;

  const url = firebaseItem(itemId);
  const resp = await fetch(url);
  const json = (await resp.json()) as T;
  return json;
};


export async function getLatestStoryHN(): Promise<StoryItemJson> {
  const firebaseUrl = "https://hacker-news.firebaseio.com/v0";
  const firebaseStories = await fetch(
    `${firebaseUrl}/user/whoishiring/submitted.json`
  );

  const stories = (await firebaseStories.json()) as Array<number>;

  // The first story from whoishiring user
  // is always the latest 'Ask HN: Who is Hiring?'
  const storyId = stories[0];
  const latest = await fetchItemJson<StoryItemJson>(storyId);

  if (!latest?.title?.match(/Ask HN: Who is hiring/)) {
    throw new Error("Story is not 'who is hiring'");
  }

  return latest
}


export async function upsertStory(storyHN: StoryItemJson) {
  const { id: firebaseId, title, time } = storyHN
  const upsert = {
    updatedAt: new Date(),
    firebaseCreatedAt: new Date(time * 1000),
    firebaseId,
    title,
  }

  type NewStory = InferModel<typeof Story, "insert">;
  const upsertStory = (s: NewStory) => {
    return db.insert(Story)
             .values(s)
             .onConflictDoUpdate({ target: Story.firebaseId, set: s })
             .returning();
  }
  const data = await upsertStory(upsert)

  if (!data || data.length != 1) throw new Error('Latest story upserted could not be returned!')
  return data[0]
}


export async function upsertItems(itemIds: number[], storyId: number) {
  const limit = pLimit(20);

  const itemsInserted = await Promise.all(
    itemIds.map((itemId: number) => {
      return limit(async () => {
        const item = await fetchItemJson<ItemJson>(itemId);

        if (!item || item?.deleted || item?.dead) {
          console.log('--- skipping ---', item)
          return
        }

        const { by, time, text: htmlText, id: firebaseId } = item
        const text = htmlToText(htmlText)
        const { remote, tags } = await scanItemText(text)

        const upsert = {
          by,
          text,
          htmlText,
          remote,
          firebaseId,
          firebaseCreatedAt: new Date(time * 1000),
          updatedAt: new Date(),
          json: JSON.stringify(item),
          storyId,
          tags,
        }


        type NewItem = InferModel<typeof Item, "insert">;
        const upsertItem = (n: NewItem) => {
          return db.insert(Item)
                   .values(n)
                   .onConflictDoUpdate({ target: Item.firebaseId, set: n })
                   .returning();
        }
        const data = await upsertItem(upsert)

        if (!data || data.length != 1) throw new Error('Latest item upserted could not be returned!')

        return { ...data[0] }
      })
    })
  );

  return itemsInserted
}


export function matchTags(text: string): string[] {
  return tags.reduce((accum: string[], slug) => {
    const escaped = slug.replace(/(\.|\+)/g, `\\$&`);

    // My version of the proximity '<->' Postgres full-text search.
    // Match each word followed immediately by the next word.
    const zeroProximity = escaped.split(' ').join(`(.?|)`)

    // Match the word separately, by itself
    const boundary = `\\b${zeroProximity}\\b`
    const re = new RegExp(boundary, "gi");

    if (text.match(re)) accum.push(slug);
    return accum;
  }, []);
}


interface ItemTextMatches {
  remote: boolean;
  tags: string[];
}
export async function scanItemText(text: string): Promise<ItemTextMatches> {
  const matcher = (m: string): boolean => !!text.match(new RegExp(m, "gi"));

  const remote = matcher("remote");
  const tags = await matchTags(text);

  return { remote, tags };
}


export async function upsertStoryToTags(tagsToCounts: Record<string, number>, storyId: number) {
  for (const [tag, count] of Object.entries(tagsToCounts)) {
    const storyToTagId = `${storyId}${tag}`
    const upsert = {
      storyId,
      tag,
      count,
      storyToTagId,
      updatedAt: new Date(),
    }

    type NewStoryToTag = InferModel<typeof StoryToTags, "insert">;
    const upsertItem = (n: NewStoryToTag) => {
      return db.insert(StoryToTags)
                .values(n)
                .onConflictDoUpdate({ target: StoryToTags.storyToTagId, set: n })
                .returning();
    }

    const data = await upsertItem(upsert)

    if (!data || data.length != 1) throw new Error('Latest storyToTag upserted could not be returned!')

    console.log('StoryToTags response: ', JSON.stringify(data[0]))
  }
}
