# Command Dash — Design Document

## Overview

Chrome Extension (Manifest V3) that replaces the New Tab page with a keyboard-driven bookmark dashboard. Users can navigate their favorite sites entirely with the keyboard — search to filter, Tab to switch sections, arrow keys to browse icons, Enter to open.

## Problem

- Chrome's built-in bookmarks are mouse-dependent and clunky for power users
- Existing alternatives (Homey, etc.) are going paid
- No good free option for keyboard-only bookmark navigation

## Core Concepts

### Layout

```
┌──────────────────────────────────────────────────────┐
│                   Command Dash                        │
│                                                       │
│  ┌─────────────────────────────────────────────┐      │
│  │ 🔍 즐겨찾기 검색...                          │      │
│  └─────────────────────────────────────────────┘      │
│                                                       │
│  ─── ⭐ 핀 고정 (메인 그리드) ───────────────────      │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐          │
│  │ GH │ │ YT │ │ TW │ │ NT │ │ SL │ │ GM │          │
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘          │
│                                                       │
│  ─── 📁 개발 ────────────────────────────────         │
│  ┌────┐ ┌────┐ ┌────┐                                │
│  │ SO │ │ MDN│ │ NPM│                                │
│  └────┘ └────┘ └────┘                                │
│                                                       │
│  ─── 📁 미디어 ──────────────────────────────         │
│  ┌────┐ ┌────┐                                       │
│  │ SP │ │ NF │                                       │
│  └────┘ └────┘                                       │
│                                                       │
│  [/] 검색  [Tab] 영역이동  [←→↑↓] 탐색  [Enter] 열기 │
└──────────────────────────────────────────────────────┘
```

Three zones:
1. **Search bar** — top, always accessible via `/` or typing
2. **Pinned grid** — center, user-curated favorite sites
3. **Bookmark groups** — below, auto-synced from Chrome bookmark folders

### Keyboard Navigation

| Key | Action |
|---|---|
| `/` or any character | Focus search bar → real-time filtering |
| `Tab` / `Shift+Tab` | Move between zones (pinned ↔ bookmark groups) |
| `←` `→` `↑` `↓` | Navigate icons within current zone |
| `Enter` | Open selected site |
| `Esc` | Clear search / unfocus |
| `↑` `↓` in search | Navigate filtered results |
| `Enter` in search | Open first/selected result |

### Data

**chrome.storage.local (user config):**
- `pinnedSites`: `[{ url, name, favicon, order }]` — main grid items
- `settings`: `{ theme, columns, ... }`

**chrome.bookmarks API (read-only sync):**
- Bookmark folder structure → auto-generates grouped icon sections

### Favicon Source

`https://www.google.com/s2/favicons?domain={domain}&sz=64`

## Tech Stack

- **Svelte 5** + **TypeScript**
- **Vite** (build tool)
- **Chrome Extension Manifest V3**
- `chrome.bookmarks` API
- `chrome.storage.local` API

## Design

- Minimal dark theme
- Clean icon grid with favicon + site name
- Focused item highlighted with subtle border/glow
- Bottom hint bar showing available keyboard shortcuts

## Components

| Component | Responsibility |
|---|---|
| `App.svelte` | Main layout, global keyboard event hub |
| `SearchBar.svelte` | Search input, real-time filtering |
| `PinnedGrid.svelte` | User-pinned icon grid |
| `BookmarkGroup.svelte` | Single bookmark folder as icon group |
| `SiteIcon.svelte` | Individual icon (favicon + name + focus state) |

## Scope (MVP)

**In scope:**
- New Tab override with pinned grid + bookmark groups
- Keyboard-only navigation (search, Tab, arrow keys, Enter)
- Chrome bookmark sync (read)
- Pin/unpin sites to main grid
- Minimal dark UI

**Out of scope (future):**
- Custom shortcut key per site
- Drag-and-drop reordering
- Light mode / theme toggle
- Import/export settings
- Firefox support
