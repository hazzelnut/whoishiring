import pLimit from "p-limit";
import supabase from "./supabase/client";
import { tags } from "./tags";
import { htmlToText } from "html-to-text";

export interface ItemJson {
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

export interface ExtendedItemJson extends ItemJson {
  timeAgo: string;
}

interface StoryItemJson {
  by: string;
  id: number;
  kids: number[];
  title: string;
  time: number;
}

// Fetch posts from HN
export async function getLatestStoryAndItems(): Promise<ItemJson[]> {
  // Ref: https://github.com/gadogado/hn-hired/blob/main/scripts/get-latest-story.server.ts
  const firebaseUrl = "https://hacker-news.firebaseio.com/v0";
  const firebaseStories = await fetch(
    `${firebaseUrl}/user/whoishiring/submitted.json`
  );
  const firebaseItem = (itemId: number) => `${firebaseUrl}/item/${itemId}.json`;

  // Re-use function to fetch whoishiring post and comments
  const fetchItemJson = async <T>(itemId: number): Promise<T> => {
    const url = firebaseItem(itemId);
    const resp = await fetch(url);
    const json = (await resp.json()) as T;
    return json;
  };

  const stories = (await firebaseStories.json()) as Array<number>;

  // The first story from whoishiring user
  // is always the latest 'Ask HN: Who is Hiring?'
  const storyId = stories[0];
  const latest = await fetchItemJson<StoryItemJson>(storyId);

  if (!latest?.title?.match(/Ask HN: Who is hiring/)) {
    throw new Error("Story is not 'who is hiring'");
  }

  const itemIds = latest.kids; 

  // NOTE: Is concurreny of 20 promises running
  // okay with Vercel?
  const limit = pLimit(20);
  const jobPosts: Array<ItemJson> = await Promise.all(
    itemIds.map(async (itemId: number) => {
      return limit(async () => {
        return await fetchItemJson<ItemJson>(itemId);
      })
    })
  );

  return jobPosts;
}


export async function getLatestStory() {
  const { data, error } = await supabase.from('Story')
                                 .select()
                                 .order('firebaseCreatedAt', { ascending: false })
                                 .limit(1)
                                 .single()

  if (!data || error) throw new Error(`Could not fetch latest story! Error: ${error}`)
  return data
}


// Get job postings from Supabase
export async function getJobs(url: URL) {
  const sort = url.searchParams.get('sort') || 'newest';
  const q = url.searchParams.get('q')?.trim() || '';
  const tags = url.searchParams.get('tags') || '';
  const startIndex = Number(url.searchParams.get('startIndex')) || 0

  let storyId = url.searchParams.get('storyId');
  if (!storyId) {
    const latestStory = await getLatestStory()

    storyId = (latestStory.id).toString()
  }

  const query = supabase.from('Item')
                        .select('id, by, text, htmlText, firebaseCreatedAt', { count: 'exact' })
                        .order('firebaseCreatedAt', { ascending: sort === 'oldest'})
                        .range(startIndex, startIndex + 11)
                        .eq('storyId', storyId)

  if (q) {
    console.log('query: ', q)
    query.textSearch('fts', `'${q}'`)
  }

  if (tags) {
    const arr = tags.split(',');
    const result = arr.map(word => `'${word}'`).join(' & ');
    console.log('tags: ', result)

    query.textSearch('fts', result)
  }

  const { data, count, error } = await query

  // BUG: Sometimes range is not satifiable, fix?
  if (data === null || count === null || error) throw new Error(`Could not fetch any items. Error: ${JSON.stringify(error)}`)

  return {
    data,
    count,
  }
}

/****** Serverless code for data ingestion *******/
// TODO: Write serverless function to run
// cron job to fill data into supabase database
// to add complete data

// /*  Serverless function to cron to insert into Supabase */
// export async function addJobsToSupabase(posts: ExtendedItemJson[]) {
//   posts.map(async (post) => {
//     try {
//       const response = await supabase.from("jobs").insert({
//         ...post,
//         kids: JSON.stringify(post?.kids || []),
//         json: JSON.stringify(post)
//       });
//       console.log(response);
//     } catch(e) {
//       console.error(e)
//     }
//   });
// }

// export async function getJobsFromHN(): Promise<ExtendedItemJson[]> {
//   // Ref:  https://kit.svelte.dev/docs/load#making-fetch-requests
//   let posts = await getLatestStoryAndItems();

//   // filter dead and deleted posts
//   posts = posts.filter(post => !post?.dead && !post?.deleted);

//   // Add a few nice-to-have params to display on front-end
//   // but insert into Supabase DB
//   const updatedPosts = posts.map(post => ({
//     ...post,
//     timeAgo: getTimeAgo(post.time)}
//   )) as ExtendedItemJson[];

//   return updatedPosts;
// }

//  Function to fetch whoishiring post and comments
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

export function matchTags(text: string) {
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
};

interface ItemTextMatches {
  remote: boolean;
  tags: string[];
}
export async function scanItemText(text: string): Promise<ItemTextMatches> {
  const matcher = (m: string): boolean => !!text.match(new RegExp(m, "gi"));

  const remote = matcher("remote");
  const tags = await matchTags(text);

  return { remote, tags };
};

export async function upsertItems(itemIds: number[], storyId: number) {
  const limit = pLimit(20);

  const itemsInserted = await Promise.all(
    itemIds.map(async (itemId: number) => {
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

// TODO: get the latestStory
export async function getPopularTags(storyId: number) {
  const { data, error } = await supabase.from('StoryToTags')
                                 .select('tag')
                                 .order('count', { ascending: false })
                                 .eq('storyId', storyId)
                                 .limit(20)

  if (data === null || error) throw new Error(`Could not fetch popular tags! Error: ${error}`)

  return data.map(tag => tag.tag)
}
