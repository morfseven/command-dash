<script lang="ts">
  import type { BackgroundConfig } from '../lib/types';

  interface Props {
    value: BackgroundConfig;
    onchange: (config: BackgroundConfig) => void;
  }

  let { value, onchange }: Props = $props();

  const PRESET_COLORS = ['#1a1a2e', '#0f3460', '#16213e', '#1b262c', '#2d132c', '#1a1a1a'];

  function handleTypeChange(type: BackgroundConfig['type']) {
    if (type === 'solid') {
      onchange({ type: 'solid', value: '#1a1a2e' });
    } else if (type === 'url') {
      onchange({ type: 'url', value: '' });
    } else {
      onchange({ type: 'file', value: '' });
    }
  }

  function handleFileUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB. Large images may impact storage limits.');
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onchange({ type: 'file', value: result });
    };
    reader.readAsDataURL(file);
  }

  function handleReset() {
    onchange({ type: 'solid', value: '#1a1a2e' });
  }
</script>

<div class="background-picker">
  <div class="type-selector">
    <label class="radio-label">
      <input type="radio" name="bg-type" value="solid" checked={value.type === 'solid'} onchange={() => handleTypeChange('solid')} />
      Solid
    </label>
    <label class="radio-label">
      <input type="radio" name="bg-type" value="url" checked={value.type === 'url'} onchange={() => handleTypeChange('url')} />
      URL
    </label>
    <label class="radio-label">
      <input type="radio" name="bg-type" value="file" checked={value.type === 'file'} onchange={() => handleTypeChange('file')} />
      File
    </label>
  </div>

  {#if value.type === 'solid'}
    <div class="color-input-row">
      <input
        type="color"
        value={value.value}
        oninput={(e) => onchange({ type: 'solid', value: (e.target as HTMLInputElement).value })}
      />
      <span class="color-hex">{value.value}</span>
    </div>
    <div class="preset-colors">
      {#each PRESET_COLORS as color}
        <button
          class="preset-dot"
          class:selected={value.value === color}
          style="background-color: {color}"
          onclick={() => onchange({ type: 'solid', value: color })}
          aria-label="Select {color}"
        ></button>
      {/each}
    </div>
  {:else if value.type === 'url'}
    <input
      class="text-input"
      type="text"
      placeholder="https://example.com/image.jpg"
      value={value.value}
      oninput={(e) => onchange({ type: 'url', value: (e.target as HTMLInputElement).value })}
    />
  {:else}
    <input
      class="file-input"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      onchange={handleFileUpload}
    />
    {#if value.value}
      <div class="thumbnail">
        <img src={value.value} alt="Background preview" />
      </div>
    {/if}
  {/if}

  <button class="reset-button" onclick={handleReset}>Reset to default</button>
</div>

<style>
  .background-picker {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .type-selector {
    display: flex;
    gap: 16px;
  }

  .radio-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.85rem;
    color: #ccc;
    cursor: pointer;
  }

  .radio-label input[type='radio'] {
    accent-color: #6c63ff;
  }

  .color-input-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .color-input-row input[type='color'] {
    width: 36px;
    height: 28px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 4px;
    background: none;
    cursor: pointer;
    padding: 0;
  }

  .color-hex {
    font-size: 0.8rem;
    color: #888;
    font-family: monospace;
  }

  .preset-colors {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .preset-dot {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    transition: border-color 0.15s;
  }

  .preset-dot:hover {
    border-color: rgba(255, 255, 255, 0.3);
  }

  .preset-dot.selected {
    border-color: #6c63ff;
  }

  .text-input {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 6px;
    color: #ccc;
    padding: 8px 10px;
    font-size: 0.85rem;
    outline: none;
  }

  .text-input:focus {
    border-color: #6c63ff;
  }

  .file-input {
    font-size: 0.8rem;
    color: #999;
  }

  .thumbnail {
    border-radius: 6px;
    overflow: hidden;
    max-height: 120px;
  }

  .thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .reset-button {
    align-self: flex-start;
    background: none;
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #888;
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 0.75rem;
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
  }

  .reset-button:hover {
    color: #ccc;
    border-color: rgba(255, 255, 255, 0.2);
  }
</style>
