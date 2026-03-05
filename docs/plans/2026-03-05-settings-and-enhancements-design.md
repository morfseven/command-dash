# Command Dash — Settings & Enhancements Design

**Date**: 2026-03-05
**Status**: Approved
**Scope**: Bookmark sync, folder colors, background customization, layout offset, vim mode, settings sidebar

---

## 1. Overview

Extend Command Dash with a settings system and several quality-of-life features:

1. **Bookmark sync** — Pinned sites auto-update when source bookmarks change
2. **Folder colors** — 20-color preset palette for folder customization
3. **Background customization** — Solid color, URL image, or file upload
4. **Layout offset** — Adjustable vertical padding to push content down
5. **Vim mode** — Optional hjkl navigation + gg/G shortcuts
6. **Settings sidebar** — Right-slide panel to manage all settings

---

## 2. Data Model Changes

### 2.1 Extended Settings Type

```typescript
interface Settings {
  columns: number;                      // existing, default: 6
  vimMode: boolean;                     // default: false
  verticalOffset: number;               // px, default: 40, range: 0-120
  background: BackgroundConfig;         // default: { type: 'solid', value: '#1a1a2e' }
  folderColors: Record<string, string>; // folderId → hex color, default: {}
}

interface BackgroundConfig {
  type: 'solid' | 'url' | 'file';
  value: string;  // hex color | image URL | base64 data URI
}
```

### 2.2 Storage

All settings stored in `chrome.storage.local` under the existing `commandDash` key as part of `AppState.settings`. Single atomic read/write.

Default values for new fields are applied at load time via spread operator, ensuring backward compatibility with existing stored data.

### 2.3 Migration

No migration needed. `loadState()` merges stored data with defaults, so missing new fields get default values automatically.

---

## 3. Feature: Bookmark Sync

### 3.1 Problem

When a bookmark is renamed, moved, or deleted in Chrome, the corresponding pinned site retains stale data (old name/URL) or continues to exist after deletion.

### 3.2 Solution

Extend existing `chrome.bookmarks` event listeners in `App.svelte`:

| Event | Current Behavior | New Behavior |
|-------|-----------------|--------------|
| `onChanged` | Reload folder list | + Update matching pinned site's `name`/`url` |
| `onRemoved` | Reload folder list | + Remove matching pinned site + reorder remaining |
| `onMoved` | Reload folder list | No change needed (pinned sites use bookmark ID) |

### 3.3 Implementation Details

- Match by `bookmark.id === pinnedSite.id`
- On `onChanged`: if pinned site matches, update `name` from `changeInfo.title` and `url` from `changeInfo.url`, then persist
- On `onRemoved`: filter out matching pinned site, recalculate `order` values (fill gaps), then persist
- All updates are persisted to storage immediately

---

## 4. Feature: Folder Colors

### 4.1 Color Palette

20 colors chosen for readability on dark backgrounds (medium-to-high saturation, sufficient contrast):

```
#FF6B6B  #FF8E72  #FFA94D  #FFD93D  #A8E6CF
#6BCB77  #4ECDC4  #45B7D1  #4EA8DE  #6C63FF
#9B59B6  #E056A0  #FF6B9D  #C9B1FF  #78D5D7
#F7DC6F  #E8A87C  #85C1E9  #D5A6BD  #B8E986
```

### 4.2 Application

- Color is applied as the folder icon's background color (replacing default gray)
- Stored as `settings.folderColors[folderId] = '#hex'`
- Folders without a custom color use the default styling
- When a folder is deleted from Chrome, its color entry is cleaned up on the next settings save

### 4.3 UI

In the settings sidebar under "Folder Colors" section:
- Each folder row shows: folder emoji, folder name, colored dot button
- Clicking the dot opens a popover with the 20-color grid (4×5)
- Clicking a color applies it immediately (live preview) and persists

---

## 5. Feature: Background Customization

### 5.1 Options

| Type | Input | Storage |
|------|-------|---------|
| **Solid** | Color input + preset buttons | Hex string (e.g., `#1a1a2e`) |
| **URL** | Text input with preview | URL string |
| **File** | File picker (jpg/png/webp) | Base64 data URI |

### 5.2 Implementation

- Applied to `<main>` element via inline style
- For images (URL/file): `background-image` with `cover` sizing + dark overlay `rgba(0,0,0,0.5)` for text readability
- For solid: `background-color`
- File upload uses `FileReader.readAsDataURL()`, stored in `chrome.storage.local`
- **Size limit**: Warn user if base64 exceeds 5MB (storage limit is ~10MB total for extension)

### 5.3 Settings UI

```
Background
├ Type: (●) Solid  ( ) URL  ( ) File
├ [Conditional input based on type]
│   Solid → Color input [#1a1a2e] + 6 preset color buttons
│   URL   → Text input + [Preview] button
│   File  → [Choose File] button + thumbnail preview
└ Reset to default button
```

---

## 6. Feature: Layout Offset

### 6.1 Problem

Content is pushed too far up against the top of the viewport.

### 6.2 Solution

- Add `padding-top` to the main content container
- Default: `40px`
- Range: `0px` to `120px`
- Controlled via slider in settings sidebar
- Stored as `settings.verticalOffset`

---

## 7. Feature: Vim Mode

### 7.1 Key Mappings

When `settings.vimMode === true`, additional key handlers in `keyboard.ts`:

| Key | Action | Equivalent |
|-----|--------|------------|
| `h` | Move left | ← Arrow |
| `j` | Move down | ↓ Arrow |
| `k` | Move up | ↑ Arrow |
| `l` | Move right | → Arrow |
| `gg` | Jump to first item | Home |
| `G` | Jump to last item | End |

### 7.2 Behavior Rules

- **Disabled when search is active** — keys type into search input instead
- **Disabled when settings sidebar is open** — prevent conflicts with text inputs
- `gg` detection: on first `g`, set a 200ms timer. If second `g` arrives within window, execute jump-to-first. If timer expires or different key pressed, cancel.
- All other existing shortcuts (Enter, Escape, Tab, /, Cmd+K) remain unchanged

### 7.3 Keyboard Module Changes

Add to `keyboard.ts`:
- New `vimMode: boolean` parameter to navigation handler
- `g` key pending state tracking
- Mapping function that converts vim keys to directional actions before passing to existing navigation logic

---

## 8. Feature: Settings Sidebar

### 8.1 Trigger

- **Mouse**: Gear icon button (⚙) in bottom-right corner of the screen
- **Keyboard**: `,` key (when not in search mode)

### 8.2 Layout

```
┌──────────────────────────────────┐
│  ⚙ Settings              [✕]    │
│──────────────────────────────────│
│                                  │
│  General                         │
│  ├ Columns: [━━━●━━━] 6         │
│  ├ Top Offset: [━━●━━━] 40px    │
│  └ Vim Mode: [  ○ Toggle  ]     │
│                                  │
│  Background                      │
│  ├ (●) Solid   ( ) URL  ( ) File│
│  └ [type-specific input]         │
│                                  │
│  Folder Colors                   │
│  ├ 📁 Work      [●] #FF6B6B    │
│  ├ 📁 Personal  [●] #4ECDC4    │
│  └ 📁 Dev       [●] #6C63FF    │
│                                  │
└──────────────────────────────────┘
```

### 8.3 Behavior

- Width: `320px`, slides in from right edge
- Background: semi-transparent dark (`rgba(26, 26, 46, 0.95)`)
- Backdrop: click outside to close
- Close: `✕` button or `Escape` key
- Changes apply immediately (live preview), persisted on each change
- Keyboard navigation disabled while sidebar is open (mouse-only interaction for settings)

### 8.4 Components

New Svelte components:
- `SettingsSidebar.svelte` — container with sections
- `ColorPalette.svelte` — reusable 4×5 color grid popover (used for both folder colors and background solid presets)
- `BackgroundPicker.svelte` — type selector + conditional inputs
- `RangeSlider.svelte` — reusable slider with label and value display

---

## 9. Component Architecture

```
App.svelte
├── WebSearchBar.svelte          (existing)
├── SearchBar.svelte             (existing)
├── PinnedGrid.svelte            (existing)
│   └── SiteIcon.svelte          (existing)
├── FolderIcon.svelte            (existing, modified: color prop)
├── BookmarkList.svelte          (existing)
├── SettingsSidebar.svelte       (NEW)
│   ├── RangeSlider.svelte       (NEW)
│   ├── BackgroundPicker.svelte  (NEW)
│   │   └── ColorPalette.svelte  (NEW)
│   └── ColorPalette.svelte      (NEW, reused for folder colors)
└── SettingsButton.svelte        (NEW, gear icon trigger)
```

---

## 10. Data Flow

```
User changes setting in sidebar
  → Update local Svelte state ($state)
  → Live preview applied immediately
  → Debounced save to chrome.storage.local (300ms)

Chrome bookmark changed/removed
  → onChanged/onRemoved event fires
  → Check if affected bookmark ID matches any pinned site
  → If match: update/remove pinned site in state
  → Save updated state to chrome.storage.local
  → UI reactively updates via Svelte 5 runes
```

---

## 11. Non-Goals

- No Unsplash API integration (may be added later)
- No full vim command mode (`:` commands)
- No custom color picker (HSL/HEX free input) — preset palette only
- No export/import of settings
- No sync across devices (chrome.storage.local only, not sync)
