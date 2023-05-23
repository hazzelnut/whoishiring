import pLimit from "p-limit";
import supabase from "./supabase/client";

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
    itemIds.map((itemId: number) => {
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
  const remote = url.searchParams.get('remote') || ''

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

  if (remote === 'true') {
    query.eq('remote', remote)
  }

  const { data, count, error } = await query

  // BUG: Sometimes range is not satifiable, fix?
  if (data === null || count === null || error) throw new Error(`Could not fetch any items. Error: ${JSON.stringify(error)}`)

  return {
    data,
    count,
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