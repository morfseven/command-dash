import type { AppState, PinnedSite } from './types';
import { DEFAULT_STATE } from './types';

const STORAGE_KEY = 'commandDash';

export async function loadState(): Promise<AppState> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  const stored = result[STORAGE_KEY] as Partial<AppState> | undefined;
  if (!stored) return { ...DEFAULT_STATE, pinnedSites: [] };

  return {
    pinnedSites: Array.isArray(stored.pinnedSites) ? stored.pinnedSites : [],
    settings: {
      columns:
        stored.settings?.columns &&
        stored.settings.columns >= 1 &&
        stored.settings.columns <= 12
          ? stored.settings.columns
          : DEFAULT_STATE.settings.columns,
    },
  };
}

export async function saveState(state: AppState): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: state });
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
