<script lang="ts">
  import type { Settings, BookmarkFolder, BackgroundConfig } from '../lib/types';
  import { FOLDER_COLOR_PALETTE } from '../lib/constants';
  import RangeSlider from './RangeSlider.svelte';
  import BackgroundPicker from './BackgroundPicker.svelte';
  import ColorPalette from './ColorPalette.svelte';

  interface Props {
    open: boolean;
    settings: Settings;
    folders: BookmarkFolder[];
    onSettingsChange: (settings: Settings) => void;
    onClose: () => void;
  }

  let { open, settings, folders, onSettingsChange, onClose }: Props = $props();

  function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    onSettingsChange({ ...settings, [key]: value });
  }

  function updateFolderColor(folderId: string, color: string) {
    const folderColors = { ...settings.folderColors, [folderId]: color };
    onSettingsChange({ ...settings, folderColors });
  }
</script>

{#if open}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="backdrop" onclick={onClose} onkeydown={() => {}}></div>
{/if}

<aside class="sidebar" class:open>
  <div class="sidebar-header">
    <h2 class="sidebar-title">Settings</h2>
    <button class="close-button" onclick={onClose} aria-label="Close settings">✕</button>
  </div>

  <div class="sidebar-content">
    <section class="settings-section">
      <h3 class="section-heading">General</h3>

      <RangeSlider
        label="Columns"
        value={settings.columns}
        min={1}
        max={12}
        onchange={(v) => updateSetting('columns', v)}
      />

      <div class="setting-spacer"></div>

      <RangeSlider
        label="Top Offset"
        value={settings.verticalOffset}
        min={0}
        max={120}
        unit="px"
        onchange={(v) => updateSetting('verticalOffset', v)}
      />

      <div class="setting-spacer"></div>

      <label class="toggle-row">
        <span class="toggle-label">Vim Mode</span>
        <input
          type="checkbox"
          checked={settings.vimMode}
          onchange={(e) => updateSetting('vimMode', (e.target as HTMLInputElement).checked)}
        />
      </label>
    </section>

    <section class="settings-section">
      <h3 class="section-heading">Background</h3>
      <BackgroundPicker
        value={settings.background}
        onchange={(bg) => updateSetting('background', bg)}
      />
    </section>

    <section class="settings-section">
      <h3 class="section-heading">Folder Colors</h3>
      {#if folders.length > 0}
        <div class="folder-color-list">
          {#each folders as folder}
            <div class="folder-color-row">
              <span class="folder-color-emoji">📁</span>
              <span class="folder-color-name">{folder.title}</span>
              <ColorPalette
                colors={FOLDER_COLOR_PALETTE}
                selected={settings.folderColors[folder.id]}
                onselect={(color) => updateFolderColor(folder.id, color)}
              />
            </div>
          {/each}
        </div>
      {:else}
        <p class="empty-hint">No folders found</p>
      {/if}
    </section>
  </div>
</aside>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 90;
  }

  .sidebar {
    position: fixed;
    top: 0;
    right: 0;
    width: 320px;
    height: 100vh;
    background: #16162a;
    border-left: 1px solid rgba(255, 255, 255, 0.08);
    z-index: 100;
    transform: translateX(100%);
    transition: transform 0.25s ease;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 20px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .sidebar-title {
    font-size: 1rem;
    font-weight: 600;
    color: #e0e0e0;
    margin: 0;
  }

  .close-button {
    background: none;
    border: none;
    color: #888;
    font-size: 16px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: color 0.15s, background-color 0.15s;
  }

  .close-button:hover {
    color: #ccc;
    background: rgba(255, 255, 255, 0.06);
  }

  .sidebar-content {
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .settings-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .section-heading {
    font-size: 0.75rem;
    font-weight: 500;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0;
  }

  .setting-spacer {
    height: 4px;
  }

  .folder-color-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .folder-color-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 0;
  }

  .folder-color-emoji {
    font-size: 16px;
    flex-shrink: 0;
  }

  .folder-color-name {
    font-size: 0.85rem;
    color: #ccc;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .toggle-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
  }

  .toggle-label {
    font-size: 0.85rem;
    color: #ccc;
  }

  .toggle-row input[type='checkbox'] {
    accent-color: #6c63ff;
    width: 16px;
    height: 16px;
    cursor: pointer;
  }

  .empty-hint {
    font-size: 0.8rem;
    color: #666;
    margin: 0;
  }
</style>
