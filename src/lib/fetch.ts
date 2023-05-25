import supabase from "./supabase/client";

export async function getLatestStory() {
  const { data, error } = await supabase.from('Story')
                                 .select()
                                 .order('firebaseCreatedAt', { ascending: false })
                                 .limit(1)
                                 .single()

  if (!data || error) throw new Error(`Could not fetch latest story! Error: ${error}`)
  return data
}


// Get job postings from Supabase
export async function getJobs(url: URL) {
  const sort = url.searchParams.get('sort') || 'newest';
  const q = url.searchParams.get('q')?.trim() || '';
  const tags = url.searchParams.get('tags') || '';
  const startIndex = Number(url.searchParams.get('startIndex')) || 0
  const remote = url.searchParams.get('remote') || ''

  let storyId = url.searchParams.get('storyId');
  if (!storyId) {
    const latestStory = await getLatestStory()

    storyId = (latestStory.id).toString()
  }

  const query = supabase.from('Item')
                        .select('id, by, text, htmlText, firebaseCreatedAt', { count: 'exact' })
                        .order('firebaseCreatedAt', { ascending: sort === 'oldest'})
                        .range(startIndex, startIndex + 11)
                        .eq('storyId', storyId)

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

  if (remote === 'true') {
    query.eq('remote', remote)
  }

  const { data, count, error } = await query

  // BUG: Sometimes range is not satifiable, fix?
  if (data === null || count === null || error) throw new Error(`Could not fetch any items. Error: ${JSON.stringify(error)}`)

  return {
    data,
    count,
  }
}


// TODO: get the latestStory
export async function getPopularTags(storyId: number) {
  const { data, error } = await supabase.from('StoryToTags')
                                 .select('tag')
                                 .order('count', { ascending: false })
                                 .eq('storyId', storyId)
                                 .limit(20)

  if (data === null || error) throw new Error(`Could not fetch popular tags! Error: ${error}`)

  return data.map(tag => tag.tag)
}