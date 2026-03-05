import type { BackgroundConfig } from './types';

export const FOLDER_COLOR_PALETTE: string[] = [
  '#FF6B6B', '#FF8E72', '#FFA94D', '#FFD93D', '#A8E6CF',
  '#6BCB77', '#4ECDC4', '#45B7D1', '#4EA8DE', '#6C63FF',
  '#9B59B6', '#E056A0', '#FF6B9D', '#C9B1FF', '#78D5D7',
  '#F7DC6F', '#E8A87C', '#85C1E9', '#D5A6BD', '#B8E986',
];

export const DEFAULT_BACKGROUND: BackgroundConfig = {
  type: 'solid',
  value: '#1a1a2e',
};

export const VERTICAL_OFFSET_RANGE = { min: 0, max: 120 } as const;

export const VIM_KEY_TIMEOUT = 500;
