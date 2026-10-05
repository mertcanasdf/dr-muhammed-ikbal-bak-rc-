// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://www.muhammedikbalbakirci.com',
  devToolbar: { enabled: false },
  trailingSlash: 'never',
  // Sayfalar hakkinda.html olarak üretilir; /hakkinda doğrudan 200 döner (dizin + 301 /hakkinda/ yönlendirmesi oluşmaz).
  build: { format: 'file' },
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
