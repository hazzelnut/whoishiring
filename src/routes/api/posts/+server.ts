import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"
import { getJobs } from "$lib/fetch"

export const GET = ( async ({ url }): Promise<Response> => {
  const data = await getJobs(url)

  return json(data)
}) satisfies RequestHandler