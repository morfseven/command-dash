import type { AppState, PinnedSite, Settings, BackgroundConfig } from './types';
import { DEFAULT_STATE, DEFAULT_SETTINGS } from './types';

const STORAGE_KEY = 'commandDash';
const VALID_BG_TYPES = ['solid', 'url', 'file'] as const;

export async function loadState(): Promise<AppState> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  const stored = result[STORAGE_KEY] as Partial<AppState> | undefined;
  if (!stored) return { ...DEFAULT_STATE, pinnedSites: [] };

  const s = stored.settings;

  const columns =
    typeof s?.columns === 'number' && s.columns >= 1 && s.columns <= 12
      ? Math.floor(s.columns)
      : DEFAULT_SETTINGS.columns;

  const vimMode = typeof s?.vimMode === 'boolean' ? s.vimMode : DEFAULT_SETTINGS.vimMode;

  const verticalOffset =
    typeof s?.verticalOffset === 'number' && s.verticalOffset >= 0 && s.verticalOffset <= 120
      ? Math.floor(s.verticalOffset)
      : DEFAULT_SETTINGS.verticalOffset;

  let background: BackgroundConfig = { ...DEFAULT_SETTINGS.background };
  if (
    s?.background &&
    typeof s.background.type === 'string' &&
    (VALID_BG_TYPES as readonly string[]).includes(s.background.type) &&
    typeof s.background.value === 'string' &&
    s.background.value.length > 0
  ) {
    background = { type: s.background.type as BackgroundConfig['type'], value: s.background.value };
  }

  let folderColors: Record<string, string> = {};
  if (s?.folderColors && typeof s.folderColors === 'object' && !Array.isArray(s.folderColors)) {
    for (const [key, val] of Object.entries(s.folderColors)) {
      if (typeof key === 'string' && typeof val === 'string') {
        folderColors[key] = val;
      }
    }
  }

  return {
    pinnedSites: Array.isArray(stored.pinnedSites) ? stored.pinnedSites : [],
    settings: { columns, vimMode, verticalOffset, background, folderColors },
  };
}

export async function saveState(state: AppState): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: state });
}

let debounceTimer: ReturnType<typeof setTimeout> | undefined;

export function debouncedSaveState(state: AppState, folderIds?: string[]): void {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    // Clean up orphaned folderColors entries
    if (folderIds) {
      const folderIdSet = new Set(folderIds);
      const cleaned: Record<string, string> = {};
      for (const [key, val] of Object.entries(state.settings.folderColors)) {
        if (folderIdSet.has(key)) {
          cleaned[key] = val;
        }
      }
      state.settings.folderColors = cleaned;
    }
    saveState(state);
  }, 300);
}

export async function pinSite(site: Omit<PinnedSite, 'order'>): Promise<void> {
  const state = await loadState();
  const maxOrder = state.pinnedSites.reduce(
    (max, s) => Math.max(max, s.order),
    -1,
  );
  state.pinnedSites.push({ ...site, order: maxOrder + 1 });
  await saveState(state);
}

export async function unpinSite(id: string): Promise<void> {
  const state = await loadState();
  state.pinnedSites = state.pinnedSites.filter((s) => s.id !== id);
  await saveState(state);
}

export async function reorderPinnedSites(orderedIds: string[]): Promise<void> {
  const state = await loadState();
  const siteMap = new Map(state.pinnedSites.map((s) => [s.id, s]));
  state.pinnedSites = orderedIds
    .map((id, i) => {
      const site = siteMap.get(id);
      return site ? { ...site, order: i } : undefined;
    })
    .filter((s): s is PinnedSite => s !== undefined);
  await saveState(state);
}
