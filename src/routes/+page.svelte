<script lang="ts">
	import { invalidate } from '$app/navigation';
  import type { PageData } from './$types';

  export let data: PageData;

  /* Sorting posts */
  let sort = 'newest';
  function toggleSort() {
    sort = sort === 'oldest' ? 'newest' : 'oldest'
    // Note: trigger a re-load of the load function
    invalidate(url => url.searchParams.has('sort'));
  }

  /* Saved posts */
  let savedPosts: Record<number, string>= {};
  function handleSave(id: number, text: string) {
    if (Object.hasOwn(savedPosts, id)) {
      const { [id]: _deletedPost, ...restPosts} = savedPosts
      savedPosts = restPosts;
    } else {
      savedPosts = {...savedPosts, [id]: text}
    }
  }

</script>

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

<main>
  <form>
    <button
      name="sort"
      value={sort}
      on:click={toggleSort}
    >{sort}</button>
  </form>

  <div class="savedStats">
    Saved Posts: {Object.keys(savedPosts).length}
  </div>

  {#each data.posts as post}
    <div class="post">
      <div class="postInfo">
        <p>{post.by}</p>
        <p class="timeAgo">{post.timeAgo}</p>
      </div>
      <p>{@html post.text}</p>
      <button
        class={
          'saveBtn ' + 
          `${Object.hasOwn(savedPosts, post.id) && "saved"}`
        }
        on:click={() => handleSave(post.id, post.text)}
      >
        {Object.hasOwn(savedPosts, post.id) ? 'SAVED' : 'Save'}
      </button>
      <!-- {console.log(post)} -->
    </div>
    <!-- Goal: To have the url be shareable. Need to modify URL with each new filter -->

    <!-- There's a progress bar for how far I'm scrolling. ie how many job posts left to read -->
    <!-- Seen and unseen feature. Can filter by posts I've seen -->
    <br />
  {/each}
</main>
