import { getJobs } from '$lib/fetch';
import type { PageServerLoad } from './$types';


export const load = (async ({ url }) => {
  // const postToLoad = await getJobsFromHN()
  // await addJobsToSupabase(postToLoad)

  const {data: posts, count: totalCount } = await getJobs(url);

  return { posts, startIndex: 0, totalCount };
}) satisfies PageServerLoad;