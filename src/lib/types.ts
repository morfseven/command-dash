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

export interface BackgroundConfig {
  type: 'solid' | 'url' | 'file';
  value: string;
}

export interface Settings {
  columns: number;
  vimMode: boolean;
  verticalOffset: number;
  background: BackgroundConfig;
  folderColors: Record<string, string>;
}

export interface AppState {
  pinnedSites: PinnedSite[];
  settings: Settings;
}

export const DEFAULT_SETTINGS: Settings = {
  columns: 6,
  vimMode: false,
  verticalOffset: 40,
  background: { type: 'solid', value: '#1a1a2e' },
  folderColors: {},
};

export const DEFAULT_STATE: AppState = {
  pinnedSites: [],
  settings: { ...DEFAULT_SETTINGS },
};
