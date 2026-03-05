<script lang="ts">
  interface Props {
    query: string;
    active: boolean;
    onInput?: (value: string) => void;
  }

  let { query, active, onInput }: Props = $props();

  let inputEl: HTMLInputElement | undefined = $state();

  export function focus() {
    inputEl?.focus();
  }

  export function blur() {
    inputEl?.blur();
  }
</script>

<div class="search-bar" class:active>
  <span class="search-icon">/</span>
  <input
    bind:this={inputEl}
    type="text"
    value={query}
    oninput={(e) => onInput?.(e.currentTarget.value)}
    placeholder="Search bookmarks..."
    class="search-input"
  />
</div>

<style>
  .search-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    margin-bottom: 1.5rem;
    transition: border-color 0.15s, background-color 0.15s;
  }

  .search-bar.active {
    border-color: #6c63ff;
    background: rgba(108, 99, 255, 0.08);
  }

  .search-icon {
    color: #666;
    font-size: 0.9rem;
    font-family: monospace;
  }

  .search-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #e0e0e0;
    font-size: 0.95rem;
    font-family: inherit;
  }

  .search-input::placeholder {
    color: #555;
  }
</style>
