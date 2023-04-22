import { createClient } from '@supabase/supabase-js';
import { getLatestStoryAndItems, type ItemJson } from '../lib/fetch';
import { getTimeAgo } from '../lib/normalize';
import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

export interface ExtendedItemJson extends ItemJson {
  timeAgo: string;
} 

async function getJobs(): Promise<ExtendedItemJson[]> {
  const supabaseUrl = 'https://unlkhbznammyxxtrejhq.supabase.co'
  const supabaseKey = env.SUPABASE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);
  const response = await supabase.from("jobs").select();
  // NOTE: Can't guarantee type here if we edit DB
  //       would prisma solve this?
  return response.data as ExtendedItemJson[];
}

// TODO: Write serverless function to run
// cron job to fill data into supabase database
// to add complete data

/*  Serverless function to cron to insert into Supabase */
async function addJobsToSupabase(posts: ExtendedItemJson[]) {
  const supabaseUrl = 'https://unlkhbznammyxxtrejhq.supabase.co'
  const supabaseKey = env.SUPABASE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);
  posts.map(async (post) => {
    try {
      const response = await supabase.from("jobs").insert({
        ...post,
        kids: JSON.stringify(post?.kids || []),
        json: JSON.stringify(post)
      });
      console.log(response);
    } catch(e) {
      console.error(e)
    }
  });
}

async function getJobsFromHN(): Promise<ExtendedItemJson[]> {
  // Ref:  https://kit.svelte.dev/docs/load#making-fetch-requests
  let posts = await getLatestStoryAndItems(fetch);

  // filter dead and deleted posts
  posts = posts.filter(post => !post?.dead && !post?.deleted);

  // Add a few nice-to-have params to display on front-end
  // but insert into Supabase DB
  const updatedPosts = posts.map(post => ({
    ...post,
    timeAgo: getTimeAgo(post.time)}
  )) as ExtendedItemJson[];

  return updatedPosts;
}



export const load = (async ({ url }) => {
  const sort = url.searchParams.get('sort');
  const posts = await getJobs();

  // Sort by latest to oldest;
  // Faster to sort client side than in a order query
  // to Supabase
  if (sort == 'oldest') {
    posts.sort((postA, postB) => postA.time - postB.time);
  } else {
    posts.sort((postA, postB) => postB.time - postA.time);
  }

  return { posts };
}) satisfies PageServerLoad;