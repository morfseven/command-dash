export interface PinnedSite {
  id: string;
  url: string;
  name: string;
  order: number;
}

export interface BookmarkSite {
  id: string;
  url: string;
  title: string;
}

export interface BookmarkFolder {
  id: string;
  title: string;
  bookmarkCount: number;
}

export interface Settings {
  columns: number;
}

export interface AppState {
  pinnedSites: PinnedSite[];
  settings: Settings;
}

export const DEFAULT_SETTINGS: Settings = {
  columns: 6,
};

export const DEFAULT_STATE: AppState = {
  pinnedSites: [],
  settings: { ...DEFAULT_SETTINGS },
};
