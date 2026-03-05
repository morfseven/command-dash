# Research: Settings & Enhancements

**Feature Branch**: `002-dash-settings`
**Date**: 2026-03-05

## R1: Chrome Storage Limits for Background Images

**Decision**: Use `chrome.storage.local` with base64 encoding for uploaded images. Warn at 5MB.

**Rationale**: `chrome.storage.local` has a default 10MB quota per extension. Adding `"unlimitedStorage"` permission removes this limit, but it's unnecessary for our use case. Base64 encoding adds ~33% size overhead (3 bytes binary → 4 bytes base64 + data URI prefix). A 3MB JPEG becomes ~4MB base64. The 5MB warning threshold ensures we stay safely under the 10MB limit with room for other settings data.

**Alternatives considered**:
- IndexedDB: More complex API, no size limit, but overkill when storage needs are modest
- `unlimitedStorage` permission: Removes quota but adds a permission prompt users might distrust
- External URL only (no file upload): Simpler but doesn't meet the spec requirement for file upload

## R2: Debouncing Settings Saves

**Decision**: Debounce saves with 300ms delay.

**Rationale**: `chrome.storage.local` has no documented rate limit, but frequent writes cause unnecessary disk I/O. 300ms balances responsiveness (slider dragging feels smooth) with efficiency. Settings changes are synchronous in the UI (Svelte state updates instantly) while persistence is deferred.

**Alternatives considered**:
- No debounce (immediate save): Excessive writes during slider drag
- 1000ms debounce: Too long — user might close tab before save completes
- `requestIdleCallback`: Unpredictable timing, not suitable for data persistence

## R3: Multi-Key Sequence Detection (gg)

**Decision**: Use a key buffer with 500ms timeout on `keydown` events.

**Rationale**: The `keydown` event is standard for vim-style navigation — it fires immediately and repeats when held. For the `gg` sequence: on first `g`, set a 500ms timer. If second `g` arrives within the window, execute jump-to-first and clear the timer. If a different key arrives or the timer expires, discard the `g` and process the new key normally. 500ms is a good balance between vim's default 1000ms (too slow for a simple dashboard) and 200ms (too fast for casual users).

**Alternatives considered**:
- 200ms timeout: Too fast for users not accustomed to vim sequences
- 1000ms timeout: Vim default, but feels sluggish for a 2-key sequence in a dashboard context
- `keyup` events: Don't repeat when held, too slow for rapid navigation

## R4: Folder Color Cleanup Strategy

**Decision**: Clean up orphaned color entries during settings save, not on bookmark events.

**Rationale**: Bookmark deletion events (`onRemoved`) fire before the app can guarantee it has the latest folder list. Instead, during each settings save, compare `folderColors` keys against the current folder list and remove entries for non-existent folders. This is lazy cleanup that avoids race conditions.

**Alternatives considered**:
- Cleanup on every `onRemoved` event: Risk of race conditions with rapid bookmark changes
- Scheduled cleanup: Unnecessary complexity for a small map
- Never cleanup: Accumulates dead entries, negligible storage cost but messy

## R5: Background Image Overlay Approach

**Decision**: Use CSS `::after` pseudo-element with `rgba(0,0,0,0.5)` overlay on the main container.

**Rationale**: A pseudo-element overlay preserves the original image quality while ensuring text readability. The overlay is applied only when the background type is `url` or `file`. For solid colors, no overlay is needed (the user chose the color intentionally).

**Alternatives considered**:
- CSS `filter: brightness()` on background: Degrades image quality, not uniform overlay
- Separate `<div>` overlay: Extra DOM element, harder to manage z-index
- `background-blend-mode`: Limited browser support for complex blending
