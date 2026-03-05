<script lang="ts">
  interface Props {
    label: string;
    value: number;
    min: number;
    max: number;
    unit?: string;
    onchange: (value: number) => void;
  }

  let { label, value, min, max, unit = '', onchange }: Props = $props();
</script>

<div class="range-slider">
  <div class="range-header">
    <span class="range-label">{label}</span>
    <span class="range-value">{value}{unit}</span>
  </div>
  <input
    type="range"
    {min}
    {max}
    {value}
    oninput={(e) => onchange(parseInt((e.target as HTMLInputElement).value))}
  />
</div>

<style>
  .range-slider {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .range-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .range-label {
    font-size: 0.85rem;
    color: #ccc;
  }

  .range-value {
    font-size: 0.8rem;
    color: #888;
    font-variant-numeric: tabular-nums;
  }

  input[type='range'] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 2px;
    outline: none;
    cursor: pointer;
  }

  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    background: #6c63ff;
    border-radius: 50%;
    cursor: pointer;
    transition: background-color 0.15s;
  }

  input[type='range']::-webkit-slider-thumb:hover {
    background: #7e77ff;
  }
</style>
