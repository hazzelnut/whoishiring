import { upsertStory, getLatestStoryHN, upsertItems, upsertStoryToTags } from "./ingest";
import cron from "node-cron";

const ingest = async () => {
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
  
  console.log(dataStats)
}


/* Runs every 5 minutes */

cron.schedule("*/5 * * * *", ingest);
