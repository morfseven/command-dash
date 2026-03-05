<script lang="ts">
  import { getBookmarkFolders, getFolderBookmarks } from '../lib/bookmarks';
  import type { BookmarkFolder, BookmarkSite, PinnedSite } from '../lib/types';
  import type { Zone } from '../lib/keyboard';
  import { createInitialNav, handleNavKey } from '../lib/keyboard';
  import { loadState, pinSite, unpinSite } from '../lib/storage';
  import SearchBar from '../components/SearchBar.svelte';
  import WebSearchBar from '../components/WebSearchBar.svelte';
  import PinnedGrid from '../components/PinnedGrid.svelte';
  import FolderIcon from '../components/FolderIcon.svelte';
  import BookmarkList from '../components/BookmarkList.svelte';

  // --- State ---
  let folders: BookmarkFolder[] = $state([]);
  let pinnedSites: PinnedSite[] = $state([]);
  let nav = $state(createInitialNav());
  let columns = $state(6);
  let searchQuery = $state('');
  let searchBar: SearchBar | undefined = $state();
  let webSearchBar: WebSearchBar | undefined = $state();

  // Folder navigation state
  let selectedFolder: BookmarkFolder | null = $state(null);
  let folderBookmarks: BookmarkSite[] = $state([]);

  // --- Derived ---
  let filteredPinned: PinnedSite[] = $derived.by(() => {
    if (!searchQuery) return pinnedSites;
    const q = searchQuery.toLowerCase();
    return pinnedSites.filter(
      (s) => s.name.toLowerCase().includes(q) || s.url.toLowerCase().includes(q),
    );
  });

  let filteredFolders: BookmarkFolder[] = $derived.by(() => {
    if (selectedFolder) return []; // Not shown when a folder is open
    if (!searchQuery) return folders;
    const q = searchQuery.toLowerCase();
    return folders.filter((f) => f.title.toLowerCase().includes(q));
  });

  let filteredBookmarks: BookmarkSite[] = $derived.by(() => {
    if (!selectedFolder) return [];
    if (!searchQuery) return folderBookmarks;
    const q = searchQuery.toLowerCase();
    return folderBookmarks.filter(
      (b) => b.title.toLowerCase().includes(q) || b.url.toLowerCase().includes(q),
    );
  });

  let zones: Zone[] = $derived.by(() => {
    const z: Zone[] = [];
    if (filteredPinned.length > 0) {
      z.push({ id: '__pinned__', itemCount: filteredPinned.length });
    }
    if (selectedFolder) {
      // Bookmark list mode — single zone for bookmarks
      if (filteredBookmarks.length > 0) {
        z.push({ id: '__bookmarks__', itemCount: filteredBookmarks.length });
      }
    } else {
      // Folder grid mode
      if (filteredFolders.length > 0) {
        z.push({ id: '__folders__', itemCount: filteredFolders.length });
      }
    }
    return z;
  });

  // In bookmark list mode, use 1 column for up/down navigation
  let effectiveColumns: number = $derived(selectedFolder ? 1 : columns);

  // Pre-compute zone indices to avoid repeated findIndex in templates
  let bookmarkZoneIndex: number = $derived(bookmarkZoneIndex);
  let folderZoneIndex: number = $derived(zones.findIndex((z) => z.id === '__folders__'));
  let focusedFolderIdx: number = $derived(
    folderZoneIndex === -1 || nav.zoneIndex !== folderZoneIndex ? -1 : nav.itemIndex,
  );

  // --- Load data ---
  $effect(() => {
    loadAll();
  });

  // Live bookmark updates — separate effect so selectedFolder is tracked
  $effect(() => {
    const currentFolder = selectedFolder;

    const reload = () => {
      loadFolders();
      if (currentFolder) {
        loadFolderContents(currentFolder.id);
      }
    };

    chrome.bookmarks.onCreated.addListener(reload);
    chrome.bookmarks.onRemoved.addListener(reload);
    chrome.bookmarks.onChanged.addListener(reload);
    chrome.bookmarks.onMoved.addListener(reload);

    return () => {
      chrome.bookmarks.onCreated.removeListener(reload);
      chrome.bookmarks.onRemoved.removeListener(reload);
      chrome.bookmarks.onChanged.removeListener(reload);
      chrome.bookmarks.onMoved.removeListener(reload);
    };
  });

  async function loadAll() {
    try {
      const [state, bookmarkFolders] = await Promise.all([
        loadState(),
        getBookmarkFolders(),
      ]);
      pinnedSites = state.pinnedSites.sort((a, b) => a.order - b.order);
      columns = state.settings.columns;
      folders = bookmarkFolders;
    } catch {
      folders = [];
      pinnedSites = [];
    }
  }

  async function loadFolders() {
    try {
      folders = await getBookmarkFolders();
    } catch {
      folders = [];
    }
  }

  async function loadFolderContents(folderId: string) {
    try {
      folderBookmarks = await getFolderBookmarks(folderId);
    } catch {
      folderBookmarks = [];
    }
  }

  // --- Actions ---
  function navigate(url: string) {
    window.location.href = url;
  }

  async function openFolder(folder: BookmarkFolder) {
    selectedFolder = folder;
    folderBookmarks = await getFolderBookmarks(folder.id);
    searchQuery = '';
    nav = { ...nav, zoneIndex: filteredPinned.length > 0 ? 1 : 0, itemIndex: 0 };
  }

  function goBack() {
    selectedFolder = null;
    folderBookmarks = [];
    searchQuery = '';
    nav = { ...nav, zoneIndex: filteredPinned.length > 0 ? 1 : 0, itemIndex: 0 };
  }

  async function handleTogglePin(site: { id: string; url: string; name: string }) {
    const isPinned = pinnedSites.some((p) => p.id === site.id);
    if (isPinned) {
      await unpinSite(site.id);
    } else {
      await pinSite({ id: site.id, url: site.url, name: site.name });
    }
    const state = await loadState();
    pinnedSites = state.pinnedSites.sort((a, b) => a.order - b.order);
  }

  function activateSearch(initialChar?: string) {
    nav = { ...nav, searchActive: true };
    if (initialChar) searchQuery = initialChar;
    queueMicrotask(() => searchBar?.focus());
  }

  function deactivateSearch() {
    searchQuery = '';
    nav = { ...nav, searchActive: false, zoneIndex: 0, itemIndex: 0 };
    searchBar?.blur();
  }

  function getUrlForCurrentFocus(): string | undefined {
    const currentZones = zones;
    if (currentZones.length === 0) return undefined;

    const zi = Math.min(nav.zoneIndex, currentZones.length - 1);
    const zone = currentZones[zi];

    if (zone.id === '__pinned__') {
      const ii = Math.min(nav.itemIndex, filteredPinned.length - 1);
      return filteredPinned[ii]?.url;
    }

    if (zone.id === '__bookmarks__') {
      const ii = Math.min(nav.itemIndex, filteredBookmarks.length - 1);
      return filteredBookmarks[ii]?.url;
    }

    return undefined; // Folders don't have URLs
  }

  function handleKeydown(e: KeyboardEvent) {
    // Cmd+K (Mac) / Ctrl+K (Win) → focus Google search
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      webSearchBar?.focus();
      return;
    }

    // If web search bar is focused, let it handle everything except Escape
    if (webSearchBar?.isActive()) {
      if (e.key === 'Escape') {
        e.preventDefault();
        webSearchBar.blur();
      }
      return;
    }

    let key = e.key;
    if (key === 'Tab' && e.shiftKey) key = 'ShiftTab';

    // Search activation: `/` or printable char when not in search
    if (!nav.searchActive) {
      if (key === '/') {
        e.preventDefault();
        activateSearch();
        return;
      }
      if (key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        activateSearch(key);
        return;
      }
    }

    // Enter: open URL or open folder
    if (key === 'Enter') {
      e.preventDefault();
      const url = getUrlForCurrentFocus();
      if (url) {
        navigate(url);
        return;
      }
      // Check if focused on a folder
      const fi = focusedFolderIdx;
      if (fi >= 0 && fi < filteredFolders.length) {
        openFolder(filteredFolders[fi]);
      }
      return;
    }

    // Escape: go back to folders if in bookmark view, or clear search
    if (key === 'Escape') {
      e.preventDefault();
      if (nav.searchActive) {
        deactivateSearch();
        return;
      }
      if (selectedFolder) {
        goBack();
        return;
      }
      return;
    }

    // Let input handle left/right in search mode
    if (nav.searchActive && (key === 'ArrowLeft' || key === 'ArrowRight')) {
      return;
    }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'ShiftTab'].includes(key)) {
      e.preventDefault();
      const result = handleNavKey(key, nav, zones, effectiveColumns);
      nav = result.state;
      if (result.action.type === 'deactivateSearch') {
        deactivateSearch();
      }
      return;
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<main>
  <div class="container">
    <WebSearchBar bind:this={webSearchBar} />

    <SearchBar
      bind:this={searchBar}
      query={searchQuery}
      active={nav.searchActive}
      onInput={(v) => {
        searchQuery = v;
        nav = { ...nav, zoneIndex: 0, itemIndex: 0 };
      }}
    />

    {#if folders.length === 0 && pinnedSites.length === 0}
      <div class="empty-state">
        <h2>No bookmarks found</h2>
        <p>Add bookmarks via Chrome's bookmark manager (Ctrl+D) to get started.</p>
      </div>
    {:else}
      <div class="dashboard">
        <PinnedGrid
          sites={filteredPinned}
          {columns}
          focusedIndex={nav.zoneIndex === 0 && filteredPinned.length > 0 ? nav.itemIndex : -1}
          active={nav.zoneIndex === 0 && filteredPinned.length > 0 && !nav.searchActive}
          onNavigate={navigate}
          onTogglePin={(site) => handleTogglePin(site)}
        />

        {#if !selectedFolder}
          <!-- Folder grid view -->
          {#if filteredFolders.length > 0}
            <section class="folder-section">
              <h2 class="section-title">Folders</h2>
              <div class="folder-grid">
                {#each filteredFolders as folder, i}
                  <FolderIcon
                    {folder}
                    focused={!nav.searchActive && focusedFolderIdx === i}
                    onclick={() => openFolder(folder)}
                  />
                {/each}
              </div>
            </section>
          {:else if searchQuery}
            <div class="empty-state">
              <p>No folders match "{searchQuery}"</p>
            </div>
          {/if}
        {:else}
          <!-- Bookmark list view -->
          <section class="bookmark-section">
            <div class="folder-header">
              <button class="back-button" onclick={goBack}>
                ← Back
              </button>
              <h2 class="folder-title">{selectedFolder.title}</h2>
            </div>

            {#if filteredBookmarks.length > 0}
              <BookmarkList
                bookmarks={filteredBookmarks}
                focusedIndex={
                  !nav.searchActive &&
                  bookmarkZoneIndex === nav.zoneIndex
                    ? nav.itemIndex
                    : -1
                }
                active={
                  !nav.searchActive &&
                  bookmarkZoneIndex === nav.zoneIndex
                }
                onNavigate={navigate}
                onTogglePin={(site) =>
                  handleTogglePin({ id: site.id, url: site.url, name: site.title })
                }
              />
            {:else if searchQuery}
              <div class="empty-state">
                <p>No bookmarks match "{searchQuery}"</p>
              </div>
            {/if}
          </section>
        {/if}
      </div>
    {/if}

    <footer class="hint-bar">
      <span><kbd>&#8592;&#8593;&#8595;&#8594;</kbd> Navigate</span>
      <span><kbd>Enter</kbd> {selectedFolder ? 'Open' : 'Open folder'}</span>
      {#if selectedFolder}
        <span><kbd>Esc</kbd> Back</span>
      {/if}
      <span><kbd>/</kbd> Search</span>
      <span><kbd>⌘K</kbd> Google</span>
      <span><kbd>Right-click</kbd> Pin/Unpin</span>
    </footer>
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background: #1a1a2e;
    color: #e0e0e0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  main {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    padding: 2rem 1.5rem;
  }

  .container {
    max-width: 900px;
    width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .dashboard {
    flex: 1;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: #888;
    padding: 2rem 0;
  }

  .empty-state h2 {
    font-weight: 400;
    margin-bottom: 0.5rem;
  }

  .empty-state p {
    font-size: 0.9rem;
  }

  /* Folder grid */
  .folder-section {
    margin-top: 0.5rem;
  }

  .section-title {
    font-size: 0.85rem;
    font-weight: 500;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 0.75rem 0.25rem;
  }

  .folder-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 4px;
  }

  /* Bookmark list view */
  .bookmark-section {
    margin-top: 0.5rem;
  }

  .folder-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 1rem;
  }

  .back-button {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #aaa;
    padding: 4px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8rem;
    transition: background-color 0.12s;
  }

  .back-button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ddd;
  }

  .folder-title {
    font-size: 1rem;
    font-weight: 500;
    color: #ccc;
    margin: 0;
  }

  /* Hint bar */
  .hint-bar {
    display: flex;
    justify-content: center;
    gap: 2rem;
    padding: 1rem;
    font-size: 0.75rem;
    color: #666;
    flex-wrap: wrap;
  }

  .hint-bar kbd {
    background: rgba(255, 255, 255, 0.08);
    padding: 2px 6px;
    border-radius: 3px;
    font-family: inherit;
    font-size: 0.7rem;
  }
</style>
