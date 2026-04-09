<script lang="ts">
  import type { BookmarkFolder } from '../lib/types';

  interface Props {
    folder: BookmarkFolder;
    focused?: boolean;
    color?: string;
    onclick?: () => void;
  }

  let { folder, focused = false, color, onclick }: Props = $props();
</script>

<button
  class="folder-icon"
  class:focused
  {onclick}
  aria-label="{folder.title} — {folder.bookmarkCount} bookmarks"
>
  <span class="folder-emoji" style={color ? `background-color: ${color}; border-radius: 6px; padding: 2px 4px;` : ''}>📁</span>
  <span class="folder-name">{folder.title}</span>
  <span class="folder-count">{folder.bookmarkCount}</span>
</button>

<style>
  .folder-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 16px 8px;
    background: transparent;
    border: 2px solid transparent;
    border-radius: 10px;
    cursor: pointer;
    color: #ccc;
    transition: border-color 0.15s, background-color 0.15s;
    min-width: 0;
    width: 100%;
    box-sizing: border-box;
  }

  .folder-icon:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .folder-icon.focused {
    border-color: #6c63ff;
    background: rgba(108, 99, 255, 0.1);
  }

  .folder-emoji {
    font-size: 28px;
    line-height: 1;
  }

  .folder-name {
    font-size: 12px;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100px;
  }

  .folder-count {
    font-size: 10px;
    color: #888;
  }
</style>
