# Tasks: Settings & Enhancements

**Input**: Design documents from `/specs/002-dash-settings/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/storage-schema.md

**Tests**: Not requested in spec. Manual Chrome testing per quickstart.md.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Exact file paths included in all descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Extend type system and create shared constants for all features

- [ ] T001 Extend Settings and add BackgroundConfig interfaces in src/lib/types.ts — add `vimMode: boolean`, `verticalOffset: number`, `background: BackgroundConfig`, `folderColors: Record<string, string>` to Settings; add `BackgroundConfig` type; update `DEFAULT_SETTINGS` and `DEFAULT_STATE` with new defaults per data-model.md
- [ ] T002 [P] Create color palette and default constants in src/lib/constants.ts — export `FOLDER_COLOR_PALETTE` (20-color array), `DEFAULT_BACKGROUND` config, `VERTICAL_OFFSET_RANGE` (min: 0, max: 120), and `VIM_KEY_TIMEOUT` (500ms)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Storage layer must handle new settings before any UI work begins

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 Extend loadState() in src/lib/storage.ts — merge stored partial settings with new defaults; validate each new field (`vimMode` as boolean, `verticalOffset` 0–120, `background.type` as literal union, `folderColors` as Record); invalid/missing fields fall back to defaults per contracts/storage-schema.md
- [ ] T004 Add debounced save utility in src/lib/storage.ts — create `debouncedSaveState(state, folderIds?)` that debounces with 300ms delay; on save, clean up `folderColors` entries whose keys don't match any ID in the provided `folderIds` array (orphan cleanup per research.md R4)

**Checkpoint**: Storage layer ready — all features can now read/write extended settings

---

## Phase 3: User Story 1 — Settings Sidebar (Priority: P1) 🎯 MVP

**Goal**: Users can open a settings sidebar, see organized sections, change settings with live preview, and have changes persist

**Independent Test**: Open sidebar via gear icon or `,` key → see General section with Columns slider and placeholder sections → change column count → close sidebar → verify change persists on reload

### Implementation for User Story 1

- [ ] T005 [P] [US1] Create RangeSlider.svelte in src/components/RangeSlider.svelte — reusable slider with props: `label: string`, `value: number`, `min: number`, `max: number`, `unit: string`; emits `onchange(value)` callback; displays current value with unit; uses Svelte 5 `$props()` rune
- [ ] T006 [P] [US1] Create SettingsButton.svelte in src/components/SettingsButton.svelte — gear icon (⚙) button positioned fixed bottom-right; emits `onclick` callback; subtle styling matching dark theme
- [ ] T007 [US1] Create SettingsSidebar.svelte in src/components/SettingsSidebar.svelte — 320px wide right-sliding panel with semi-transparent dark background; props: `open: boolean`, `settings: Settings`, `folders: BookmarkFolder[]`, `onSettingsChange(settings)`, `onClose()`; General section with Columns slider (RangeSlider, 1–12) and Top Offset slider (RangeSlider, 0–120px); ✕ close button; slide-in/out CSS animation
- [ ] T008 [US1] Integrate settings sidebar into src/newtab/App.svelte — add `settingsOpen: boolean` state; render SettingsButton and SettingsSidebar; handle `,` key to open (when search not active); handle Escape to close; handle backdrop click to close; disable keyboard navigation (`handleNavKey`) while sidebar is open (FR-018); deactivate search when sidebar opens; on settings change: update local state immediately (live preview) + call debouncedSaveState

**Checkpoint**: Settings sidebar opens/closes with Columns slider working. MVP delivered.

---

## Phase 4: User Story 2 — Bookmark Sync (Priority: P1)

**Goal**: Pinned sites automatically update when Chrome bookmarks are renamed, URL-changed, or deleted

**Independent Test**: Pin a bookmark → rename it in `chrome://bookmarks/` → verify name updates on dashboard; delete it → verify pin disappears and remaining pins reorder

### Implementation for User Story 2

- [ ] T009 [US2] Extend onChanged bookmark listener in src/newtab/App.svelte — in existing `chrome.bookmarks.onChanged` handler, check if changed bookmark ID matches any pinned site; if match, update `name` from `changeInfo.title` and `url` from `changeInfo.url`; persist updated state via saveState
- [ ] T010 [US2] Extend onRemoved bookmark listener in src/newtab/App.svelte — in existing `chrome.bookmarks.onRemoved` handler, check if removed ID matches any pinned site; if match, filter out the pinned site and reassign `order` values as 0, 1, 2, ...N-1 based on current sort; persist via saveState

**Checkpoint**: Bookmark sync fully functional. Pin/rename/delete sync works independently.

---

## Phase 5: User Story 3 — Background Customization (Priority: P2)

**Goal**: Users can set solid color, URL image, or uploaded file as dashboard background with dark overlay for readability

**Independent Test**: Open settings → Background section → select Solid and pick a color → verify background changes; switch to URL → enter image URL → verify image + overlay; upload a file → verify display + persistence after reload

### Implementation for User Story 3

- [ ] T011 [P] [US3] Create BackgroundPicker.svelte in src/components/BackgroundPicker.svelte — radio group for type selection (Solid/URL/File); conditional inputs: Solid shows hex color input + 6 preset color buttons; URL shows text input; File shows file picker (accept jpg/png/webp) with thumbnail preview; 5MB file size warning (FR-011); "Reset to default" button; emits `onchange(BackgroundConfig)` callback; uses FileReader.readAsDataURL() for file → base64 conversion
- [ ] T012 [US3] Add Background section to SettingsSidebar in src/components/SettingsSidebar.svelte — add BackgroundPicker component in a "Background" section between General and Folder Colors; pass `settings.background` as value; on change, emit updated settings
- [ ] T013 [US3] Apply background styling in src/newtab/App.svelte — based on `settings.background.type`: solid → set `background-color` on main container; url/file → set `background-image` with `cover` sizing + CSS `::after` pseudo-element overlay `rgba(0,0,0,0.5)` for text readability (per research.md R5); use `position: relative` on main container for overlay positioning

**Checkpoint**: Background customization complete. All three modes (solid/URL/file) work with persistence.

---

## Phase 6: User Story 4 — Folder Colors (Priority: P2)

**Goal**: Users can assign colors from a 20-color palette to individual folders, visible on the dashboard

**Independent Test**: Open settings → Folder Colors section → click color dot → select color → verify folder icon on dashboard shows new color

### Implementation for User Story 4

- [ ] T014 [P] [US4] Create ColorPalette.svelte in src/components/ColorPalette.svelte — reusable 4×5 color grid popover; props: `colors: string[]` (from FOLDER_COLOR_PALETTE constant), `selected: string | undefined`, `onselect(color: string)`; renders as positioned popover on click; closes on selection or outside click
- [ ] T015 [US4] Add Folder Colors section to SettingsSidebar in src/components/SettingsSidebar.svelte — list all folders from `folders` prop; each row: folder emoji (📁), folder title, color dot button with current color (from `settings.folderColors[folder.id]` or default gray); clicking dot opens ColorPalette popover; on color select, update `settings.folderColors[folder.id]`; show "No folders found" if folders list is empty
- [ ] T016 [US4] Modify FolderIcon.svelte in src/components/FolderIcon.svelte — add optional `color: string | undefined` prop; when provided, apply as background-color on the folder icon container (replacing default gray); keep existing props/behavior unchanged
- [ ] T017 [US4] Pass folder colors from App.svelte to FolderIcon in src/newtab/App.svelte — when rendering folder icons, look up `settings.folderColors[folder.id]` and pass as `color` prop to each FolderIcon component

**Checkpoint**: Folder colors complete. Colors assigned in settings appear on dashboard folder icons.

---

## Phase 7: User Story 5 — Layout Offset (Priority: P3)

**Goal**: Users can adjust vertical spacing to push dashboard content away from the top edge

**Independent Test**: Open settings → adjust Top Offset slider → verify content moves down in real time → reload → verify offset persists

### Implementation for User Story 5

- [ ] T018 [US5] Apply verticalOffset to main content in src/newtab/App.svelte — read `settings.verticalOffset` and apply as `padding-top` style on the main content container; value already persisted by settings sidebar (T008); default 40px visible immediately on load

**Checkpoint**: Layout offset works. Single-task story complete.

---

## Phase 8: User Story 6 — Vim Mode (Priority: P3)

**Goal**: Users can enable optional hjkl navigation + gg/G jump shortcuts

**Independent Test**: Enable Vim Mode in settings → close sidebar → press hjkl → verify navigation matches arrow keys → press gg → verify jump to first → press G → verify jump to last → activate search → verify hjkl types normally

### Implementation for User Story 6

- [ ] T019 [US6] Extend keyboard.ts with vim mode support in src/lib/keyboard.ts — add `vimMode: boolean` and `pendingG: boolean` parameters to `handleNavKey` function; when vimMode enabled and not in search: map h→ArrowLeft, j→ArrowDown, k→ArrowUp, l→ArrowRight; handle G (shift+g) as jump-to-last (itemIndex = last item in last zone); return new action type `'pendingG'` when first `g` is pressed; handle second `g` within same call context as jump-to-first (itemIndex=0, zoneIndex=0)
- [ ] T020 [US6] Integrate vim mode into App.svelte key handler in src/newtab/App.svelte — pass `settings.vimMode` to handleNavKey; manage g-key pending state: on `'pendingG'` action, set a 500ms timeout; if second `g` arrives before timeout, execute jump-to-first; if different key or timeout, clear pending state and process normally; disable vim keys when settings sidebar is open (FR-016); add Vim Mode toggle to General section of settings sidebar

**Checkpoint**: Vim mode complete. All 6 keys (h, j, k, l, gg, G) work correctly with proper disable contexts.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Verification and quality checks across all features

- [ ] T021 Run type checking with `npm run check` — verify no TypeScript errors across all modified and new files
- [ ] T022 Build verification with `npm run build` — verify clean production build to dist/
- [ ] T023 Run quickstart.md manual validation — follow all test scenarios in specs/002-dash-settings/quickstart.md; verify each feature works in Chrome

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (types must exist before storage validates them)
- **User Stories (Phase 3–8)**: All depend on Phase 2 completion (storage layer must work)
  - US1 (Settings Sidebar) should complete first — it's the delivery mechanism for all other settings
  - US2 (Bookmark Sync) can run parallel to US1 — independent of settings UI
  - US3–US6 depend on US1 — they add sections/features to the settings sidebar
- **Polish (Phase 9)**: Depends on all stories being complete

### User Story Dependencies

- **US1 (Settings Sidebar)**: Phase 2 only — no other story dependencies. **MVP target.**
- **US2 (Bookmark Sync)**: Phase 2 only — fully independent of settings sidebar
- **US3 (Background)**: Phase 2 + US1 (needs sidebar to host BackgroundPicker)
- **US4 (Folder Colors)**: Phase 2 + US1 (needs sidebar to host color settings)
- **US5 (Layout Offset)**: Phase 2 + US1 (slider already created in US1 sidebar)
- **US6 (Vim Mode)**: Phase 2 + US1 (needs sidebar for toggle, keyboard.ts independent)

### Within Each User Story

- Components before integration
- Library code before UI code
- Core implementation before App.svelte integration

### Parallel Opportunities

**Phase 1**: T001 and T002 can run in parallel (different files)

**Phase 3 (US1)**: T005 (RangeSlider) and T006 (SettingsButton) can run in parallel

**Phase 5+6 (US3+US4)**: After US1 is complete, US3 and US4 can run in parallel:
- US3: T011 (BackgroundPicker) in parallel with US4: T014 (ColorPalette)
- Then integrate each into sidebar independently

**Phase 7+8 (US5+US6)**: After US1, US5 and US6 can run in parallel:
- US5 is a single task (T018)
- US6: T019 (keyboard.ts) can start immediately after Phase 2

---

## Parallel Example: After Phase 2

```
# These can all start simultaneously after Phase 2:
Agent A: T005 [P] [US1] RangeSlider.svelte     (no dependencies)
Agent B: T006 [P] [US1] SettingsButton.svelte   (no dependencies)
Agent C: T009 [US2] onChanged listener          (no dependencies on US1)

# After US1 completes (T008):
Agent A: T011 [P] [US3] BackgroundPicker.svelte (different file from Agent B)
Agent B: T014 [P] [US4] ColorPalette.svelte     (different file from Agent A)
Agent C: T019 [US6] keyboard.ts vim mode        (independent)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T002)
2. Complete Phase 2: Foundational (T003–T004)
3. Complete Phase 3: User Story 1 — Settings Sidebar (T005–T008)
4. **STOP and VALIDATE**: Open sidebar, change columns, close, reload — settings persist
5. Build and test in Chrome

### Incremental Delivery

1. Setup + Foundational → Storage ready
2. US1 (Settings Sidebar) → MVP! Settings panel works with columns slider
3. US2 (Bookmark Sync) → Pin integrity guaranteed
4. US3 (Background) + US4 (Folder Colors) → Visual customization
5. US5 (Layout Offset) + US6 (Vim Mode) → Polish features
6. Phase 9 → Final verification

### Single Developer Strategy

Recommended sequential order: T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009 → T010 → T011 → T012 → T013 → T014 → T015 → T016 → T017 → T018 → T019 → T020 → T021 → T022 → T023

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- No test tasks generated — spec did not request automated tests
- Manual testing follows quickstart.md scenarios
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
