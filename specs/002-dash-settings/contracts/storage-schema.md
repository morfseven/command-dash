# Storage Contract: Settings & Enhancements

**Feature Branch**: `002-dash-settings`
**Date**: 2026-03-05

## Storage Key

**Key**: `commandDash`
**Backend**: `chrome.storage.local`
**Quota**: ~10MB (default, without `unlimitedStorage` permission)

## Schema

```typescript
interface AppState {
  pinnedSites: PinnedSite[];
  settings: Settings;
}

interface PinnedSite {
  id: string;       // Chrome bookmark ID
  url: string;      // Full URL
  name: string;     // Display name
  order: number;    // Sort position (0-indexed, contiguous)
}

interface Settings {
  columns: number;                      // 1–12, default: 6
  vimMode: boolean;                     // default: false
  verticalOffset: number;               // 0–120, default: 40
  background: BackgroundConfig;         // default: { type: 'solid', value: '#1a1a2e' }
  folderColors: Record<string, string>; // default: {}
}

interface BackgroundConfig {
  type: 'solid' | 'url' | 'file';
  value: string;
}
```

## Load Contract

```
loadState() → AppState
```

**Behavior**:
1. Read `commandDash` key from `chrome.storage.local`
2. If missing: return `DEFAULT_STATE`
3. If present: merge stored data with defaults
   - Each field validated individually
   - Invalid/missing fields fall back to defaults
   - Unknown fields are silently ignored

**Default values**:
```
pinnedSites: []
settings.columns: 6
settings.vimMode: false
settings.verticalOffset: 40
settings.background: { type: 'solid', value: '#1a1a2e' }
settings.folderColors: {}
```

**Validation rules**:
- `columns`: must be integer, 1 ≤ n ≤ 12
- `vimMode`: must be boolean
- `verticalOffset`: must be integer, 0 ≤ n ≤ 120
- `background.type`: must be one of `'solid'`, `'url'`, `'file'`
- `background.value`: must be non-empty string
- `folderColors`: must be object with string keys and string values

## Save Contract

```
saveState(state: AppState) → void
```

**Behavior**:
1. Write entire `AppState` to `commandDash` key atomically
2. Debounced: 300ms delay from last change before writing
3. During save, clean up `folderColors` entries for non-existent folders

## Bookmark Sync Contract

**Events handled**:

| Event | Condition | Action |
|-------|-----------|--------|
| `chrome.bookmarks.onChanged(id, changeInfo)` | `id` matches a pinned site | Update `name` and/or `url`, then save |
| `chrome.bookmarks.onRemoved(id, removeInfo)` | `id` matches a pinned site | Remove pinned site, reorder remaining, then save |
| `chrome.bookmarks.onRemoved(id, removeInfo)` | `id` matches a folder in `folderColors` | Remove color entry (lazy, on next save) |

**Reorder behavior**: After removal, reassign `order` values as 0, 1, 2, ... N-1 based on current sort order.

## Backward Compatibility

- Existing stored data from v1 (with only `columns` in settings) loads correctly
- Missing new fields get default values via merge
- No migration step required
- No data loss on upgrade
