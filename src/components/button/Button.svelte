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
    display: inline-flex;
    gap: 1em;

    font-size: 1em;
    padding: 1em;

    border: 1px solid #3F2F24;
    border-radius: 1em;

    color: #3F2F24;
    background-color: #F5F5F0;
  }

  button:hover {
    cursor: pointer;
  }

  .active {
    color: #F5F5F0;
    background-color: #3F2F24;
  }

  .disabled {
    opacity: 0.5;
  }
</style>
