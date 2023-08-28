<script lang="ts">
  export let disabled = false;
  export let click = () => {};
  export let toggle = false;
</script>


<button
  class={`${toggle ? 'active': ''} ${disabled ? 'disabled': ''}`}
  on:click={() => click()}
  disabled={disabled}
>
  <slot></slot>
</button>

<style>
  button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1em;

    font-family: 'Mulish', sans-serif;
    font-size: 1em;
    padding: 0.8em 1em;

    border: 1px solid #231F20;
    border-radius: 1em;

    color: #231F20;
    background-color: #F9F5EB;
  }

  button:hover:not(.disabled) {
    cursor: pointer;
  }

  .active {
    color: #F9F5EB;
    background-color: #4E7539;
  }

  .disabled {
    opacity: 0.5;
  }
</style>
