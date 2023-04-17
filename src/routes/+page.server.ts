import { getLatestStoryAndItems, type ItemJson } from '../lib/fetch';
import { getTimeAgo } from '../lib/normalize';
import type { PageServerLoad } from './$types';

interface ExtendedItemJson extends ItemJson {
  timeAgo: string;
} 

export const prerender = true;

export const load = (async ({ fetch, url }) => {
  const sort = url.searchParams.get('sort');
  // NOTE: Prevents browser warnings from Svelte for using
  //       browser fetch on external URLs.
  // Ref:  https://kit.svelte.dev/docs/load#making-fetch-requests
  let posts = await getLatestStoryAndItems(fetch);

  // Sort by latest to oldest
  if (sort == 'newest') {
    posts.sort((postA, postB) => postB.time - postA.time);
  } else {
    posts.sort((postA, postB) => postA.time - postB.time);
  }

  // filter dead and deleted posts
  posts = posts.filter(post => !post?.dead && !post?.deleted);

  // Add a few nice-to-have params to display on front-end
  const updatedPosts = posts.map(post => ({
    ...post,
    timeAgo: getTimeAgo(post.time)}
  )) as ExtendedItemJson[];

  return { posts: updatedPosts };
}) satisfies PageServerLoad;