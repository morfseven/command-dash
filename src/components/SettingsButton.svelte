<script lang="ts">
  interface Props {
    onclick: () => void;
  }

  let { onclick }: Props = $props();
</script>

<button class="settings-button" {onclick} aria-label="Open settings">
  ⚙
</button>

<style>
  .settings-button {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #888;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.15s, color 0.15s;
    z-index: 10;
  }

  .settings-button:hover {
    background: rgba(255, 255, 255, 0.14);
    color: #ccc;
  }
</style>
