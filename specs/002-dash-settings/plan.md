# Implementation Plan: Settings & Enhancements

**Branch**: `002-dash-settings` | **Date**: 2026-03-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-dash-settings/spec.md`

## Summary

Extend Command Dash with a unified settings system. Add a right-sliding settings sidebar (triggered by gear icon or `,` key) that manages: bookmark sync (auto-update/remove pinned sites when Chrome bookmarks change), background customization (solid color / URL image / file upload), folder color assignment (20-color preset palette), vertical layout offset (slider 0–120px), and optional Vim navigation mode (hjkl + gg/G). All settings persist in `chrome.storage.local` via the existing `AppState.settings` object with backward-compatible defaults.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict mode)
**Primary Dependencies**: Svelte 5.45 (runes), Vite 7.3, @types/chrome 0.1.37
**Storage**: `chrome.storage.local` (key: `commandDash`, single AppState object)
**Testing**: `svelte-check` + `tsc` type checking; manual Chrome testing for UI/keyboard
**Target Platform**: Chromium-based browsers (Chrome, Edge, Brave, Arc) via Manifest V3
**Project Type**: Chrome Extension (New Tab override)
**Performance Goals**: New Tab render < 200ms; setting changes visible < 100ms
**Constraints**: No external network requests (privacy-first); `chrome.storage.local` ~10MB limit; no new runtime dependencies
**Scale/Scope**: Single-user local extension; ~10 source files affected

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Keyboard-First | VIOLATION (justified) | Settings sidebar is mouse-only for form controls (sliders, color pickers, file upload). See Complexity Tracking below. |
| II. Minimal & Fast | PASS | No new dependencies. All settings read from local storage at startup. |
| III. Chrome-Native | PASS | Uses `chrome.bookmarks` events and `chrome.storage.local` directly. |
| IV. Svelte 5 Idioms | PASS | All new components use `$state`, `$derived`, `$effect`, `$props`. |
| V. Privacy-First | PASS | All data stays in `chrome.storage.local`. No external requests. |

**Gate result**: PASS (1 justified violation)

## Project Structure

### Documentation (this feature)

```text
specs/002-dash-settings/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── storage-schema.md
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── types.ts          # Extended Settings, BackgroundConfig types
│   ├── storage.ts        # Extended save/load with new defaults
│   ├── bookmarks.ts      # Existing bookmark API helpers
│   ├── keyboard.ts       # Extended with vim mode support + g-key state
│   └── constants.ts      # NEW: color palette, default values
├── components/
│   ├── BookmarkList.svelte    # Existing (no changes)
│   ├── FolderIcon.svelte      # Modified: accept color prop
│   ├── PinnedGrid.svelte      # Existing (no changes)
│   ├── SearchBar.svelte       # Existing (no changes)
│   ├── SiteIcon.svelte        # Existing (no changes)
│   ├── WebSearchBar.svelte    # Existing (no changes)
│   ├── SettingsSidebar.svelte # NEW: main settings panel
│   ├── SettingsButton.svelte  # NEW: gear icon trigger
│   ├── ColorPalette.svelte    # NEW: reusable 4×5 color grid
│   ├── BackgroundPicker.svelte# NEW: type selector + inputs
│   └── RangeSlider.svelte     # NEW: reusable slider control
└── newtab/
    ├── App.svelte         # Modified: integrate settings, bookmark sync, background, vim
    ├── index.html         # Existing (no changes)
    └── main.ts            # Existing (no changes)
```

**Structure Decision**: Extend existing flat structure. New components go into `src/components/`. New constants file in `src/lib/`. No new directories or architectural changes needed — the project is small enough that a flat layout remains clear.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Settings sidebar is mouse-only (Principle I) | Form controls (range sliders, color grids, file upload buttons) require mouse interaction. Building full keyboard navigation for these non-standard controls would triple the component complexity. | Arrow-key navigation for a 4×5 color grid, range slider keyboard control, and file picker keyboard flow would add ~200 lines of keyboard handling code for a panel opened infrequently. Settings are a "set once, forget" interaction — the overhead is not justified. Opening/closing the sidebar IS keyboard-accessible (`,` and Escape). |
