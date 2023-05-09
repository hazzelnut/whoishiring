import { getJobs, getLatestStoryHN, upsertItems, upsertStory } from '$lib/fetch';
import type { PageServerLoad } from './$types';


export const load = (async ({ url }) => {
  // const postToLoad = await getJobsFromHN()
  // await addJobsToSupabase(postToLoad)

  // const {data: posts, count: totalCount } = await getJobs(url);
  // TODO: Need to return popular tags based on data ingestion time
  const latestStoryHN = await getLatestStoryHN()
  const latestStory = await upsertStory(latestStoryHN)
  if (!latestStory) throw new Error('Latest story upserted could not be returned!')

  const items = await upsertItems(latestStoryHN.kids, latestStory.id)
  if (!items) throw new Error('Items userted could not be returned!')

  // Keep a record of the counts for each tag in all the items 
  const tagsToCounts = items.reduce((counts: Record<string, number>, item) => {
    if (item && item?.tags)
      item.tags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1
      })
    return counts
  }, {});

  console.log('Record of tag popularity: ', tagsToCounts)
  // Need to sort by count and popularity?

  // return { posts, startIndex: 0, totalCount, popularTags };
}) satisfies PageServerLoad;