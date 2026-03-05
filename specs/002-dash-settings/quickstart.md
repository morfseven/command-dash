# Quickstart: Settings & Enhancements

**Feature Branch**: `002-dash-settings`
**Date**: 2026-03-05

## Prerequisites

- Node.js 18+
- npm
- Chrome, Edge, Brave, or Arc browser

## Setup

```bash
git checkout 002-dash-settings
npm install
npm run build
```

## Load Extension in Chrome

1. Open `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked" → select the `dist/` folder
4. Open a new tab to see Command Dash

## Development

```bash
npm run dev          # Start Vite dev server (for type checking)
npm run build        # Build to dist/
npm run check        # Run svelte-check + tsc
```

After each build, go to `chrome://extensions/` and click the refresh icon on Command Dash.

## Testing the New Features

### Settings Sidebar
1. Open new tab → click gear icon (bottom-right) or press `,`
2. Sidebar should slide in from right
3. Press Escape or click outside to close

### Bookmark Sync
1. Pin a bookmark on the dashboard
2. Open `chrome://bookmarks/` in another tab
3. Rename the bookmarked site → pinned name should update
4. Delete the bookmarked site → pin should disappear

### Background Customization
1. Open settings → Background section
2. Try "Solid" → change color → verify background updates
3. Try "URL" → enter an image URL → verify image + overlay
4. Try "File" → upload a local image → verify display + persistence

### Folder Colors
1. Open settings → Folder Colors section
2. Click a color dot next to any folder
3. Select a color from the palette → verify folder icon updates

### Layout Offset
1. Open settings → General → Top Offset slider
2. Drag slider → verify content moves in real time

### Vim Mode
1. Open settings → enable Vim Mode
2. Close settings → press h/j/k/l → verify navigation
3. Press gg → verify jump to first; G → jump to last
4. Press `/` to search → verify hjkl types normally
5. Disable vim mode → verify hjkl does nothing

## File Structure (New/Modified)

```
src/lib/types.ts          ← Extended Settings, BackgroundConfig
src/lib/storage.ts        ← Extended load/save with validation
src/lib/keyboard.ts       ← Vim mode support
src/lib/constants.ts      ← NEW: color palette, defaults
src/components/
  SettingsSidebar.svelte   ← NEW: main settings panel
  SettingsButton.svelte    ← NEW: gear icon trigger
  ColorPalette.svelte      ← NEW: reusable color grid
  BackgroundPicker.svelte  ← NEW: background type selector
  RangeSlider.svelte       ← NEW: reusable slider
  FolderIcon.svelte        ← Modified: color prop
src/newtab/App.svelte      ← Modified: integration point
```
