<script lang="ts">
	import { getTimeAgo } from "$lib/normalize";
  import { savedJobs } from '$lib/stores';
	import Button from "../button/Button.svelte";

  type Post = {
    id: number;
    by: string;
    text: string;
    htmlText: string;
    firebaseCreatedAt: Date;
    firebaseId: number;
  }

  function handleSave(post: Post) {
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
  }

  export let post: Post;
  export let storyId = '';
</script>

<div class="post">
  <div class="post-bar">
    <div class="post-info">
      <p class="bold">{post.by}</p>
      <p>
        <a href={`https://news.ycombinator.com/item?id=${post.firebaseId}`} target="_blank">
          {getTimeAgo(post.firebaseCreatedAt)}
        </a>
      </p>
    </div>
    <div class="ml-auto">
      <Button
        toggle={$savedJobs[storyId]?.includes(post.id)}
        click={() => handleSave(post)}
      >
        {$savedJobs[storyId]?.includes(post.id) ? 'saved' : 'save'}
      </Button>
    </div>
  </div>
  <p class="content">{@html post.htmlText}</p>
</div>

<style>
  .bold {
    font-weight: bold;
  }

  .ml-auto {
    margin-left: auto;
  }

  div.post {
    position: relative;
    margin: 1em 0 2em;
    padding: 1em;
    border: 1px solid #231F20;
    border-radius: 1em;
    border-bottom: 5px solid #231F20;

    color:#231F20;
  }
  div.post-bar{
    display: flex;
    flex-direction: row;
    gap: 1em;

    /* border-bottom: 1px solid #231F20; */
    padding-bottom: 1em;
  }
  div.post-info {
    display: flex;
    flex-direction: row;
    gap: 1em;
    flex-wrap: wrap;
  }
  p.content {
    line-height: 1.5;

    /* NOTE: Fix for horizonal scrolling? */
    overflow-y: hidden;
    word-wrap: break-word;
  }


  @media (max-width: 640px) {
    p.content {
      font-size: 0.9em;
    }

    div.post-info {
      display: block;
    }
  }

</style>