# Feature Specification: Settings & Enhancements

**Feature Branch**: `002-dash-settings`
**Created**: 2026-03-05
**Status**: Draft
**Input**: Design document: `docs/plans/2026-03-05-settings-and-enhancements-design.md`

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Settings Sidebar (Priority: P1)

A user wants to customize their Command Dash experience. They click a gear icon in the bottom-right corner (or press `,`) to open a settings panel that slides in from the right. The panel contains all customization options organized in clear sections. Changes apply immediately as a live preview. The user closes the panel by clicking outside, pressing `✕`, or pressing Escape.

**Why this priority**: The settings sidebar is the delivery mechanism for all other features. Without it, no customization is accessible to users.

**Independent Test**: Can be fully tested by opening/closing the sidebar and verifying it appears, displays sections, and dismisses correctly.

**Acceptance Scenarios**:

1. **Given** the dashboard is displayed, **When** the user clicks the gear icon in the bottom-right, **Then** a settings panel slides in from the right edge (320px wide)
2. **Given** the settings panel is open, **When** the user clicks outside the panel, **Then** the panel closes
3. **Given** the settings panel is open, **When** the user presses Escape, **Then** the panel closes
4. **Given** the settings panel is open, **When** the user presses the ✕ button, **Then** the panel closes
5. **Given** the dashboard is displayed and search is not active, **When** the user presses `,`, **Then** the settings panel opens
6. **Given** the settings panel is open, **When** the user changes any setting, **Then** the change applies immediately as a live preview
7. **Given** the settings panel is open, **When** the user changes any setting, **Then** the change is persisted and survives page reload

---

### User Story 2 - Bookmark Sync (Priority: P1)

A user has pinned several bookmarks to their dashboard. When they rename, edit the URL, or delete a bookmark through Chrome's bookmark manager, the pinned site on the dashboard automatically reflects the change without any manual action.

**Why this priority**: Stale or broken pinned sites directly undermine the core value proposition — fast, reliable access to bookmarks. This is a data integrity issue.

**Independent Test**: Can be tested by pinning a bookmark, modifying it via Chrome's bookmark manager, and verifying the dashboard updates.

**Acceptance Scenarios**:

1. **Given** a bookmark is pinned on the dashboard, **When** the user renames the bookmark in Chrome, **Then** the pinned site's name updates automatically on the dashboard
2. **Given** a bookmark is pinned on the dashboard, **When** the user changes the bookmark's URL in Chrome, **Then** the pinned site's URL and icon update automatically
3. **Given** a bookmark is pinned on the dashboard, **When** the user deletes the bookmark in Chrome, **Then** the pinned site is automatically removed from the dashboard
4. **Given** multiple bookmarks are pinned and one is removed, **When** the removal occurs, **Then** the remaining pinned sites reorder to fill the gap (no empty spots)
5. **Given** a bookmark is pinned on the dashboard, **When** the user moves the bookmark to a different folder in Chrome, **Then** the pinned site remains on the dashboard (pinning is independent of folder location)

---

### User Story 3 - Background Customization (Priority: P2)

A user wants to personalize the look of their new tab page. They open settings and choose from three background options: a solid color, an image from a URL, or a locally uploaded image file. The background changes immediately and persists across sessions.

**Why this priority**: Visual personalization is a high-value feature that significantly improves user satisfaction and sense of ownership.

**Independent Test**: Can be tested by selecting each background type and verifying it displays correctly.

**Acceptance Scenarios**:

1. **Given** the settings panel is open in the Background section, **When** the user selects "Solid" and picks a color, **Then** the dashboard background changes to that color immediately
2. **Given** the settings panel is open in the Background section, **When** the user selects "URL" and enters a valid image URL, **Then** the dashboard background shows that image with a dark overlay for text readability
3. **Given** the settings panel is open in the Background section, **When** the user selects "File" and uploads an image (jpg/png/webp), **Then** the dashboard background shows that image with a dark overlay
4. **Given** a background image is set, **When** the user reloads the page, **Then** the background persists
5. **Given** the settings panel is open in the Background section, **When** the user clicks "Reset to default", **Then** the background returns to the default solid color
6. **Given** the user uploads a file, **When** the file exceeds 5MB, **Then** a warning is displayed informing the user about size limitations

---

### User Story 4 - Folder Colors (Priority: P2)

A user wants to visually distinguish their bookmark folders by assigning different colors. They open settings, see their folder list, and click a color dot next to each folder to choose from a 20-color palette. The folder's appearance updates immediately on the dashboard.

**Why this priority**: Color-coding folders improves visual scanning speed and reduces cognitive load when navigating many folders.

**Independent Test**: Can be tested by assigning a color to a folder and verifying it appears on the dashboard.

**Acceptance Scenarios**:

1. **Given** the settings panel is open in the Folder Colors section, **When** the user sees their folders, **Then** each folder displays its name and a colored dot (default or previously assigned)
2. **Given** the settings panel shows a folder row, **When** the user clicks the color dot, **Then** a 20-color palette popover appears
3. **Given** the color palette is open, **When** the user clicks a color, **Then** the folder's color updates immediately on the dashboard and the palette closes
4. **Given** a folder has a custom color, **When** the dashboard displays that folder, **Then** the folder icon uses the assigned color instead of the default
5. **Given** a folder with a custom color is deleted in Chrome, **When** the settings are next saved, **Then** the orphaned color entry is cleaned up

---

### User Story 5 - Layout Offset (Priority: P3)

A user finds the dashboard content too close to the top of the screen. They open settings and adjust a slider to push content downward, creating more breathing room at the top.

**Why this priority**: Improves visual comfort but is a minor aesthetic adjustment.

**Independent Test**: Can be tested by adjusting the slider and verifying content moves down.

**Acceptance Scenarios**:

1. **Given** the settings panel is open in the General section, **When** the user adjusts the Top Offset slider, **Then** the dashboard content moves down/up in real time
2. **Given** the Top Offset slider, **When** the user drags it, **Then** the value ranges from 0px to 120px with a default of 40px
3. **Given** a custom offset is set, **When** the user reloads the page, **Then** the offset persists

---

### User Story 6 - Vim Mode (Priority: P3)

A user who is accustomed to Vim keybindings wants to navigate the dashboard using hjkl instead of arrow keys. They enable Vim Mode in settings. Now they can use h/j/k/l for directional movement, gg to jump to the first item, and G to jump to the last item.

**Why this priority**: Niche but valuable for power users who are keyboard-centric.

**Independent Test**: Can be tested by enabling vim mode and navigating using hjkl keys.

**Acceptance Scenarios**:

1. **Given** Vim Mode is enabled in settings, **When** the user presses h/j/k/l, **Then** the focus moves left/down/up/right respectively (same as arrow keys)
2. **Given** Vim Mode is enabled, **When** the user presses g followed by g within a short window, **Then** focus jumps to the first item
3. **Given** Vim Mode is enabled, **When** the user presses G (shift+g), **Then** focus jumps to the last item
4. **Given** Vim Mode is enabled and search is active, **When** the user types h/j/k/l, **Then** the characters are typed into the search input (vim keys disabled during search)
5. **Given** Vim Mode is enabled and the settings sidebar is open, **When** the user types h/j/k/l, **Then** the characters behave normally (vim keys disabled while settings are open)
6. **Given** Vim Mode is disabled (default), **When** the user presses h/j/k/l, **Then** nothing happens (arrow keys work as usual)

---

### Edge Cases

- What happens when the user uploads a background image and storage is nearly full? → Warning displayed before saving, with option to cancel
- What happens when a pinned site's source bookmark is both renamed AND moved simultaneously? → Both changes are reflected; the pin remains with the updated name
- What happens if the user opens settings while search is active? → Search deactivates, settings panel opens
- What happens if Chrome has no bookmark folders? → Folder Colors section shows "No folders found" message
- What happens if a background image URL becomes unreachable after being set? → The broken image is displayed; user can change it in settings. No automatic fallback
- What happens when the user presses `g` once in Vim mode and then presses a different key? → The `g` is discarded, the second key is processed normally

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a settings panel accessible via a visible button and a keyboard shortcut
- **FR-002**: Settings panel MUST slide in from the right edge and close on outside click, Escape key, or close button
- **FR-003**: All setting changes MUST apply immediately as a live preview without requiring a save/confirm action
- **FR-004**: All settings MUST persist across page reloads and browser sessions
- **FR-005**: System MUST automatically update pinned site names when the source bookmark is renamed in Chrome
- **FR-006**: System MUST automatically update pinned site URLs when the source bookmark's URL is changed in Chrome
- **FR-007**: System MUST automatically remove a pinned site when the source bookmark is deleted in Chrome
- **FR-008**: When a pinned site is removed, remaining pinned sites MUST reorder to fill gaps
- **FR-009**: System MUST provide three background options: solid color, URL image, and local file upload
- **FR-010**: Background images MUST include a dark overlay to maintain text readability
- **FR-011**: System MUST warn users when an uploaded background file exceeds 5MB
- **FR-012**: System MUST offer a 20-color preset palette for folder color customization
- **FR-013**: Each folder MUST be independently assignable to a color from the palette
- **FR-014**: System MUST provide a slider to adjust vertical content offset (range: 0–120px, default: 40px)
- **FR-015**: System MUST offer an optional Vim navigation mode with h/j/k/l directional keys and gg/G jump shortcuts
- **FR-016**: Vim mode MUST be disabled during text input (search, settings) to avoid conflicts
- **FR-017**: System MUST maintain backward compatibility with existing user data (existing settings and pins preserved after update)
- **FR-018**: Keyboard navigation MUST be disabled while the settings sidebar is open
- **FR-019**: Orphaned folder color entries (for deleted folders) MUST be cleaned up automatically

### Key Entities

- **Settings**: User preferences including column count, vim mode toggle, vertical offset, background configuration, and per-folder color assignments
- **Background Configuration**: A background type (solid/url/file) paired with a value (color code, URL, or image data)
- **Pinned Site**: A user-selected bookmark displayed prominently on the dashboard, linked to a Chrome bookmark by ID
- **Folder Color**: An association between a bookmark folder and a color from the preset palette

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can access and modify any setting within 3 clicks (open sidebar → navigate to section → change value)
- **SC-002**: Setting changes are visually reflected within 100ms of user interaction (live preview)
- **SC-003**: Pinned sites update within 1 second of the corresponding Chrome bookmark being modified or deleted
- **SC-004**: 100% of existing user data (pinned sites, column settings) is preserved after upgrading to the new version
- **SC-005**: Users can set a custom background and have it persist across 100 consecutive page reloads without degradation
- **SC-006**: All 6 vim navigation keys (h, j, k, l, gg, G) behave identically to their arrow key/Home/End equivalents
- **SC-007**: Settings sidebar opens and closes smoothly with no visual glitches across standard viewport sizes (1280×720 and above)

## Assumptions

- Users have Chrome 120+ which supports Manifest V3 and the relevant bookmark/storage APIs
- Background images uploaded by users are typically under 5MB; the 10MB total storage limit is sufficient for settings + one background image
- The 20-color preset palette provides sufficient choice without overwhelming users; a full color picker is not needed at this stage
- Vim mode users are familiar with standard Vim navigation conventions and don't need in-app tutorials
- The `,` keyboard shortcut for settings does not conflict with any existing keyboard shortcut in the application
- Settings changes are frequent enough to warrant live preview but infrequent enough that debounced saving (rather than immediate) is acceptable

## Scope & Boundaries

**In Scope**:
- Settings sidebar UI with General, Background, and Folder Colors sections
- Bookmark sync (rename, URL change, delete) for pinned sites
- Solid color, URL image, and file upload background options
- 20-color preset folder palette
- Adjustable vertical offset slider
- Optional Vim navigation mode (hjkl + gg/G)
- Backward-compatible settings persistence

**Out of Scope**:
- Unsplash or third-party image API integration
- Full Vim command mode (`:` commands, `/` search override)
- Custom color picker (HSL/HEX free input)
- Settings export/import
- Cross-device sync (chrome.storage.sync)
- Gradient backgrounds
- Per-bookmark (non-folder) color customization
