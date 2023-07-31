import type { RequestHandler } from "./$types"

export const POST = ( async ({ url, request, fetch }): Promise<Response> => {
  return await fetch("https://plausible.io/api/event", {
    method: "post",
    headers: {
      "User-Agent": request.headers.get("User-Agent") ?? "None",
      "X-Forwarded-For": url.hostname,
      "Content-Type": "application/json",
    },
    body: await request.text(),
  });
}) satisfies RequestHandler