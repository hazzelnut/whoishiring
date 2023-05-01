import { env } from "$env/dynamic/private";
import { createClient } from "@supabase/supabase-js";
import { getTimeAgo } from "./normalize";
import pLimit from "p-limit";

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
type loadFetch = (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>;
export async function getLatestStoryAndItems(fetch: loadFetch): Promise<ItemJson[]> {
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



// Get job postings from Supabase
export async function getJobs(url: URL):  Promise<{data: ExtendedItemJson[], count: number}> {
  const sort = url.searchParams.get('sort') || 'newest';
  const q = url.searchParams.get('q')?.trim() || '';
  const startIndex = Number(url.searchParams.get('startIndex')) || 0

  const supabaseUrl = 'https://unlkhbznammyxxtrejhq.supabase.co'
  const supabaseKey = env.SUPABASE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const query = supabase.from("jobs")
                        .select('*', { count: 'exact' })
                        .order('time', { ascending: sort === 'oldest'})
                        .range(startIndex, startIndex + 11)

  if (q) {
    // <-> Means the match for a word followed immediately
    //     by a match of the next word
    //     ex. 'full stack': Match for 'full' immediately followed by match for 'stack'
    const arr = q.split(/\s+/);
    const result = arr.map(word => `'${word}'`).join(' <-> ');

    console.log(result)
    query.textSearch('fts', result)
  }

  // BUG: Pagination is breaking the search :/
  // TODO: Search pagination doesn't work when sorted.
  //       First newest isn't the last of oldest sorted.

  // NOTE: Serverless function should also index the text column to make search faster
  // Ref: https://supabase.com/docs/guides/database/full-text-search#searchable-columns

  const { data, count } = await query

  // NOTE: Can't guarantee type here if we edit DB
  //       would prisma solve this?
  return {
    data: data as ExtendedItemJson[],
    count: count as number
  };
}


/****** Serverless code for data ingestion *******/
// TODO: Write serverless function to run
// cron job to fill data into supabase database
// to add complete data

/*  Serverless function to cron to insert into Supabase */
export async function addJobsToSupabase(posts: ExtendedItemJson[]) {
  const supabaseUrl = 'https://unlkhbznammyxxtrejhq.supabase.co'
  const supabaseKey = env.SUPABASE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);
  posts.map(async (post) => {
    try {
      const response = await supabase.from("jobs").insert({
        ...post,
        kids: JSON.stringify(post?.kids || []),
        json: JSON.stringify(post)
      });
      console.log(response);
    } catch(e) {
      console.error(e)
    }
  });
}

export async function getJobsFromHN(): Promise<ExtendedItemJson[]> {
  // Ref:  https://kit.svelte.dev/docs/load#making-fetch-requests
  let posts = await getLatestStoryAndItems(fetch);

  // filter dead and deleted posts
  posts = posts.filter(post => !post?.dead && !post?.deleted);

  // Add a few nice-to-have params to display on front-end
  // but insert into Supabase DB
  const updatedPosts = posts.map(post => ({
    ...post,
    timeAgo: getTimeAgo(post.time)}
  )) as ExtendedItemJson[];

  return updatedPosts;
}