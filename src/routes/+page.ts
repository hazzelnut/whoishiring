import type { PageLoad } from './$types';
import pLimit from "p-limit";

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

interface ExtendedItemJson extends ItemJson {
  timeAgo: string;
} 


function getTimeAgo(timestamp: number) {
  const currentDate = new Date();
  const previousDate = new Date(timestamp * 1000); // convert to milliseconds
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  // NOTE: If we want less granularity than days
  // const millisecondsPerWeek = 7 * millisecondsPerDay;
  // const millisecondsPerMonth = 30.44 * millisecondsPerDay;

  const timeDiff = currentDate.getTime() - previousDate.getTime();
  const daysAgo = Math.floor(timeDiff / millisecondsPerDay);
  // NOTE: If we want less granularity than days
  // const weeksAgo = Math.floor(timeDiff / millisecondsPerWeek);
  // const monthsAgo = Math.floor(timeDiff / millisecondsPerMonth);

  return daysAgo == 1 ? `${daysAgo} day ago`: `${daysAgo} days ago`;
}

/* Fetch Job Postings */
type loadFetch = (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>;
// Ref: https://github.com/gadogado/hn-hired/blob/main/scripts/get-latest-story.server.ts
async function getLatestStoryAndItems(fetch: loadFetch): Promise<ItemJson[]> {
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

 
export const load = (async ({ fetch }) => {
  // NOTE: Getting data from external API in getLatestStoryAndItems,
  //       so using provided fetch in load() function.
  //       Also prevents browser warnings from Svelte for using
  //       browser fetch.
  // Ref:  https://kit.svelte.dev/docs/load#making-fetch-requests
  let posts = await getLatestStoryAndItems(fetch);

  // Sort by latest to oldest
  posts.sort((postA, postB) => postB.time - postA.time);

  // filter dead and deleted posts
  posts = posts.filter(post => !post?.dead && !post?.deleted);

  // Add a few nice-to-have params to display on front-end
  const updatedPosts = posts.map(post => ({
    ...post,
    timeAgo: getTimeAgo(post.time)}
  )) as ExtendedItemJson[];

  return { posts: updatedPosts };
}) satisfies PageLoad;