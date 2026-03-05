import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { resolve } from 'path'

export default defineConfig({
  plugins: [svelte()],
  build: {
    rollupOptions: {
      input: {
        newtab: resolve(__dirname, 'src/newtab/index.html'),
      },
    },
  },
})
