# Command Dash Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Chrome Extension that replaces the New Tab page with a keyboard-driven bookmark dashboard.

**Architecture:** Svelte 5 single-page app built with Vite, packaged as Chrome Extension Manifest V3. The app reads Chrome bookmarks via `chrome.bookmarks` API and stores user preferences (pinned sites) in `chrome.storage.local`. All navigation is keyboard-driven: search filtering, Tab zone switching, arrow key grid navigation, Enter to open.

**Tech Stack:** Svelte 5 (runes), TypeScript, Vite 6, Chrome Extension Manifest V3, `@types/chrome`

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `svelte.config.js`
- Create: `src/newtab/index.html`
- Create: `src/newtab/main.ts`
- Create: `src/newtab/App.svelte`
- Create: `public/manifest.json`
- Create: `.gitignore`

**Step 1: Initialize project**

```bash
cd /Users/morfs/dev/personal/command-dash
npm create vite@latest . -- --template svelte-ts
```

If prompted about non-empty directory, choose to overwrite/ignore existing files.

**Step 2: Install Chrome types**

```bash
npm install -D @types/chrome
```

**Step 3: Configure manifest.json**

Replace `public/manifest.json` (delete any default index.html in public if present):

```json
{
  "manifest_version": 3,
  "name": "Command Dash",
  "version": "0.1.0",
  "description": "Keyboard-driven bookmark dashboard for your New Tab",
  "icons": {
    "16": "icons/icon-16.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  },
  "chrome_url_overrides": {
    "newtab": "src/newtab/index.html"
  },
  "permissions": ["bookmarks", "storage"]
}
```

**Step 4: Configure Vite for Chrome Extension**

`vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [svelte()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        newtab: resolve(__dirname, 'src/newtab/index.html'),
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
})
```

**Step 5: Set up entry point**

`src/newtab/index.html`:

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Tab</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="./main.ts"></script>
  </body>
</html>
```

`src/newtab/main.ts`:

```typescript
import { mount } from 'svelte'
import App from './App.svelte'

mount(App, { target: document.getElementById('app')! })
```

`src/newtab/App.svelte`:

```svelte
<script lang="ts">
  let message = $state('Command Dash')
</script>

<main>
  <h1>{message}</h1>
</main>

<style>
  :global(body) {
    margin: 0;
    background: #0f0f0f;
    color: #e0e0e0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  main {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
</style>
```

**Step 6: Update tsconfig.json**

Ensure `"types": ["chrome"]` is in compilerOptions.

**Step 7: Create placeholder icons**

```bash
mkdir -p public/icons
# Create simple placeholder PNGs (16x16, 48x48, 128x128)
# Can use ImageMagick or just copy placeholder files
```

For now, create minimal SVG-based placeholder icons or skip icons (extension will still load without them).

**Step 8: Build and verify**

```bash
npm run build
```

Expected: `dist/` folder contains `src/newtab/index.html` + JS assets + `manifest.json` + `icons/`.

**Step 9: Commit**

```bash
git add -A
git commit -m "feat: scaffold Svelte 5 + Vite Chrome Extension project"
```

---

### Task 2: Types & Data Layer

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/bookmarks.ts`
- Create: `src/lib/storage.ts`

**Step 1: Define types**

`src/lib/types.ts`:

```typescript
export interface PinnedSite {
  id: string
  url: string
  name: string
  order: number
}

export interface BookmarkGroup {
  id: string
  title: string
  sites: BookmarkSite[]
}

export interface BookmarkSite {
  id: string
  url: string
  title: string
}

export interface Settings {
  columns: number
}

export interface AppState {
  pinnedSites: PinnedSite[]
  settings: Settings
}

export const DEFAULT_SETTINGS: Settings = {
  columns: 6,
}
```

**Step 2: Implement bookmark reader**

`src/lib/bookmarks.ts`:

```typescript
import type { BookmarkGroup, BookmarkSite } from './types'

export async function getBookmarkGroups(): Promise<BookmarkGroup[]> {
  const tree = await chrome.bookmarks.getTree()
  const root = tree[0]
  if (!root?.children) return []

  const groups: BookmarkGroup[] = []

  for (const topLevel of root.children) {
    if (!topLevel.children) continue
    collectGroups(topLevel, groups)
  }

  return groups
}

function collectGroups(
  node: chrome.bookmarks.BookmarkTreeNode,
  groups: BookmarkGroup[],
): void {
  if (!node.children) return

  const sites: BookmarkSite[] = []
  const subfolders: chrome.bookmarks.BookmarkTreeNode[] = []

  for (const child of node.children) {
    if (child.url) {
      sites.push({ id: child.id, url: child.url, title: child.title })
    } else if (child.children) {
      subfolders.push(child)
    }
  }

  if (sites.length > 0) {
    groups.push({ id: node.id, title: node.title, sites })
  }

  for (const sub of subfolders) {
    collectGroups(sub, groups)
  }
}

export function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
  } catch {
    return ''
  }
}
```

**Step 3: Implement storage**

`src/lib/storage.ts`:

```typescript
import type { PinnedSite, Settings, AppState } from './types'
import { DEFAULT_SETTINGS } from './types'

const STORAGE_KEY = 'commandDash'

export async function loadState(): Promise<AppState> {
  const result = await chrome.storage.local.get(STORAGE_KEY)
  const saved = result[STORAGE_KEY] as Partial<AppState> | undefined
  return {
    pinnedSites: saved?.pinnedSites ?? [],
    settings: { ...DEFAULT_SETTINGS, ...saved?.settings },
  }
}

export async function saveState(state: AppState): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: state })
}

export async function pinSite(site: Omit<PinnedSite, 'order'>): Promise<void> {
  const state = await loadState()
  const maxOrder = state.pinnedSites.reduce((max, s) => Math.max(max, s.order), -1)
  state.pinnedSites.push({ ...site, order: maxOrder + 1 })
  await saveState(state)
}

export async function unpinSite(id: string): Promise<void> {
  const state = await loadState()
  state.pinnedSites = state.pinnedSites.filter((s) => s.id !== id)
  await saveState(state)
}
```

**Step 4: Commit**

```bash
git add src/lib/
git commit -m "feat: add types, bookmark reader, and storage layer"
```

---

### Task 3: SiteIcon Component

**Files:**
- Create: `src/components/SiteIcon.svelte`

**Step 1: Build the icon component**

`src/components/SiteIcon.svelte`:

```svelte
<script lang="ts">
  import { getFaviconUrl } from '../lib/bookmarks'

  interface Props {
    url: string
    name: string
    focused?: boolean
    onSelect?: () => void
  }

  let { url, name, focused = false, onSelect }: Props = $props()

  let faviconUrl = $derived(getFaviconUrl(url))
</script>

<button
  class="site-icon"
  class:focused
  onclick={() => { window.location.href = url }}
  title={name}
>
  <img src={faviconUrl} alt="" width="32" height="32" />
  <span class="label">{name}</span>
</button>

<style>
  .site-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 12px;
    border: 1px solid transparent;
    border-radius: 12px;
    background: transparent;
    color: #b0b0b0;
    cursor: pointer;
    transition: all 0.15s ease;
    width: 80px;
    font-family: inherit;
  }

  .site-icon:hover,
  .site-icon.focused {
    background: #1a1a2e;
    border-color: #333366;
    color: #ffffff;
  }

  .site-icon.focused {
    box-shadow: 0 0 0 2px rgba(100, 100, 255, 0.3);
  }

  img {
    border-radius: 8px;
  }

  .label {
    font-size: 11px;
    max-width: 70px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
  }
</style>
```

**Step 2: Commit**

```bash
git add src/components/
git commit -m "feat: add SiteIcon component with favicon and focus state"
```

---

### Task 4: PinnedGrid Component

**Files:**
- Create: `src/components/PinnedGrid.svelte`

**Step 1: Build pinned grid**

`src/components/PinnedGrid.svelte`:

```svelte
<script lang="ts">
  import type { PinnedSite } from '../lib/types'
  import SiteIcon from './SiteIcon.svelte'

  interface Props {
    sites: PinnedSite[]
    columns: number
    focusedIndex: number
    active: boolean
  }

  let { sites, columns, focusedIndex, active }: Props = $props()
</script>

{#if sites.length > 0}
  <section class="pinned-grid">
    <div class="grid" style="grid-template-columns: repeat({columns}, 80px);">
      {#each sites as site, i (site.id)}
        <SiteIcon
          url={site.url}
          name={site.name}
          focused={active && i === focusedIndex}
        />
      {/each}
    </div>
  </section>
{/if}

<style>
  .pinned-grid {
    margin-bottom: 32px;
  }

  .grid {
    display: grid;
    gap: 8px;
    justify-content: center;
  }
</style>
```

**Step 2: Commit**

```bash
git add src/components/PinnedGrid.svelte
git commit -m "feat: add PinnedGrid component with grid layout"
```

---

### Task 5: BookmarkGroup Component

**Files:**
- Create: `src/components/BookmarkGroup.svelte`

**Step 1: Build bookmark group**

`src/components/BookmarkGroup.svelte`:

```svelte
<script lang="ts">
  import type { BookmarkGroup } from '../lib/types'
  import SiteIcon from './SiteIcon.svelte'

  interface Props {
    group: BookmarkGroup
    columns: number
    focusedIndex: number
    active: boolean
  }

  let { group, columns, focusedIndex, active }: Props = $props()
</script>

<section class="bookmark-group">
  <h3 class="group-title">{group.title}</h3>
  <div class="grid" style="grid-template-columns: repeat({columns}, 80px);">
    {#each group.sites as site, i (site.id)}
      <SiteIcon
        url={site.url}
        name={site.title}
        focused={active && i === focusedIndex}
      />
    {/each}
  </div>
</section>

<style>
  .bookmark-group {
    margin-bottom: 24px;
  }

  .group-title {
    font-size: 13px;
    font-weight: 500;
    color: #666;
    margin: 0 0 12px 0;
    padding-left: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .grid {
    display: grid;
    gap: 8px;
    justify-content: center;
  }
</style>
```

**Step 2: Commit**

```bash
git add src/components/BookmarkGroup.svelte
git commit -m "feat: add BookmarkGroup component with folder sections"
```

---

### Task 6: SearchBar Component

**Files:**
- Create: `src/components/SearchBar.svelte`

**Step 1: Build search bar**

`src/components/SearchBar.svelte`:

```svelte
<script lang="ts">
  interface Props {
    query: string
    active: boolean
    onInput: (value: string) => void
  }

  let { query, active, onInput }: Props = $props()

  let inputEl: HTMLInputElement | undefined = $state()

  export function focus() {
    inputEl?.focus()
  }

  export function blur() {
    inputEl?.blur()
  }
</script>

<div class="search-bar" class:active>
  <span class="icon">/</span>
  <input
    bind:this={inputEl}
    type="text"
    placeholder="즐겨찾기 검색..."
    value={query}
    oninput={(e) => onInput(e.currentTarget.value)}
  />
</div>

<style>
  .search-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    padding: 10px 16px;
    max-width: 480px;
    margin: 0 auto 32px;
    transition: border-color 0.15s;
  }

  .search-bar.active {
    border-color: #444488;
  }

  .icon {
    color: #555;
    font-size: 14px;
    font-family: monospace;
  }

  input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    color: #e0e0e0;
    font-size: 14px;
    font-family: inherit;
  }

  input::placeholder {
    color: #555;
  }
</style>
```

**Step 2: Commit**

```bash
git add src/components/SearchBar.svelte
git commit -m "feat: add SearchBar component with filter input"
```

---

### Task 7: Keyboard Navigation System

**Files:**
- Create: `src/lib/keyboard.ts`

**Step 1: Build keyboard navigation logic**

`src/lib/keyboard.ts`:

This is the core logic — a state machine managing which zone is active, which item is focused, and how keys move focus.

```typescript
export interface Zone {
  id: string
  length: number
  columns: number
}

export interface NavState {
  zoneIndex: number
  itemIndex: number
  searchActive: boolean
}

export function createInitialNav(): NavState {
  return { zoneIndex: 0, itemIndex: 0, searchActive: false }
}

export function handleNavKey(
  key: string,
  state: NavState,
  zones: Zone[],
): NavState {
  if (state.searchActive) {
    return handleSearchKey(key, state, zones)
  }

  const zone = zones[state.zoneIndex]
  if (!zone) return state

  switch (key) {
    case 'ArrowRight':
      return { ...state, itemIndex: Math.min(state.itemIndex + 1, zone.length - 1) }
    case 'ArrowLeft':
      return { ...state, itemIndex: Math.max(state.itemIndex - 1, 0) }
    case 'ArrowDown': {
      const nextRow = state.itemIndex + zone.columns
      if (nextRow < zone.length) {
        return { ...state, itemIndex: nextRow }
      }
      // Move to next zone
      if (state.zoneIndex < zones.length - 1) {
        return { ...state, zoneIndex: state.zoneIndex + 1, itemIndex: 0 }
      }
      return state
    }
    case 'ArrowUp': {
      const prevRow = state.itemIndex - zone.columns
      if (prevRow >= 0) {
        return { ...state, itemIndex: prevRow }
      }
      // Move to prev zone
      if (state.zoneIndex > 0) {
        const prevZone = zones[state.zoneIndex - 1]
        return { ...state, zoneIndex: state.zoneIndex - 1, itemIndex: prevZone.length - 1 }
      }
      return state
    }
    case 'Tab':
      return {
        ...state,
        zoneIndex: (state.zoneIndex + 1) % zones.length,
        itemIndex: 0,
      }
    default:
      return state
  }
}

function handleSearchKey(key: string, state: NavState, zones: Zone[]): NavState {
  if (key === 'Escape') {
    return { ...state, searchActive: false }
  }
  if (key === 'ArrowDown') {
    const zone = zones[state.zoneIndex]
    if (zone && state.itemIndex < zone.length - 1) {
      return { ...state, itemIndex: state.itemIndex + 1 }
    }
  }
  if (key === 'ArrowUp') {
    if (state.itemIndex > 0) {
      return { ...state, itemIndex: state.itemIndex - 1 }
    }
  }
  return state
}
```

**Step 2: Commit**

```bash
git add src/lib/keyboard.ts
git commit -m "feat: add keyboard navigation state machine"
```

---

### Task 8: App Integration — Wire Everything Together

**Files:**
- Modify: `src/newtab/App.svelte` (full rewrite)

**Step 1: Integrate all components**

Replace `src/newtab/App.svelte` with the full app that wires together all components, data loading, search filtering, and keyboard navigation.

```svelte
<script lang="ts">
  import type { PinnedSite, BookmarkGroup as BookmarkGroupType } from '../lib/types'
  import { DEFAULT_SETTINGS } from '../lib/types'
  import { getBookmarkGroups } from '../lib/bookmarks'
  import { loadState } from '../lib/storage'
  import { createInitialNav, handleNavKey, type Zone } from '../lib/keyboard'
  import SearchBar from '../components/SearchBar.svelte'
  import PinnedGrid from '../components/PinnedGrid.svelte'
  import BookmarkGroup from '../components/BookmarkGroup.svelte'

  let pinnedSites = $state<PinnedSite[]>([])
  let bookmarkGroups = $state<BookmarkGroupType[]>([])
  let columns = $state(DEFAULT_SETTINGS.columns)
  let query = $state('')
  let nav = $state(createInitialNav())

  let searchBarRef: SearchBar | undefined = $state()

  // Load data on mount
  $effect(() => {
    loadState().then((state) => {
      pinnedSites = state.pinnedSites
      columns = state.settings.columns
    })
    getBookmarkGroups().then((groups) => {
      bookmarkGroups = groups
    })
  })

  // Filtered results when searching
  let filteredGroups = $derived.by(() => {
    if (!query) return bookmarkGroups
    const q = query.toLowerCase()
    return bookmarkGroups
      .map((g) => ({
        ...g,
        sites: g.sites.filter(
          (s) => s.title.toLowerCase().includes(q) || s.url.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.sites.length > 0)
  })

  let filteredPinned = $derived.by(() => {
    if (!query) return pinnedSites
    const q = query.toLowerCase()
    return pinnedSites.filter(
      (s) => s.name.toLowerCase().includes(q) || s.url.toLowerCase().includes(q),
    )
  })

  // Build zones for navigation
  let zones = $derived.by((): Zone[] => {
    const z: Zone[] = []
    if (filteredPinned.length > 0) {
      z.push({ id: 'pinned', length: filteredPinned.length, columns })
    }
    for (const g of filteredGroups) {
      z.push({ id: `group-${g.id}`, length: g.sites.length, columns })
    }
    return z
  })

  // Get current focused site URL for Enter key
  function getCurrentUrl(): string | undefined {
    const zone = zones[nav.zoneIndex]
    if (!zone) return undefined

    if (zone.id === 'pinned') {
      return filteredPinned[nav.itemIndex]?.url
    }

    const groupIndex = nav.zoneIndex - (filteredPinned.length > 0 ? 1 : 0)
    const group = filteredGroups[groupIndex]
    return group?.sites[nav.itemIndex]?.url
  }

  function handleKeydown(e: KeyboardEvent) {
    // Slash or printable char → focus search
    if (!nav.searchActive && e.key === '/') {
      e.preventDefault()
      nav = { ...nav, searchActive: true, zoneIndex: 0, itemIndex: 0 }
      searchBarRef?.focus()
      return
    }

    // Escape → clear search
    if (e.key === 'Escape') {
      e.preventDefault()
      query = ''
      nav = { ...nav, searchActive: false }
      searchBarRef?.blur()
      return
    }

    // Enter → open site
    if (e.key === 'Enter') {
      e.preventDefault()
      const url = getCurrentUrl()
      if (url) window.location.href = url
      return
    }

    // Tab → prevent default, switch zones
    if (e.key === 'Tab') {
      e.preventDefault()
      if (e.shiftKey) {
        nav = {
          ...nav,
          zoneIndex: (nav.zoneIndex - 1 + zones.length) % zones.length,
          itemIndex: 0,
        }
      } else {
        nav = handleNavKey('Tab', nav, zones)
      }
      return
    }

    // Arrow keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault()
      nav = handleNavKey(e.key, nav, zones)
      return
    }

    // Any other printable key → activate search
    if (!nav.searchActive && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      nav = { ...nav, searchActive: true }
      searchBarRef?.focus()
    }
  }

  // Zone active helpers
  function isPinnedActive(): boolean {
    return zones[nav.zoneIndex]?.id === 'pinned'
  }

  function isGroupActive(groupId: string): boolean {
    return zones[nav.zoneIndex]?.id === `group-${groupId}`
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<main>
  <SearchBar
    bind:this={searchBarRef}
    {query}
    active={nav.searchActive}
    onInput={(v) => {
      query = v
      nav = { ...nav, zoneIndex: 0, itemIndex: 0 }
    }}
  />

  <PinnedGrid
    sites={filteredPinned}
    {columns}
    focusedIndex={nav.itemIndex}
    active={isPinnedActive()}
  />

  {#each filteredGroups as group (group.id)}
    <BookmarkGroup
      {group}
      {columns}
      focusedIndex={nav.itemIndex}
      active={isGroupActive(group.id)}
    />
  {/each}

  <footer class="hints">
    <span><kbd>/</kbd> 검색</span>
    <span><kbd>Tab</kbd> 영역이동</span>
    <span><kbd>←→↑↓</kbd> 탐색</span>
    <span><kbd>Enter</kbd> 열기</span>
    <span><kbd>Esc</kbd> 초기화</span>
  </footer>
</main>

<style>
  :global(body) {
    margin: 0;
    background: #0f0f0f;
    color: #e0e0e0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  main {
    max-width: 720px;
    margin: 0 auto;
    padding: 60px 24px 24px;
  }

  .hints {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    gap: 24px;
    padding: 12px;
    background: #0a0a0a;
    border-top: 1px solid #1a1a1a;
    font-size: 12px;
    color: #555;
  }

  kbd {
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 4px;
    padding: 1px 5px;
    font-family: monospace;
    font-size: 11px;
    color: #888;
  }
</style>
```

**Step 2: Build and verify**

```bash
npm run build
```

Expected: clean build, no errors.

**Step 3: Commit**

```bash
git add src/
git commit -m "feat: wire up full app with keyboard navigation, search, and bookmark groups"
```

---

### Task 9: Pin/Unpin Context Menu

**Files:**
- Modify: `src/components/SiteIcon.svelte` — add right-click context menu for pin/unpin
- Modify: `src/newtab/App.svelte` — add pin/unpin callbacks

**Step 1: Add pin/unpin to SiteIcon**

Add an `onPin` and `onUnpin` optional prop to `SiteIcon.svelte`. On right-click, show a simple pin/unpin option using a minimal dropdown or `confirm()` dialog for MVP.

```svelte
<!-- Add to SiteIcon.svelte props -->
interface Props {
  url: string
  name: string
  focused?: boolean
  pinned?: boolean
  onTogglePin?: () => void
}
```

Add a right-click handler:

```svelte
<button
  ...
  oncontextmenu={(e) => {
    e.preventDefault()
    onTogglePin?.()
  }}
>
```

**Step 2: Wire pin/unpin in App.svelte**

Use `pinSite()` and `unpinSite()` from storage.ts. After toggling, reload state.

**Step 3: Build and verify**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add src/
git commit -m "feat: add pin/unpin via right-click on site icons"
```

---

### Task 10: Icon Generation & Polish

**Files:**
- Create: `public/icons/icon-16.png`
- Create: `public/icons/icon-48.png`
- Create: `public/icons/icon-128.png`

**Step 1: Generate extension icons**

Create simple "CD" monogram icons for 16x16, 48x48, 128x128. Can use a canvas script or an online tool. Alternatively, create an SVG and convert:

```bash
# If ImageMagick is available:
convert -size 128x128 xc:'#1a1a2e' -fill '#6666ff' -font Helvetica -pointsize 64 -gravity center -annotate 0 'CD' public/icons/icon-128.png
convert public/icons/icon-128.png -resize 48x48 public/icons/icon-48.png
convert public/icons/icon-128.png -resize 16x16 public/icons/icon-16.png
```

**Step 2: Commit**

```bash
git add public/icons/
git commit -m "feat: add extension icons"
```

---

### Task 11: Final Build & Manual Test

**Step 1: Clean build**

```bash
rm -rf dist && npm run build
```

**Step 2: Load in Chrome**

1. Open `chrome://extensions`
2. Enable Developer mode
3. Click "Load unpacked" → select `dist/` folder
4. Open new tab

**Step 3: Manual test checklist**

- [ ] New tab shows Command Dash UI
- [ ] Bookmark groups appear from Chrome bookmarks
- [ ] `/` focuses search bar
- [ ] Typing filters bookmarks
- [ ] Arrow keys navigate grid
- [ ] Tab switches between zones
- [ ] Enter opens selected site
- [ ] Esc clears search
- [ ] Right-click pins/unpins sites
- [ ] Pinned sites persist after closing/opening new tab

**Step 4: Final commit and push**

```bash
git add -A
git commit -m "chore: final build verification"
git push origin main
```
