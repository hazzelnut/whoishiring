<script lang="ts">
	import { formatDate, getTimeAgo } from '$lib/normalize';
  import type { PageData } from './$types';
  import { htmlToText } from 'html-to-text';
	import { browser } from '$app/environment';
  import { savedJobs } from '$lib/stores';
  import { onMount } from 'svelte';

  import { page } from '$app/stores';

	import Switch from '../components/button/Switch.svelte';
	import Button from '../components/button/Button.svelte';
	import Sort from '../components/button/Sort.svelte';

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
  // let savedPosts: Record<number, string>= {};
  // Inferred by IDE
  type Post = {
		  id: number;
      by: string;
      text: string;
      htmlText: string;
      firebaseCreatedAt: Date;
  }
  function handleSave(post: Post) {
    /* NOTE: Code for copying to clipboard */
    // const text = 
    //   `Posted: ${formatDate(post.firebaseCreatedAt)}` +
    //   '<br/><br/>\n\n' +
    //   `${post.htmlText}`;

    if (storyId in $savedJobs) {
      // Remove or Add to existing jobIds associated with storyId
      const updatedJobs = $savedJobs[storyId].includes(post.id)
        ? $savedJobs[storyId].filter(jobId => jobId !== post.id)
        : [...$savedJobs[storyId], post.id];

      savedJobs.update(saved => ({
        ...saved,
        [storyId]: updatedJobs,
      }));
    }
    else {
      // Create a new storyId to jobIds key-value
      savedJobs.set({[storyId]: [post.id]})
    }
    console.log(localStorage)

    /* NOTE: Code for copying to clipboard */
    // if (Object.hasOwn(savedPosts, post.id)) {
    //   const { [post.id]: _deletedPost, ...restPosts} = savedPosts
    //   savedPosts = restPosts;
    // } else {
    //   savedPosts = {...savedPosts, [post.id]: text}
    // }
  }

  /* Copy to Clipboard */
  // async function setClipboard(html: string) {
  //   const textType = "text/plain";
  //   const htmlType = "text/html";

  //   // TODO: refactor to not use htmlToText since I now have
  //   //       htmlText and text fields

  //   const htmlBlob = new Blob([html], { type: htmlType });
  //   const textBlob = new Blob([htmlToText(html)], { type: textType });

  //   const data = [new ClipboardItem({
  //     [textType]: textBlob,
  //     [htmlType]: htmlBlob
  //   })];

  //   await navigator.clipboard.write(data);
  // }

  // async function copyAllPosts() {
  //   let allPosts = '';

  //   allPosts = Object
  //     .values(savedPosts)
  //     .join('<br/><br/>\n\n === <br/><br/>\n\n');

  //   setClipboard(allPosts);
  // }

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


      // TODO: A button to share saved jobs; basically copies url
      // TODO: have a show all button next to results; reset the url
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

  /* Saved Jobs */
  let showSaved = false
  $: numJobs = $savedJobs[storyId]?.length ?? 0
  $: if (numJobs == 0) {
    showSaved = false
  }

  /* Search Input */
  let search = ''

  /* Changing url */
  $:tagsParam = ($page.url.searchParams.get('tags'))?.split(',')
  $:qParam = $page.url.searchParams.get('q')
  $:remoteParam = $page.url.searchParams.get('remote')
  $:savedParam = $page.url.searchParams.get('savedJobs')
  $:sortParam = $page.url.searchParams.get('sort')

</script>

<main>
  <form data-sveltekit-noscroll>
    <header>
      <span>Whoishiring</span>
      <div class="search-container">
        <input
          type="text"
          placeholder="Search..."
          bind:value={search}
        />

        <button type="submit" class="search-submit pointer">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg>
        </button>

        {#if qParam != null}
          <button class={`search-cancel pointer`} on:click={() => search = ''}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        {/if}

        <!-- Note: Order of reset button and submit button matters here;
            pressing 'enter' will target the nearest submit button -->

      </div>
    </header>


    {#if tags.length > 0}
      <div class="border-top pv-1">
        <div class="flex-and-row-wrap gap-half v-center min-h-4 mb-05">
          <span>Popular filters:</span>
          {#if tagsParam != null }
            <Button click={() => tagsToFilter = []}>Reset filters</Button>
          {/if}
        </div>
        <div class="tags-container flex-and-row-wrap gap-half">
          {#each tags as tag}
            <div><Button toggle={tagsParam?.includes(tag)} click={() => handleTags(tag)}>{tag}</Button></div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Buttons do a form submit without page refresh -->
    <div class="flex-and-row-wrap gap-half pv-1 border-top">
      <Sort click={() => toggleSort()} toggle={sortParam?.includes('newest')}>{sortParam || sort}</Sort>

      <Switch click={() => remote = !remote} toggle={remoteParam != null}>
          Remote only
      </Switch>

      <Switch click={() => showSaved = !showSaved} toggle={savedParam != null} disabled={numJobs == 0}>
        ({numJobs}) Saved only
      </Switch>
    </div>


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

    <!-- Use hidden input for search query -->
    {#if search.length > 0}
      <input
        type="hidden"
        name="q"
        value={search}
      />
    {/if}

    <!-- Use hidden input to send saved jobs to URL -->
    {#if showSaved}
      <input
        type="hidden"
        name="savedJobs"
        value={$savedJobs[storyId] ?? []}
      />
    {/if}



    <div class="border-top pv-1">{totalCount || 0} results</div>

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
            `${$savedJobs[storyId]?.includes(post.id) && "saved"}`
          }
          on:click={() => handleSave(post)}
        >
          {$savedJobs[storyId]?.includes(post.id) ? 'SAVED' : 'Save'}
        </button>
      </div>
      <br />
    {/each}
  </form>

  <footer bind:this={footer}>
    <small>Eric Chan, 2023</small>
  </footer>
</main>

<style>
  main {
    margin: 0 auto;
    padding: 1em;

    width: 64em;
    color: #3F2F24;
    /* TODO: Target body to be this background colour */
    background-color: #F5F5F0;
  }
  p {
    word-wrap: break-word;
  }
  button {
    height: 4em;
    width: 8em;
  }

  /* Mini utility-classes */
  .flex-and-row-wrap {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .gap-half {
    gap: 0.5em;
  }

  .pv-1 {
    padding: 1em 0;
  }

  .pv-05 {
    padding: 0.5em 0;
  }

  .mb-05 {
    margin-bottom: 0.5em
  }

  .v-center {
    align-items: center;
  }

  .min-h-4 {
    min-height: 4em;
  }

  .border-top {
    border-top: 1px solid #3F2F24;
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
  button.pointer {
    cursor: pointer;
  }

  /* Search Bar */
  input[type="text"] {
    padding: 1em 2.5em 1em 1em;
    font-size: 1em;

    border: 1px solid black;
    border-radius: 1em;
  }

  header {
    display: grid;
    place-items: center;
    row-gap: 2em;
  }

  div.search-container {
    position: relative;

    display: flex;
    align-items: center;
  }

  div.search-container > button {
    /* Resets */
    border: none;
    background: none;
  }

  button.search-cancel {
    position: absolute;
    right: 0em;

    height:  3em;
    width:  3em;
  }
  button.search-cancel > svg {
    stroke: #64748b;
  }

  button.search-submit {
    position: absolute;
    right: -3.0em;

    height:  3em;
    width:  3em;
  }
  button.search-submit > svg {
    fill: #64748b;
  }

  @media (max-width: 960px) {
    main {
      margin: 0;
      width: auto;
    }

    /* Show less tags in mobile view */
    .tags-container > :nth-child(n + 13){
      display: none;
    }
  }
</style>
