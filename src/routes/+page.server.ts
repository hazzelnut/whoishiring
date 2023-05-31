import { getJobs, getLatestStory } from '$lib/fetch';
import { env } from "$env/dynamic/private";
import type { PageServerLoad } from './$types';


export const load = (async ({ url }) => {
  let storyId = url.searchParams.get('storyId')
  if (!storyId) {
    const latestStory = await getLatestStory()
    storyId = latestStory.id.toString()
  }

  const { data: posts, count: totalCount } = await getJobs(url)

  // https://fly.io/docs/postgres/managing/attach-detach/
  // Attached Postgres cluster to Fly App gives me access to the DATABASE_URL environment variable
  // console.log('DATABASE_URL: ', env.DATABASE_URL)

  return { posts, totalCount, storyId, startIndex: 0};
}) satisfies PageServerLoad;