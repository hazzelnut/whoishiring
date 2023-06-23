import { getJobs, getLatestStory } from '$lib/fetch';
import type { PageServerLoad } from './$types';


export const load = (async ({ url }) => {
  let storyId = url.searchParams.get('storyId')
  if (!storyId) {
    const latestStory = await getLatestStory()
    storyId = latestStory.id.toString()
  }

  // BUG: When it reaches the 1st of the month, and the data hasn't been loaded this will result in no posts being
  // shown to the user

  const { data: posts, count: totalCount } = await getJobs(url)

  return { posts, totalCount, storyId, startIndex: 0};
}) satisfies PageServerLoad;