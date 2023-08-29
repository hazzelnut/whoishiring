<script lang="ts">
  import type { PageData } from './$types';
	import { browser } from '$app/environment';
  import { savedJobs } from '$lib/stores';
  import { onMount } from 'svelte';

  import { page } from '$app/stores';

	import Switch from '../components/button/Switch.svelte';
	import Button from '../components/button/Button.svelte';
	import Sort from '../components/button/Sort.svelte';
	import Reset from '../components/button/Reset.svelte';
	import Post from '../components/post/Post.svelte';
	import Placeholder from '../components/placeholder/Placeholder.svelte';
	import { formatDate } from '$lib/normalize';

  export let data: PageData;
  // NOTE: Destructuring didn't work until I used $:
  //       for reactivity
  //       ie. let { posts } = data, doesn't update posts
  //       when used in the HTML part.


  $: posts = data.posts;
  $: startIndex = data.startIndex;
  $: totalCount = data.totalCount
  $: storyId = data.storyId


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

  /* Changing url */
  $:tagsParam = ($page.url.searchParams.get('tags'))?.split(',')
  $:qParam = $page.url.searchParams.get('q')
  $:remoteParam = $page.url.searchParams.get('remote')
  $:savedParam = $page.url.searchParams.get('savedJobs')
  $:sortParam = $page.url.searchParams.get('sort')

  /* Sorting posts */
  let sort = 'newest';
  function toggleSort() {
    sort = sort === 'oldest' ? 'newest' : 'oldest'
  }

  /* Remote toggle */
  let remote = false

  /* Saved jobs toggle */
  let showSaved = false
  $: numJobs = $savedJobs[storyId]?.length ?? 0
  $: if (numJobs == 0) {
    showSaved = false
  }

  /* Infinite scroll */
  // Ref: https://github.com/rodneylab/sveltekit-instagram-infinite-scroll/blob/main/src/routes/%2Bpage.svelte
  let footer: Element
  let tagsResponse: Response
  let storiesResponse: Response
  onMount(async () => {
    if (browser) {
      // Updates toggles based on URL params after DOM loads
      /* Remote toggle */
      remote = remoteParam != null

      /* Sort toggle */
      sort = sortParam || 'newest'

      /* Saved Jobs toggle */
      showSaved = !(numJobs === 0) && savedParam != null

      const options = { threshold: 0, rootMargin: '0% 0% 300%'};
      const observer = new IntersectionObserver(loadMoreJobs, options);
      if (footer) observer.observe(footer)

      /* Load Tags */
      const url = new URL(window.location.href)
      tagsResponse = await fetch('/api/tags?' + url.searchParams.toString())

      /* Load Stories */
      storiesResponse = await fetch('/api/stories')
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

  /* Search Input */
  let search = ''

</script>

<main>
  <form data-sveltekit-noscroll>
    <header class="pt-1">
      <span class="flex-and-row-wrap gap-1 v-baseline">
        <a data-sveltekit-reload class="logo" tabindex="-1" href="/">
          whoishiring
        </a>
        <a tabindex="-1" href="https://github.com/hazzelnut/whoishiring" target="_blank">
          <svg class="github-logo" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <path fill="#000000" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59c.4.07.55-.17.55-.38c0-.19-.01-.82-.01-1.49c-2.01.37-2.53-.49-2.69-.94c-.09-.23-.48-.94-.82-1.13c-.28-.15-.68-.52-.01-.53c.63-.01 1.08.58 1.23.82c.72 1.21 1.87.87 2.33.66c.07-.52.28-.87.51-1.07c-1.78-.2-3.64-.89-3.64-3.95c0-.87.31-1.59.82-2.15c-.08-.2-.36-1.02.08-2.12c0 0 .67-.21 2.2.82c.64-.18 1.32-.27 2-.27c.68 0 1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82c.44 1.1.16 1.92.08 2.12c.51.56.82 1.27.82 2.15c0 3.07-1.87 3.75-3.65 3.95c.29.25.54.73.54 1.48c0 1.07-.01 1.93-.01 2.2c0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
          </svg>
        </a>
      </span>
      <div class="search-container">
        <input
          class="search-input w-100"
          type="text"
          placeholder="Search..."
          bind:value={search}
        />

        <!-- Note: Order of reset button and submit button matters here;
            pressing 'enter' will target the nearest submit button -->
        <button type="submit" class="search-submit pointer">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg>
        </button>

        {#if search.length > 0 || qParam != null}
          <button class="search-cancel pointer" on:click={() => search = ''}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        {/if}

      </div>
    </header>


    <!-- Popular Filters -->
    <div class="pv-1">
      <div class="flex-and-row-wrap gap-half v-center min-h-4">
        <span class="heading wavy">Popular Filters</span>
        {#if tagsToFilter.length > 0 || tagsParam != null}
          <Reset click={() => tagsToFilter = []}>reset</Reset>
        {/if}
      </div>
      <div class="tags-container flex-and-row-wrap gap-half">
      {#if tagsResponse}
        {#await tagsResponse.json() then tags}
          {#each tags as tag}
            <div>
              <Button
                toggle={tagsToFilter.includes(tag) || tagsParam?.includes(tag)}
                click={() => handleTags(tag)}>
                  {tag}
              </Button>
            </div>
          {/each}
        {/await}
      {:else}
        {#each Array(2) as _}
            <Placeholder />
        {/each}
      {/if}
      </div>
    </div>

    <!-- Buttons do a form submit without page refresh -->
    <div class="other-filters pv-1">
      <Sort click={() => toggleSort()} toggle={sort === 'newest'}>{sort}</Sort>
      <Switch click={() => remote = !remote} toggle={remote}>
        remote
      </Switch>
      <Switch click={() => showSaved = !showSaved} toggle={showSaved} disabled={numJobs == 0}>
        ({numJobs}) saved
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

    <div class="flex-and-row-wrap gap-1 justify-between v-center heading border-top pt-1">
      <span class="bold">{totalCount || 0} results</span>

      {#if storiesResponse}
        {#await storiesResponse.json() then stories}
          {#each stories as story}
          {#if story.id == storyId}
            <a href={`https://news.ycombinator.com/item?id=${story.firebaseId}`} target="_blank">
              {formatDate(story.firebaseCreatedAt)}
            </a>
          {/if}
          {/each}
        {/await}
        <!-- TODO: Make the dates selectable
        <select>
          {#await storiesResponse.json() then stories}
            {#each stories as story}
              <option>{formatDate(story.firebaseCreatedAt)}</option>
            {/each}
          {/await}
        </select>
        -->
      {:else}
        <Placeholder height="1.5em" width="6em"/>
      {/if}
    </div>

    {#each posts as post}
      <Post post={post} storyId={storyId} />
    {/each}

  </form>

  <footer class="mt-1" bind:this={footer}>
    <small>
      Made with ❤️ and 😭 by <a href="https://okeric.com" target="_blank">Eric Chan</a>
    </small>
  </footer>
</main>

<style>
  main {
    margin: 0 auto;
    padding: 1em;

    color: #231F20;
    background-color: #F9F5EB;
    border-radius: 1em;
  }


  /* Mini utility-classes */
  .flex-and-row-wrap {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .justify-between {
    justify-content: space-between;
  }

  .gap-1 {
    gap: 1em;
  }

  .gap-half {
    gap: 0.5em;
  }

  .pv-1 {
    padding: 1em 0;
  }

  .mt-1 {
    margin-top: 1em;
  }

  .pt-1 {
    padding-top: 1em;
  }

  .v-baseline {
    align-items: baseline;
  }

  .v-center {
    align-items: center;
  }

  .min-h-4 {
    min-height: 4em;
  }

  .border-top {
    border-top: 1px solid #231F20;
  }

  .pointer {
    cursor: pointer;
  }

  .heading {
    font-size: 1.2em;
  }

  .bold {
    font-weight: bolder;
  }

  .w-100 {
    width: 100%
  }

  .wavy {
    text-decoration: underline wavy #4E7539;
    text-underline-offset: 0.5em;

    -webkit-text-decoration: underline wavy #4E7539;
    -webkit-text-underline-line: 0.5em;
  }

  /* Other filters - sort, remote only, saved only */
  .other-filters {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    column-gap: 1em;
    row-gap: 1em;
  }

  /* Header */
  header {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    column-gap: 1em;
  }

  .logo {
    font-weight: bolder;
    font-size: 2em;
    font-family: 'Unbounded', sans-serif;

    text-decoration: none;
  }
  a:visited.logo, a:link.logo {
    color: #231F20;
  }

  .github-logo {
    height: 1.5em;
    width: 1.5em;
  }

  /* Search Bar */
  div.search-container {
    position: relative;

    display: flex;
    align-items: center;

    border: 1px solid #231F20;
    border-radius: 1em;
    background-color: #FCFAF4;

    grid-column: 2/2;
  }

  div.search-container > button {
    /* Resets */
    background: none;
  }


  input.search-input {
    padding: 1em 5em 1em 1em;
    font-size: 1em;

    border: none;
    background: none;
    border-radius: 1em;
  }
  button.search-cancel {
    position: absolute;
    right: 4.5em;

    height: 2.5em;
    width: 3em;

    border: none;
  }

  button.search-submit {
    position: absolute;
    right: 0;

    height: 2.5em;
    width: 4em;

    border-style: solid;
    border-color: #231F20;
    border-width: 0 0 0 1px;
  }

  .search-cancel svg {
    width: 2em;
    height: 2em;
    stroke: #231F20;
  }
  .search-submit svg {
    width: 2em;
    height: 2em;
    fill: #231F20;
  }

  /* Restrict width in desktop view */
  @media (min-width: 64em) {
    main {
      width: 64em;
    }
  }

  @media (max-width: 640px) {
    header {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 1em;
    }

    .search-container, .search-input {
      width: 100%;
    }

    /* Show less tags in mobile view */
    .tags-container > :nth-child(n + 13){
      display: none;
    }

    .logo {
      font-size: 1.5em;
    }
    .github-logo {
      height: 1.2em;
      width: 1.2em;
    }
  }
</style>
