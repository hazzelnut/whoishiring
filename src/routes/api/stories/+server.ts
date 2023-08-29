import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"
import { getAllStories } from "$lib/fetch"

export const GET = ( async (): Promise<Response> => {
  const data = await getAllStories()

  return json(data)
}) satisfies RequestHandler