import { defineConfig } from 'vite';

export default defineConfig({
  base: '/brawlstars/',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
