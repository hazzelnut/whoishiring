import type { RequestHandler } from "./$types"

export const GET = ( async (): Promise<Response> => {
  const response = await fetch("https://plausible.io/js/script.js")
  return new Response(response.body, {
    headers: {
      'Content-type': 'application/javascript'
    }
  })
}) satisfies RequestHandler