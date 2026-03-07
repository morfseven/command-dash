export interface Zone {
  id: string;
  itemCount: number;
}

export interface NavState {
  zoneIndex: number;
  itemIndex: number;
  searchActive: boolean;
}

export function createInitialNav(): NavState {
  return {
    zoneIndex: 0,
    itemIndex: 0,
    searchActive: false,
  };
}

export type NavAction =
  | { type: 'navigate'; url: string }
  | { type: 'activateSearch' }
  | { type: 'deactivateSearch' }
  | { type: 'focusResults' }
  | { type: 'pendingG' }
  | { type: 'none' };

export function handleNavKey(
  key: string,
  state: NavState,
  zones: Zone[],
  columns: number,
  vimMode: boolean = false,
): { state: NavState; action: NavAction } {
  if (zones.length === 0) {
    return { state, action: { type: 'none' } };
  }

  // Vim mode key mapping
  if (vimMode && !state.searchActive) {
    switch (key) {
      case 'h': key = 'ArrowLeft'; break;
      case 'j': key = 'ArrowDown'; break;
      case 'k': key = 'ArrowUp'; break;
      case 'l': key = 'ArrowRight'; break;
      case 'G': {
        // Jump to last item in last zone
        const lastZone = zones[zones.length - 1];
        return {
          state: { ...state, zoneIndex: zones.length - 1, itemIndex: lastZone.itemCount - 1 },
          action: { type: 'none' },
        };
      }
      case 'g':
        return { state, action: { type: 'pendingG' } };
      case 'gg': {
        // Jump to first item in first zone
        return {
          state: { ...state, zoneIndex: 0, itemIndex: 0 },
          action: { type: 'none' },
        };
      }
    }
  }

  // Clamp zone/item indices to valid range
  const zoneIndex = Math.min(state.zoneIndex, zones.length - 1);
  const zone = zones[zoneIndex];
  const itemIndex = Math.min(state.itemIndex, Math.max(0, zone.itemCount - 1));

  switch (key) {
    case 'ArrowRight': {
      if (state.searchActive) return { state, action: { type: 'none' } };
      const next = itemIndex + 1;
      if (next < zone.itemCount) {
        return {
          state: { ...state, zoneIndex, itemIndex: next },
          action: { type: 'none' },
        };
      }
      return { state: { ...state, zoneIndex, itemIndex }, action: { type: 'none' } };
    }

    case 'ArrowLeft': {
      if (state.searchActive) return { state, action: { type: 'none' } };
      const prev = itemIndex - 1;
      if (prev >= 0) {
        return {
          state: { ...state, zoneIndex, itemIndex: prev },
          action: { type: 'none' },
        };
      }
      return { state: { ...state, zoneIndex, itemIndex }, action: { type: 'none' } };
    }

    case 'ArrowDown': {
      if (state.searchActive) return { state, action: { type: 'none' } };
      const nextRow = itemIndex + columns;
      if (nextRow < zone.itemCount) {
        return {
          state: { ...state, zoneIndex, itemIndex: nextRow },
          action: { type: 'none' },
        };
      }
      // Move to next zone
      const nextZone = zoneIndex + 1;
      if (nextZone < zones.length) {
        return {
          state: { ...state, zoneIndex: nextZone, itemIndex: 0 },
          action: { type: 'none' },
        };
      }
      return { state: { ...state, zoneIndex, itemIndex }, action: { type: 'none' } };
    }

    case 'ArrowUp': {
      if (state.searchActive) return { state, action: { type: 'none' } };
      const prevRow = itemIndex - columns;
      if (prevRow >= 0) {
        return {
          state: { ...state, zoneIndex, itemIndex: prevRow },
          action: { type: 'none' },
        };
      }
      // Move to previous zone
      const prevZone = zoneIndex - 1;
      if (prevZone >= 0) {
        const prevZoneData = zones[prevZone];
        const lastItem = Math.max(0, prevZoneData.itemCount - 1);
        return {
          state: { ...state, zoneIndex: prevZone, itemIndex: lastItem },
          action: { type: 'none' },
        };
      }
      return { state: { ...state, zoneIndex, itemIndex }, action: { type: 'none' } };
    }

    case 'Tab': {
      if (state.searchActive) {
        return {
          state: { ...state, searchActive: false, zoneIndex: 0, itemIndex: 0 },
          action: { type: 'focusResults' },
        };
      }
      const nextZone = (zoneIndex + 1) % zones.length;
      return {
        state: { ...state, zoneIndex: nextZone, itemIndex: 0 },
        action: { type: 'none' },
      };
    }

    case 'ShiftTab': {
      if (state.searchActive) {
        return {
          state: { ...state, searchActive: false, zoneIndex: 0, itemIndex: 0 },
          action: { type: 'focusResults' },
        };
      }
      const prevZone = (zoneIndex - 1 + zones.length) % zones.length;
      return {
        state: { ...state, zoneIndex: prevZone, itemIndex: 0 },
        action: { type: 'none' },
      };
    }

    case 'Escape': {
      if (state.searchActive) {
        return {
          state: { ...state, searchActive: false },
          action: { type: 'deactivateSearch' },
        };
      }
      return { state, action: { type: 'none' } };
    }

    default:
      return { state, action: { type: 'none' } };
  }
}
