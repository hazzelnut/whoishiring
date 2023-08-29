import { getJobs } from '$lib/fetch';
import type { PageServerLoad } from './$types';


export const load = (async ({ url }) => {
  const { data: posts, count: totalCount, storyId } = await getJobs(url)

  return { posts, totalCount, storyId, startIndex: 0};
}) satisfies PageServerLoad;