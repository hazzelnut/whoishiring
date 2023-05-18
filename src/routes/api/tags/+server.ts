import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"
import { getLatestStory, getPopularTags } from "$lib/fetch"

export const GET = ( async ({ url }): Promise<Response> => {
  let data;
  const storyId = url.searchParams.get('storyId')
  
  if (!storyId) {
    const story = await getLatestStory()
    data = await getPopularTags(story.id)
  } else {
    data = await getPopularTags(parseInt(storyId))
  }


  return json(data)
}) satisfies RequestHandler