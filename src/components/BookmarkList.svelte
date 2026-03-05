<script lang="ts">
  import type { BookmarkSite } from '../lib/types';
  import { getFaviconUrl, extractHostname } from '../lib/bookmarks';

  interface Props {
    bookmarks: BookmarkSite[];
    focusedIndex: number;
    active: boolean;
    onNavigate?: (url: string) => void;
    onTogglePin?: (site: BookmarkSite) => void;
  }

  let { bookmarks, focusedIndex, active, onNavigate, onTogglePin }: Props = $props();

  let faviconFailed: Record<string, boolean> = $state({});
</script>

<ul class="bookmark-list" role="list">
  {#each bookmarks as bm, i}
    {@const faviconSrc = getFaviconUrl(bm.url)}
    <li
      class="bookmark-row"
      class:focused={active && focusedIndex === i}
      role="listitem"
    >
      <button
        class="bookmark-link"
        onclick={() => onNavigate?.(bm.url)}
        oncontextmenu={(e) => {
          if (onTogglePin) {
            e.preventDefault();
            onTogglePin(bm);
          }
        }}
      >
        <span class="favicon-wrap">
          {#if faviconFailed[bm.id] || !faviconSrc}
            <span class="favicon-placeholder">{bm.title.charAt(0).toUpperCase()}</span>
          {:else}
            <img
              src={faviconSrc}
              alt=""
              width="20"
              height="20"
              class="favicon"
              onerror={() => { faviconFailed[bm.id] = true; }}
            />
          {/if}
        </span>
        <span class="title">{bm.title}</span>
        <span class="url">{extractHostname(bm.url)}</span>
      </button>
    </li>
  {/each}
</ul>

<style>
  .bookmark-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .bookmark-row {
    border-radius: 6px;
    transition: background-color 0.12s;
  }

  .bookmark-row.focused {
    background: rgba(108, 99, 255, 0.12);
  }

  .bookmark-link {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 8px 12px;
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    font: inherit;
    text-align: left;
  }

  .bookmark-link:hover {
    background: rgba(255, 255, 255, 0.04);
    border-radius: 6px;
  }

  .favicon-wrap {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .favicon {
    border-radius: 3px;
  }

  .favicon-placeholder {
    width: 20px;
    height: 20px;
    border-radius: 3px;
    background: rgba(108, 99, 255, 0.2);
    color: #6c63ff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
  }

  .title {
    flex: 1;
    font-size: 13px;
    color: #ddd;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .url {
    font-size: 11px;
    color: #666;
    flex-shrink: 0;
  }
</style>
