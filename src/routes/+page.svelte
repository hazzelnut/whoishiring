<script lang="ts">
	import { formatDate, getTimeAgo } from '$lib/normalize';
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
  $: storyId = data.storyId


  /* Sorting posts */
  let sort = 'newest';
  function toggleSort() {
    sort = sort === 'oldest' ? 'newest' : 'oldest'
  }

  /* Saved posts */
  let savedPosts: Record<number, string>= {};
  // Inferred by IDE
  type Post = {
		  id: number;
      by: string;
      text: string;
      htmlText: string;
      firebaseCreatedAt: Date;
  }
  function handleSave(post: Post) {
    const text = 
      `Posted: ${formatDate(post.firebaseCreatedAt)}` +
      '<br/><br/>\n\n' +
      `${post.htmlText}`;
    

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

    // TODO: refactor to not use htmlToText since I now have
    //       htmlText and text fields 

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
  async function loadMoreJobs() {
    if (startIndex > totalCount || totalCount == 0) return

    startIndex = startIndex + 12

    const url = new URL(window.location.href)

    // For pagination
    url.searchParams.append('startIndex', startIndex.toString())

    const response = await fetch('/api/posts?' + url.searchParams.toString())
    const { data: morePosts } = await response.json()

    if (morePosts?.length > 0) {
      posts = [...posts, ...morePosts]
    }
  }

  /* Infinite scroll */
  // Ref: https://github.com/rodneylab/sveltekit-instagram-infinite-scroll/blob/main/src/routes/%2Bpage.svelte
  let footer: Element
  let tags: string[] = []
  onMount(async () => {
    if (browser) {
      const options = { threshold: 0, rootMargin: '0% 0% 300%'};
      const observer = new IntersectionObserver(loadMoreJobs, options);
      if (footer) observer.observe(footer)

      /* Load Tags */
      const url = new URL(window.location.href)
      const response = await fetch('/api/tags?' + url.searchParams.toString())
      tags = await response.json()
    }
  });

  /* Tags */
  let tagsToFilter: string[] = [];
  function handleTags(tag: string) {
    if (tagsToFilter.includes(tag)) {
      tagsToFilter = tagsToFilter.filter((t) => t !== tag);
    } else {
      tagsToFilter = [...tagsToFilter, tag];
    }
  }

  /* Remote toggle */
  let remote = false

</script>

<main>
  <form>
    <input type="search" name="q"/>
    <button>Search</button>

    <br />
    <button on:click={() => toggleSort()}>{sort}</button>

    <br />
    {#if tags.length > 0}
      <span>Popular filters:</span>
      <button on:click={() => tagsToFilter = []}>Reset filters</button>
      {#each tags as tag}
        <button on:click={() => handleTags(tag)}>{tag}</button>
      {/each}
    {/if}

    <br />

    <!-- Buttons do a form submit without page refresh -->
    <button on:click={() => remote = !remote}>Remote Only: {remote}</button>

    <!-- Use hidden input to send sort filter to URL -->
    <input
      type="hidden"
      name="sort"
      value={sort}
    />

    <!-- Hidden input for story id -->
    <input
      type="hidden"
      name="storyId"
      value={storyId}
    />

    <!-- Use hidden input to send remote filter to URL -->
    {#if remote}
      <input
        type="hidden"
        name="remote"
        value={remote}
      />
    {/if}

    <!-- Use hidden input to send tags info in URL -->
    {#if tagsToFilter.length > 0}
      <input 
        type="hidden"
        name="tags"
        value={tagsToFilter}
      />
    {/if}

  </form>

  <div class="savedStats">
    <button on:click={() => copyAllPosts()}>Copy</button>
    Saved Posts: {Object.keys(savedPosts).length}
  </div>

  <p>{totalCount || 0} results</p>

  {#each posts as post}
    <div class="post">
      <div class="postInfo">
        <p>{post.by}</p>
        <p class="timeAgo">{getTimeAgo(post.firebaseCreatedAt)}</p>
      </div>
      <p class="content">{@html post.htmlText}</p>
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