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
  }

  let { sites, columns, focusedIndex, active, onNavigate, onTogglePin }: Props = $props();
</script>

{#if sites.length > 0}
  <section class="pinned-grid">
    <h2 class="section-title">Pinned</h2>
    <div class="grid" style="grid-template-columns: repeat({columns}, 1fr)">
      {#each sites as site, i}
        <SiteIcon
          url={site.url}
          name={site.name}
          focused={active && focusedIndex === i}
          pinned={true}
          onclick={() => onNavigate?.(site.url)}
          onTogglePin={() => onTogglePin?.(site)}
        />
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
</style>
