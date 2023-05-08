import { getItems, getJobs, getLatestStories, getLatestStoryHN, upsertItems, upsertStory } from '$lib/fetch';
import type { PageServerLoad } from './$types';
import { tags as popularTags } from '$lib/tags';


export const load = (async ({ url }) => {
  // Old: old way of loading data with supabase API
  // const postToLoad = await getJobsFromHN()
  // await addJobsToSupabase(postToLoad)

  // New: new way of loading data with Prisma
  // const latestStoryHN = await getLatestStoryHN()
  // const latestStory = await upsertStory(latestStoryHN)
  // console.log(latestStory)

  // await upsertItems(latestStoryHN.kids, latestStory)

  const stories = await getLatestStories()
  const initialStory = stories[0]

  const modifiedURL = new URL(url)
  modifiedURL.searchParams.append('storyId', String(initialStory?.id))

  const [totalCount, items] = await getItems(modifiedURL)

  // const {data: posts, count: totalCount } = await getJobs(url);
  // TODO: Need to return popular tags based on data ingestion time

  // return { posts, startIndex: 0, totalCount, popularTags };
  return { totalCount, items }
}) satisfies PageServerLoad;