// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://www.muhammedikbalbakirci.com',
  devToolbar: { enabled: false },
  trailingSlash: 'never',
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  vite: {
    cacheDir: process.env.VITE_CACHE_DIR || './.vite-cache',
    optimizeDeps: {
      exclude: ['aria-query', 'axobject-query'],
    },
  },
});
