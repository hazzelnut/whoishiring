import { getJobs, getLatestStory } from '$lib/fetch';
import type { PageServerLoad } from './$types';


export const load = (async ({ url }) => {
  let storyId = url.searchParams.get('storyId')
  if (!storyId) {
    const latestStory = await getLatestStory()
    storyId = latestStory.id.toString()
  }

  const { data: posts, count: totalCount } = await getJobs(url)

  return { posts, totalCount, storyId, startIndex: 0};
}) satisfies PageServerLoad;