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

interface StoryItemJson {
  by: string;
  id: number;
  kids: number[];
  title: string;
  time: number;
}

type loadFetch = (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>;
// Ref: https://github.com/gadogado/hn-hired/blob/main/scripts/get-latest-story.server.ts
export async function getLatestStoryAndItems(fetch: loadFetch): Promise<ItemJson[]> {
  const firebaseUrl = "https://hacker-news.firebaseio.com/v0";
  const firebaseStories = await fetch(
    `${firebaseUrl}/user/whoishiring/submitted.json`
  );
  const firebaseItem = (itemId: number) => `${firebaseUrl}/item/${itemId}.json`;

  // Re-use function to fetch whoishiring post and comments
  const fetchItemJson = async <T>(itemId: number): Promise<T> => {
    const url = firebaseItem(itemId);
    console.log(url)
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

  // Splicing makes it faster.
  // TODO: Transmit pagination for infinite scroll
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