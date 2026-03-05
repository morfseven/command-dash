# Data Model: Settings & Enhancements

**Feature Branch**: `002-dash-settings`
**Date**: 2026-03-05

## Entity Diagram

```
AppState
├── pinnedSites: PinnedSite[]     (existing, unchanged)
└── settings: Settings            (EXTENDED)
    ├── columns: number           (existing)
    ├── vimMode: boolean          (NEW)
    ├── verticalOffset: number    (NEW)
    ├── background: BackgroundConfig (NEW)
    │   ├── type: 'solid' | 'url' | 'file'
    │   └── value: string
    └── folderColors: Record<string, string> (NEW)
```

## Entities

### Settings (EXTENDED)

Extends the existing `Settings` interface with new fields.

| Field | Type | Default | Validation | Description |
|-------|------|---------|------------|-------------|
| columns | number | 6 | 1–12, integer | Grid column count (existing) |
| vimMode | boolean | false | boolean | Enable hjkl + gg/G navigation |
| verticalOffset | number | 40 | 0–120, integer | Top padding in pixels |
| background | BackgroundConfig | `{type:'solid', value:'#1a1a2e'}` | See BackgroundConfig | Dashboard background |
| folderColors | Record<string, string> | `{}` | Keys: valid folder IDs; Values: hex color | Per-folder color overrides |

**Backward compatibility**: New fields are optional at the storage level. `loadState()` merges stored partial data with defaults, so existing users get default values for all new fields without migration.

### BackgroundConfig (NEW)

| Field | Type | Validation | Description |
|-------|------|------------|-------------|
| type | `'solid' \| 'url' \| 'file'` | One of three literals | Background mode |
| value | string | Depends on type (see below) | Background value |

**Value validation by type**:
- `solid`: Must be a valid hex color string (e.g., `#1a1a2e`)
- `url`: Must be a valid URL string (http/https)
- `file`: Must be a valid base64 data URI starting with `data:image/`

### PinnedSite (EXISTING — behavior change)

No structural changes. Behavioral change: pinned sites now automatically update when source bookmarks change in Chrome.

| Field | Type | Description | Sync behavior |
|-------|------|-------------|---------------|
| id | string | Chrome bookmark ID | Match key for sync events |
| url | string | Bookmark URL | Updated on `onChanged` |
| name | string | Display name | Updated on `onChanged` |
| order | number | Sort position | Recomputed on removal |

**Sync events**:
- `chrome.bookmarks.onChanged(id, changeInfo)`: If `id` matches a pinned site, update `name` from `changeInfo.title` and `url` from `changeInfo.url`
- `chrome.bookmarks.onRemoved(id)`: If `id` matches a pinned site, remove it and reorder remaining sites (fill gaps)

### BookmarkFolder (EXISTING — display change)

No structural changes. Display change: folders can now have an associated color.

| Field | Type | Description |
|-------|------|-------------|
| id | string | Chrome bookmark folder ID |
| title | string | Folder name |
| bookmarkCount | number | Number of bookmarks in folder |

The color for a folder is resolved by looking up `settings.folderColors[folder.id]`. If not found, the default styling is used.

## Color Palette Constant

The 20-color preset palette is a static constant, not stored per-user:

```
#FF6B6B  #FF8E72  #FFA94D  #FFD93D  #A8E6CF
#6BCB77  #4ECDC4  #45B7D1  #4EA8DE  #6C63FF
#9B59B6  #E056A0  #FF6B9D  #C9B1FF  #78D5D7
#F7DC6F  #E8A87C  #85C1E9  #D5A6BD  #B8E986
```

## State Transitions

### Settings Sidebar

```
CLOSED → OPEN    (click gear icon OR press `,`)
OPEN   → CLOSED  (click outside OR press Escape OR click ✕)
```

When sidebar opens: `searchActive = false`, keyboard navigation disabled.
When sidebar closes: keyboard navigation re-enabled.

### Vim G-Key Buffer

```
IDLE      → PENDING_G  (press `g` when vimMode enabled)
PENDING_G → IDLE        (press `g` again → execute gg jump)
PENDING_G → IDLE        (press other key → discard, process new key)
PENDING_G → IDLE        (500ms timeout → discard)
```

## Storage Schema

Single key in `chrome.storage.local`:

```json
{
  "commandDash": {
    "pinnedSites": [
      { "id": "123", "url": "https://...", "name": "Site", "order": 0 }
    ],
    "settings": {
      "columns": 6,
      "vimMode": false,
      "verticalOffset": 40,
      "background": { "type": "solid", "value": "#1a1a2e" },
      "folderColors": { "456": "#FF6B6B", "789": "#4ECDC4" }
    }
  }
}
```

Maximum storage size: ~10MB. Background images (base64) are the primary consumer. Warning threshold: 5MB for a single uploaded file.
