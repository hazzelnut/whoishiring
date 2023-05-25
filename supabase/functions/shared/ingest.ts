import pLimit from "https://esm.sh/p-limit";
import { htmlToText } from "https://esm.sh/html-to-text";

import supabase from "./supabaseClient.ts";
import { tags } from "./tags.ts";

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
    updatedAt: new Date().toISOString(),
    firebaseCreatedAt: new Date(time * 1000).toISOString(),
    firebaseId,
    title,
  }

  // Ref: https://supabase.com/docs/reference/javascript/upsert
  // ignoreDuplicates: false -> 'duplicate rows merged with existing rows'
  // Create or update existing row
  const { data } = await supabase.from('Story')
                                 .upsert({ ...upsert}, { onConflict: 'firebaseId', ignoreDuplicates: false }) 
                                 .select()
                                 .limit(1)
                                 .single()

  if (!data) throw new Error('Latest story upserted could not be returned!')
  return data
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
          firebaseCreatedAt: new Date(time * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          json: JSON.stringify(item),
          storyId,
          tags,
        }

        // Ref: https://supabase.com/docs/reference/javascript/upsert
        // ignoreDuplicates: false -> 'duplicate rows merged with existing rows'
        // Create or update existing row
        const { data } = await supabase.from('Item')
                                            .upsert({ ...upsert }, { onConflict: 'firebaseId', ignoreDuplicates: false}) // if text has changed, update the item
                                            .select()
                                            .limit(1)
                                            .single()

        return { ...data }
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
      updatedAt: new Date().toISOString(),
    }
    const response  = await supabase.from('StoryToTags')
                                    .upsert({ ...upsert }, { onConflict: 'storyToTagId', ignoreDuplicates: false})
                                    .select()

    console.log('StoryToTags response: ', response)
  }
}
