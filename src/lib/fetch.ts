import { env } from "$env/dynamic/private";
import { createClient } from "@supabase/supabase-js";
import { getTimeAgo } from "./normalize";
import pLimit from "p-limit";
import prisma from "./prisma";
import type { Story } from "@prisma/client";
import { Prisma } from "@prisma/client";

export interface ItemJson {
  by: string;
  id: number;
  parent: number;
  text: string;
  time: number;
  type: string;
  deleted?: boolean;
  dead?: boolean;
  kids?: number[];
}

export interface ExtendedItemJson extends ItemJson {
  timeAgo: string;
}

interface StoryItemJson {
  by: string;
  id: number;
  kids: number[];
  title: string;
  time: number;
}

export async function getLatestStoryHN(): Promise<StoryItemJson> {
  const firebaseUrl = "https://hacker-news.firebaseio.com/v0";
  const firebaseStories = await fetch(
    `${firebaseUrl}/user/whoishiring/submitted.json`
  );

  const stories = (await firebaseStories.json()) as Array<number>;

  // The first story from whoishiring user
  // is always the latest 'Ask HN: Who is Hiring?'
  const storyId = stories[0];
  const latest = await fetchItemJson<StoryItemJson>(storyId);

  if (!latest?.title?.match(/Ask HN: Who is hiring/)) {
    throw new Error("Story is not 'who is hiring'");
  }

  return latest
}

//  Function to fetch whoishiring post and comments
export async function fetchItemJson<T>(itemId: number): Promise<T> {
  const firebaseUrl = "https://hacker-news.firebaseio.com/v0";
  const firebaseItem = (itemId: number) => `${firebaseUrl}/item/${itemId}.json`;

  const url = firebaseItem(itemId);
  const resp = await fetch(url);
  const json = (await resp.json()) as T;
  return json;
};

export async function upsertStory(storyHN: StoryItemJson): Promise<Story> {
  const { id: firebaseId, title } = storyHN
  const upsert = {
    firebaseCreatedAt: new Date(storyHN.time * 1000),
    firebaseId,
    title,
  }

  return await prisma.story.upsert({
    where: { firebaseId },
    create: { ...upsert },
    update: {},
  })
}

export async function upsertItems(itemIds: Array<number>, story: Story) {
  const limit = pLimit(20);
  await Promise.all(
    itemIds.map(async (itemId: number) => {
      limit(async () => {
        const item = await fetchItemJson<ItemJson>(itemId);

        if (!item || item?.deleted || item?.dead) {
          console.log('--- skipping ---', item)
          return
        }

        // Filter item, collect data to conform to prisma model and upsert into DB
        const { by, time, text, id: firebaseId } = item;
        const { remote, tags } = await scanItemText(text)
        const upsert = {
          by,
          text,
          remote,
          firebaseId,
          firebaseCreatedAt: new Date(time * 1000),
          json: item as object,
          storyId: story.id,
          tags: {
            connect: tags.map((tag) => ({ name: tag }))
          }
        }

        const record = await prisma.item.findUnique({
          where: { firebaseId },
          include: { tags: true }
        })

        // const create = async () => prisma.item.upsert({ 
        //   where: { firebaseId },
        //   create: { ...upsert },
        //   update: {},
        // })
        const create = async () => prisma.item.create({ data: upsert })

        if (!record) {
          try {
            await create()
          } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError)
              await create() // retry
          }
        }
      })
    })
  );
}

export async function getLatestStories() {
  return prisma.story.findMany({
    take: 12,
    orderBy: [{ firebaseCreatedAt: "desc" }],
  });
}

export async function getItems(url: URL) {
  const sort = url.searchParams.get('sort') || 'newest';
  const q = url.searchParams.get('q')?.trim() || '';
  const tags = url.searchParams.get('tags') || '';
  const startIndex = Number(url.searchParams.get('startIndex')) || 0


  const firebaseCreatedAt =
    sort === "newest" ? Prisma.SortOrder.desc : Prisma.SortOrder.asc;


  // TODO: Add storyId to the URL
  const storyId = Number(url.searchParams.get('storyId'))

  const where = {
    storyId,
    // ...(remote && { remote }),
    ...(q && { text: { search: `'${q}'` } }),
    // ...(filters?.length && {
    //   AND: slugs?.map((slug) => ({
    //     tags: {
    //       some: {
    //         slug: {
    //           equals: slug,
    //         },
    //       },
    //     },
    //   })),
    // }),
  }

  return prisma.$transaction([
    prisma.item.count({ where }),
    prisma.item.findMany({
      take: 12,
      where,
      orderBy: [{ firebaseCreatedAt }]
    })
  ])
}

export async function matchTags(text: string) {
  const tags = await prisma.tag.findMany({ select: { name: true } });
  if (!tags.length) throw new Error("Missing Tags.");

  const slugs = tags.map((tag) => tag.name);
  return slugs.reduce((accum: string[], slug) => {
    const escaped = slug.replace(/(\.|\+)/g, `\\$&`);
    const re = new RegExp(escaped, "gi");

    if (text.match(re)) accum.push(slug);
    return accum;
  }, []);
};

interface ItemTextMatches {
  remote: boolean;
  tags: string[];
}
export async function scanItemText(text: string): Promise<ItemTextMatches> {
  const matcher = (m: string): boolean => !!text.match(new RegExp(m, "gi"));

  const remote = matcher("remote");
  const tags = await matchTags(text);

  return { remote, tags };
};


// Fetch posts from HN
export async function getLatestStoryAndItems(): Promise<ItemJson[]> {
  // Ref: https://github.com/gadogado/hn-hired/blob/main/scripts/get-latest-story.server.ts
  const firebaseUrl = "https://hacker-news.firebaseio.com/v0";
  const firebaseStories = await fetch(
    `${firebaseUrl}/user/whoishiring/submitted.json`
  );
  const firebaseItem = (itemId: number) => `${firebaseUrl}/item/${itemId}.json`;

  // Re-use function to fetch whoishiring post and comments
  const fetchItemJson = async <T>(itemId: number): Promise<T> => {
    const url = firebaseItem(itemId);
    const resp = await fetch(url);
    const json = (await resp.json()) as T;
    return json;
  };

  const stories = (await firebaseStories.json()) as Array<number>;

  // The first story from whoishiring user
  // is always the latest 'Ask HN: Who is Hiring?'
  const storyId = stories[0];
  const latest = await fetchItemJson<StoryItemJson>(storyId);

  if (!latest?.title?.match(/Ask HN: Who is hiring/)) {
    throw new Error("Story is not 'who is hiring'");
  }

  const itemIds = latest.kids; 

  // NOTE: Is concurreny of 20 promises running
  // okay with Vercel?
  const limit = pLimit(20);
  const jobPosts: Array<ItemJson> = await Promise.all(
    itemIds.map(async (itemId: number) => {
      return limit(async () => {
        return await fetchItemJson<ItemJson>(itemId);
      })
    })
  );

  return jobPosts;
}



// Get job postings from Supabase
export async function getJobs(url: URL):  Promise<{data: ExtendedItemJson[], count: number}> {
  const sort = url.searchParams.get('sort') || 'newest';
  const q = url.searchParams.get('q')?.trim() || '';
  const tags = url.searchParams.get('tags') || '';
  const startIndex = Number(url.searchParams.get('startIndex')) || 0

  const supabaseUrl = 'https://unlkhbznammyxxtrejhq.supabase.co'
  const supabaseKey = env.SUPABASE_KEY as string;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const query = supabase.from("jobs")
                        .select('*', { count: 'exact' })
                        .order('time', { ascending: sort === 'oldest'})
                        .range(startIndex, startIndex + 11)

  if (q) {
    console.log('query: ', q)
    query.textSearch('fts', `'${q}'`)
  }

  if (tags) {
    const arr = tags.split(',');
    const result = arr.map(word => `'${word}'`).join(' & ');
    console.log('tags: ', result)

    query.textSearch('fts', result)
  }

  // BUG: Pagination is breaking the search :/
  // TODO: Search pagination doesn't work when sorted.
  //       First newest isn't the last of oldest sorted.

  // NOTE: Serverless function should also index the text column to make search faster
  // Ref: https://supabase.com/docs/guides/database/full-text-search#searchable-columns

  const { data, count } = await query

  // NOTE: Can't guarantee type here if we edit DB
  //       would prisma solve this?
  return {
    data: data as ExtendedItemJson[],
    count: count as number
  };
}

/****** Serverless code for data ingestion *******/
// TODO: Write serverless function to run
// cron job to fill data into supabase database
// to add complete data

/*  Serverless function to cron to insert into Supabase */
export async function addJobsToSupabase(posts: ExtendedItemJson[]) {
  const supabaseUrl = 'https://unlkhbznammyxxtrejhq.supabase.co'
  const supabaseKey = env.SUPABASE_KEY as string;
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

export async function getJobsFromHN(): Promise<ExtendedItemJson[]> {
  // Ref:  https://kit.svelte.dev/docs/load#making-fetch-requests
  let posts = await getLatestStoryAndItems();

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