<script lang="ts">
  import { getFaviconUrl } from '../lib/bookmarks';

  interface Props {
    url: string;
    name: string;
    focused?: boolean;
    pinned?: boolean;
    onclick?: () => void;
    onTogglePin?: () => void;
  }

  let { url, name, focused = false, pinned = false, onclick, onTogglePin }: Props = $props();

  let faviconFailed = $state(false);
  let faviconSrc = $derived(getFaviconUrl(url));
</script>

<button
  class="site-icon"
  class:focused
  onclick={onclick}
  oncontextmenu={(e) => {
    if (onTogglePin) {
      e.preventDefault();
      onTogglePin();
    }
  }}
  aria-label={name}
  title={pinned ? `${name} (pinned — right-click to unpin)` : `${name} (right-click to pin)`}
>
  {#if faviconFailed || !faviconSrc}
    <div class="favicon-placeholder">{name.charAt(0).toUpperCase()}</div>
  {:else}
    <img
      src={faviconSrc}
      alt=""
      width="32"
      height="32"
      class="favicon"
      onerror={() => { faviconFailed = true; }}
    />
  {/if}
  <span class="label">{name}</span>
</button>

<style>
  .site-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 12px 8px;
    background: transparent;
    border: 2px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    color: #ccc;
    transition: border-color 0.15s, background-color 0.15s;
    min-width: 0;
    width: 100%;
    box-sizing: border-box;
  }

  .site-icon:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .site-icon.focused {
    border-color: #6c63ff;
    background: rgba(108, 99, 255, 0.1);
  }

  .favicon {
    border-radius: 4px;
  }

  .favicon-placeholder {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    background: rgba(108, 99, 255, 0.2);
    color: #6c63ff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 600;
  }

  .label {
    font-size: 11px;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 80px;
  }
</style>
