<script>
	import Button from "./Button.svelte";

  export let click = () => {};
</script>

<Button click={click}>
  <div>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
    <slot></slot>
  </div>
</Button>

<style>
  div {
    display: flex;
    flex-direction: row;

    align-items: center;
    gap: 0.5em;
  }

  svg {
    height: 1em;
    width: 1em;
    stroke: #231F20;

    padding: 0.1em;

    border-radius: 1em;
    border: 1px solid #231F20;
  }
</style>