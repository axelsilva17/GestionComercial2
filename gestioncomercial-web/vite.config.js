import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Tailwind CSS v4 is wired through its first-party Vite plugin. The official docs
// prefer this over the PostCSS path for Vite projects; it also removes the need for
// a `postcss.config` and a `tailwind.config.js` -- all tokens live in `src/index.css`.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
