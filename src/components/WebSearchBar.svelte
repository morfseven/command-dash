<script lang="ts">
  let inputEl: HTMLInputElement | undefined = $state();
  let query = $state('');

  // Random name to prevent Chrome from offering autocomplete history
  const inputName = `q_${Math.random().toString(36).slice(2)}`;

  export function focus() {
    inputEl?.focus();
  }

  export function blur() {
    inputEl?.blur();
  }

  export function isActive(): boolean {
    return document.activeElement === inputEl;
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
    }
  }
</script>

<form class="web-search" onsubmit={handleSubmit}>
  <span class="search-icon">🔍</span>
  <input
    bind:this={inputEl}
    bind:value={query}
    type="text"
    name={inputName}
    autocomplete="off"
    placeholder="Google 검색..."
    class="search-input"
  />
  <kbd class="shortcut-hint">⌘K</kbd>
</form>

<style>
  .web-search {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    margin-bottom: 1.5rem;
    transition: border-color 0.15s, background-color 0.15s;
  }

  .web-search:focus-within {
    border-color: #6c63ff;
    background: rgba(108, 99, 255, 0.06);
  }

  .search-icon {
    font-size: 14px;
    flex-shrink: 0;
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

  .shortcut-hint {
    font-size: 0.65rem;
    color: #555;
    background: rgba(255, 255, 255, 0.06);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: inherit;
    flex-shrink: 0;
  }

  .web-search:focus-within .shortcut-hint {
    display: none;
  }
</style>
