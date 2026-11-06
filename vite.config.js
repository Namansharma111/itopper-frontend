import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    chunkSizeWarningLimit: 1600,
    // Let Rollup preserve dependency initialization order. Splitting packages by
    // substrings such as "react" also captures @tiptap/react and creates cycles
    // between the React runtime, its scheduler and other vendor dependencies.
  },
});
