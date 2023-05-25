import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { upsertStory, upsertItems, upsertStoryToTags, getLatestStoryHN } from "../shared/ingest.ts";

console.log("Hello from Functions!")

serve(async () => {
  /* Serverless data ingestion functions */
  const latestStoryHN = await getLatestStoryHN()
  const latestStory = await upsertStory(latestStoryHN)

  const latestItems = await upsertItems(latestStoryHN.kids, latestStory.id)
  if (!latestItems) throw new Error('Items userted could not be returned!')

  console.log(`Items updated: ${latestItems.length}`)

  // Keep a record of the counts for each tag in all the items 
  const tagsToCounts = latestItems.reduce((counts: Record<string, number>, item) => {
    if (item && item?.tags)
      item.tags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1
      })
    return counts
  }, {});

  console.log(`tagsToCounts: ${JSON.stringify(tagsToCounts)}`)

  // store this record in StoryToTags
  await upsertStoryToTags(tagsToCounts, latestStory.id)

  const dataStats = {
    message: `Upserted ${latestItems.length} and updated ${Object.keys(tagsToCounts).length} tags`
  }


  return new Response(
    JSON.stringify(dataStats),
    { headers: { "Content-Type": "application/json" } },
  )
})


// To invoke using httpie:
// http -A bearer \ 
// -a {API_KEY} \
// https://unlkhbznammyxxtrejhq.functions.supabase.co/cron-job-fetcher