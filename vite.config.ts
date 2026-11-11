import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' => works on Vercel, Netlify, GitHub Pages subpaths or any static server.
export default defineConfig({
  plugins: [react()],
  base: './',
});
