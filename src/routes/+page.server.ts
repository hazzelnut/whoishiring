import { getJobs, getLatestStoryHN, getPopularTags, upsertItems, upsertStory, upsertStoryToTags } from '$lib/fetch';
import type { PageServerLoad } from './$types';


export const load = (async ({ url }) => {
  // /* Serverless data ingestion functions */
  // const latestStoryHN = await getLatestStoryHN()
  // const latestStory = await upsertStory(latestStoryHN)
  // if (!latestStory) throw new Error('Latest story upserted could not be returned!')

  // const latestItems = await upsertItems(latestStoryHN.kids, latestStory.id)
  // if (!latestItems) throw new Error('Items userted could not be returned!')

  // // Keep a record of the counts for each tag in all the items 
  // const tagsToCounts = latestItems.reduce((counts: Record<string, number>, item) => {
  //   if (item && item?.tags)
  //     item.tags.forEach(tag => {
  //       counts[tag] = (counts[tag] || 0) + 1
  //     })
  //   return counts
  // }, {});

  // // store this record in StoryToTags
  // await upsertStoryToTags(tagsToCounts, latestStory.id)

  const storyId = 1
  const { data: posts, count: totalCount } = await getJobs(url)
  const popularTags = await getPopularTags(storyId)

  return { posts, startIndex: 0, totalCount, popularTags };
}) satisfies PageServerLoad;