<script lang="ts">
	import { formatDate } from '$lib/normalize';
	import type { ExtendedItemJson } from '$lib/fetch';
	import { createClient } from '@supabase/supabase-js';
  import type { PageData } from './$types';
  import { htmlToText } from 'html-to-text';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

  export let data: PageData;
  // NOTE: Destructuring didn't work until I used $:
  //       for reactivity
  //       ie. let { posts } = data, doesn't update posts
  //       when used in the HTML part.


  $: posts = data.posts;
  $: startIndex = data.startIndex;
  $: totalCount = data.totalCount


  /* Sorting posts */
  let sort = 'newest';
  function toggleSort() {
    sort = sort === 'oldest' ? 'newest' : 'oldest'
  }

  /* Saved posts */
  // TODO: This can be a store
  let savedPosts: Record<number, string>= {};
  function handleSave(post: ExtendedItemJson) {

    const text = 
      `Posted: ${formatDate(post.time)}` +
      '<br/><br/>\n\n' +
      `${post.text}`;

    if (Object.hasOwn(savedPosts, post.id)) {
      const { [post.id]: _deletedPost, ...restPosts} = savedPosts
      savedPosts = restPosts;
    } else {
      savedPosts = {...savedPosts, [post.id]: text}
    }
  }

  /* Copy to Clipboard */
  async function setClipboard(html: string) {
    // TODO: Doesn't work on Safari Mobile :/
    const textType = "text/plain";
    const htmlType = "text/html";

    const htmlBlob = new Blob([html], { type: htmlType });
    const textBlob = new Blob([htmlToText(html)], { type: textType });

    const data = [new ClipboardItem({ 
      [textType]: textBlob,
      [htmlType]: htmlBlob
    })];

    await navigator.clipboard.write(data);
  }

  async function copyAllPosts() {
    let allPosts = '';

    allPosts = Object
      .values(savedPosts)
      .join('<br/><br/>\n\n === <br/><br/>\n\n');

    setClipboard(allPosts);
  }

  /* Fetch more posts */

  // Imagine backend api call on trigger from scroll behaviour
  async function getJobs(startIndex: number, url: URL):  Promise<{data: ExtendedItemJson[], count: number}> {
    const sort = url.searchParams.get('sort') || 'newest';
    const q = url.searchParams.get('q') || '';

    const supabaseUrl = 'https://unlkhbznammyxxtrejhq.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVubGtoYnpuYW1teXh4dHJlamhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODIwMzQwNTEsImV4cCI6MTk5NzYxMDA1MX0.2Ir-NGcSDnFqe9e1jNNOVkaswsdaWtPKGwHB91Psq-Q'
    const supabase = createClient(supabaseUrl, supabaseKey);

    const query = supabase.from("jobs")
                          .select('*', { count: 'exact' })
                          .order('time', { ascending: sort === 'oldest'})
                          .range(startIndex, startIndex + 11)

    if (q) {
      // <-> Means the match for a word followed immediately
      //     by a match of the next word
      //     ex. 'full stack': Match for 'full' immediately followed by match for 'stack'
      const arr = q.split(/\s+/);
      const result = arr.map(word => `'${word}'`).join(' <-> ');

      query.textSearch('fts', result)
    }

    const { data, count } = await query

    return {
      data: data as ExtendedItemJson[],
      count: count as number
    };
  }

  async function loadMoreJobs() {
    if (startIndex > totalCount) return

    startIndex = startIndex + 12

    const url = new URL(window.location.href)

    // For pagination
    url.searchParams.append('startIndex', startIndex.toString())

    const response = await fetch('/api/posts?' + url.searchParams.toString())
    const { data: morePosts } = await response.json()

    posts = [...posts, ...morePosts]
  }

  /* Infinite scroll */
  // Ref: https://github.com/rodneylab/sveltekit-instagram-infinite-scroll/blob/main/src/routes/%2Bpage.svelte
  let footer: Element;
  onMount(() => {
    if (browser) {
      const options = { threshold: 0, rootMargin: '0% 0% 300%'};
      const observer = new IntersectionObserver(loadMoreJobs, options);
      if (footer) observer.observe(footer)
    }
  });


</script>

<main>
  <!-- TODO: There's a progress bar for how far I'm scrolling. ie how many job posts left to read -->
  <form>
    <input type="search" name="q"/>
    <button>Search</button>
    <input
      type="submit"
      name="sort"
      value={sort}
      on:click={() => toggleSort()}
    />
  </form>

  <div class="savedStats">
    <button on:click={() => copyAllPosts()}>Copy</button>
    Saved Posts: {Object.keys(savedPosts).length}
  </div>

  <p>{totalCount} results</p>

  {#each posts as post}
    <div class="post">
      <div class="postInfo">
        <p>{post.by}</p>
        <p class="timeAgo">{post.timeAgo}</p>
      </div>
      <p class="content">{@html post.text}</p>
      <button
        class={
          'saveBtn ' +
          `${Object.hasOwn(savedPosts, post.id) && "saved"}`
        }
        on:click={() => handleSave(post)}
      >
        {Object.hasOwn(savedPosts, post.id) ? 'SAVED' : 'Save'}
      </button>
    </div>
    <br />
  {/each}
  <footer bind:this={footer}>
    <small>Eric Chan, 2023</small>
  </footer>
</main>

<style>
  main {
    padding: 1em;
  }
  p {
    word-wrap: break-word;
  }
  button {
    height: 4em;
    width: 8em;
  }

  div.savedStats {
    margin: 1em 0;
  }
  div.post {
    position: relative;
    margin: 1em 0;
    padding: 1em;
    border: 1px solid black;
    border-radius: 1em;
  }
  div.postInfo{
    font-weight: bold;
  }
  p.timeAgo {
    color: rgb(77, 163, 183);
  }
  p.content {
    /* NOTE: Fix for horizonal scrolling? */
    overflow-y: hidden;
  }

  button.saveBtn {
    position: absolute;
    top: 1em;
    right: 1em;
  }
  button.saved {
    font-weight: bolder;
    color: rgb(90, 188, 106);
  }
</style>