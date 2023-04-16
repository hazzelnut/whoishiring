<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;

  let sorting = "newest";
</script>

<style>
  div > p {
    color: green;
  }
</style>

<button>sort by {sorting}</button>

{#each data.posts as post}
  {#if post?.deleted == true}
    <p>deleted!</p> 
  {/if}
  <div>
    <p>{post.by}</p>
    <p>{post.timeAgo}</p>
    {@html post.text}
    <!-- {console.log(post)} -->
  </div>

  <!-- There's a progress bar for how far I'm scrolling. ie how many job posts left to read -->
  <!-- Seen and unseen feature. Can filter by posts I've seen -->
  <br />
{/each}
