<script lang="ts">
	import Button from "./Button.svelte";

  export let disabled = false;
  export let toggle = false;
  export let click = () => {};
</script>


<Button click={click} disabled={disabled}>
  <div class="text">
    <slot></slot>
  </div>

  {#if toggle}
    <svg width="16" height="19" viewBox="0 0 16 19" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.70711 18.7071C8.31658 19.0976 7.68342 19.0976 7.29289 18.7071L0.928933 12.3431C0.538408 11.9526 0.538408 11.3195 0.928933 10.9289C1.31946 10.5384 1.95262 10.5384 2.34315 10.9289L8 16.5858L13.6569 10.9289C14.0474 10.5384 14.6805 10.5384 15.0711 10.9289C15.4616 11.3195 15.4616 11.9526 15.0711 12.3431L8.70711 18.7071ZM9 -4.37114e-08L9 18L7 18L7 4.37114e-08L9 -4.37114e-08Z" fill="#231F20"/>
    </svg>
  {:else}
    <svg width="16" height="19" viewBox="0 0 16 19" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.70711 0.292893C8.31658 -0.0976311 7.68342 -0.0976311 7.29289 0.292893L0.928933 6.65685C0.538408 7.04738 0.538408 7.68054 0.928933 8.07107C1.31946 8.46159 1.95262 8.46159 2.34315 8.07107L8 2.41421L13.6569 8.07107C14.0474 8.46159 14.6805 8.46159 15.0711 8.07107C15.4616 7.68054 15.4616 7.04738 15.0711 6.65685L8.70711 0.292893ZM9 19L9 1L7 1L7 19L9 19Z" fill="#231F20"/>
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

  div.text {
    min-width: 3.5em;
  }
</style>