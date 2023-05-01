import { getJobs } from '$lib/fetch';
import type { PageServerLoad } from './$types';
import { tags as popularTags } from '$lib/tags';


export const load = (async ({ url }) => {
  // const postToLoad = await getJobsFromHN()
  // await addJobsToSupabase(postToLoad)
  const tags = url.searchParams.get('tags')
  console.log(tags)

  const {data: posts, count: totalCount } = await getJobs(url);
  // TODO: Need to return popular tags based on data ingestion time

  return { posts, startIndex: 0, totalCount, popularTags };
}) satisfies PageServerLoad;