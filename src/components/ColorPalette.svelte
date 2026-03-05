<script lang="ts">
  interface Props {
    colors: string[];
    selected: string | undefined;
    onselect: (color: string) => void;
  }

  let { colors, selected, onselect }: Props = $props();
  let open = $state(false);
  let container: HTMLDivElement | undefined = $state();

  function toggle() {
    open = !open;
  }

  function handleSelect(color: string) {
    onselect(color);
    open = false;
  }

  function handleClickOutside(e: MouseEvent) {
    if (open && container && !container.contains(e.target as Node)) {
      open = false;
    }
  }
</script>

<svelte:window onclick={handleClickOutside} />

<div class="color-palette-wrapper" bind:this={container}>
  <button
    class="color-trigger"
    style="background-color: {selected || '#555'}"
    onclick={toggle}
    aria-label="Choose color"
  ></button>

  {#if open}
    <div class="palette-popover">
      {#each colors as color}
        <button
          class="palette-dot"
          class:active={color === selected}
          style="background-color: {color}"
          onclick={() => handleSelect(color)}
          aria-label="Select {color}"
        ></button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .color-palette-wrapper {
    position: relative;
    display: inline-block;
  }

  .color-trigger {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.15);
    cursor: pointer;
    transition: border-color 0.15s;
    padding: 0;
  }

  .color-trigger:hover {
    border-color: rgba(255, 255, 255, 0.3);
  }

  .palette-popover {
    position: absolute;
    right: 0;
    top: 100%;
    margin-top: 6px;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 4px;
    padding: 8px;
    background: #1e1e38;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    z-index: 110;
  }

  .palette-dot {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    padding: 0;
    transition: border-color 0.15s, transform 0.1s;
  }

  .palette-dot:hover {
    border-color: rgba(255, 255, 255, 0.4);
    transform: scale(1.15);
  }

  .palette-dot.active {
    border-color: white;
  }
</style>
