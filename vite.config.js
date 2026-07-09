import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/*
 * `base` must stay absolute ('/'): with BrowserRouter, a deep link such as
 * /product/5 is served index.html by the host rewrite, and a relative base
 * would make the browser look for /product/assets/… instead of /assets/….
 * Deploy behind the SPA rewrite in vercel.json / public/_redirects.
 */
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: { port: 5173, open: true },
  build: { outDir: 'dist', sourcemap: true },
});
