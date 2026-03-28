<script lang="ts">
  import type { PinnedSite } from '../lib/types';
  import SiteIcon from './SiteIcon.svelte';

  interface Props {
    sites: PinnedSite[];
    columns: number;
    focusedIndex: number;
    active: boolean;
    onNavigate?: (url: string) => void;
    onTogglePin?: (site: PinnedSite) => void;
    onReorder?: (fromIndex: number, toIndex: number) => void;
  }

  let { sites, columns, focusedIndex, active, onNavigate, onTogglePin, onReorder }: Props = $props();

  let dragIndex = $state<number | null>(null);
  let dropIndex = $state<number | null>(null);

  function handleDragStart(e: DragEvent, index: number) {
    dragIndex = index;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
  }

  function handleDragOver(e: DragEvent, index: number) {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    if (dragIndex !== null && index !== dragIndex) {
      dropIndex = index;
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    if (dragIndex !== null && dropIndex !== null && dragIndex !== dropIndex) {
      onReorder?.(dragIndex, dropIndex);
    }
    dragIndex = null;
    dropIndex = null;
  }

  function handleDragEnd() {
    dragIndex = null;
    dropIndex = null;
  }
</script>

{#if sites.length > 0}
  <section class="pinned-grid">
    <h2 class="section-title">Pinned</h2>
    <div class="grid" role="list" style="grid-template-columns: repeat({columns}, 1fr)">
      {#each sites as site, i (site.id)}
        <div
          class="drag-item"
          class:dragging={dragIndex === i}
          class:drop-before={dropIndex === i && dragIndex !== null && dragIndex > i}
          class:drop-after={dropIndex === i && dragIndex !== null && dragIndex < i}
          draggable={onReorder ? 'true' : 'false'}
          ondragstart={(e) => handleDragStart(e, i)}
          ondragover={(e) => handleDragOver(e, i)}
          ondragenter={(e) => e.preventDefault()}
          ondrop={(e) => handleDrop(e)}
          ondragend={handleDragEnd}
          role="listitem"
        >
          <SiteIcon
            url={site.url}
            name={site.name}
            focused={active && focusedIndex === i}
            pinned={true}
            onclick={() => onNavigate?.(site.url)}
            onTogglePin={() => onTogglePin?.(site)}
          />
        </div>
      {/each}
    </div>
  </section>
{/if}

<style>
  .pinned-grid {
    margin-bottom: 2rem;
  }

  .section-title {
    font-size: 0.85rem;
    font-weight: 500;
    color: #6c63ff;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 0.5rem 0.25rem;
  }

  .grid {
    display: grid;
    gap: 4px;
  }

  .drag-item {
    cursor: grab;
    border-radius: 8px;
  }

  .drag-item.dragging {
    opacity: 0.4;
    cursor: grabbing;
  }

  .drag-item.drop-before {
    box-shadow: -3px 0 0 0 #6c63ff;
  }

  .drag-item.drop-after {
    box-shadow: 3px 0 0 0 #6c63ff;
  }
</style>
