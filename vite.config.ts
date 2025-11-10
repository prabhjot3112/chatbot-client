import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig({
  plugins: [
    react(),
    cssInjectedByJsPlugin(), // 👈 inject CSS directly into JS
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    lib: {
      entry: 'src/embedEntry.tsx',
      name: 'ChatbotEmbed',
      fileName: () => 'embed.js',
      formats: ['iife'],
    },
  },
});
