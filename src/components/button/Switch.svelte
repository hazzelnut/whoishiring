<script lang="ts">
	import Button from "./Button.svelte";

  export let disabled = false;
  export let toggle = false;
  export let click = () => {};
</script>


<Button click={click} toggle={toggle} disabled={disabled}>
  <slot></slot>

  {#if toggle}
    <svg width="45" height="20" viewBox="0 0 45 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="-0.5" y="0.5" width="44" height="19" rx="9.5" transform="matrix(-1 0 0 1 44 0)" fill="#4E7539" stroke="#F9F5EB"/>
    <circle cx="8" cy="8" r="8" transform="matrix(-1 0 0 1 43 2)" fill="#F9F5EB"/>
    </svg>
  {:else}
    <svg width="45" height="20" viewBox="0 0 45 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0.5" y="0.5" width="44" height="19" rx="9.5" fill="#F9F5EB" stroke="#231F20"/>
    <circle cx="10" cy="10" r="8" fill="#231F20"/>
    </svg>
  {/if}
</Button>

<style>
  /* Bug: On mobile, tapping on SVG doesn't execute
          the button click to submit form to server.
          Setting pointer-events: none fixes it.
  */
  svg {
    pointer-events: none;
  }
</style>