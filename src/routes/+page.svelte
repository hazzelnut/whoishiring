<script lang="ts">
	import { invalidate, invalidateAll } from '$app/navigation';
  import type { PageData } from './$types';

  export let data: PageData;

  let sort = 'newest';

  function toggleSort () {
    sort = sort === 'oldest' ? 'newest' : 'oldest'
    // Trigger a load server-side?
    invalidate(url => url.searchParams.has('sort'));
  }

</script>

<style>
  div > p {
    color: green;
  }
</style>

<form>
  <button
    name="sort"
    value={sort}
    on:click={toggleSort}
  >{sort}</button>
</form>

{#each data.posts as post}
  {#if post?.deleted == true}
    <p>deleted!</p> 
  {/if}
  <div>
    <p>{post.by}</p>
    <p>{post.timeAgo}</p>
    <span>{@html post.text}</span>
    <!-- {console.log(post)} -->
  </div>
  <!-- Goal: To have the url be shareable. Need to modify URL with each new filter -->

  <!-- There's a progress bar for how far I'm scrolling. ie how many job posts left to read -->
  <!-- Seen and unseen feature. Can filter by posts I've seen -->
  <br />
{/each}
