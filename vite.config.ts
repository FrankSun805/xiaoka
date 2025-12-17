import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 'base' set to './' ensures assets are loaded relatively, 
  // preventing 404 errors when deployed to https://user.github.io/repo/
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});