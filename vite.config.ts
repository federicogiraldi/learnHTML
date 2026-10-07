/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      // A new version waits for the learner to click "Update" (see src/components/Banners.tsx).
      registerType: 'prompt',
      // Paths stay relative so the app works under /learnHTML/ on GitHub Pages and at / in preview.
      base: './',
      scope: './',
      // The icons are precached by globPatterns below.
      includeManifestIcons: false,
      manifest: {
        id: './',
        name: 'LearnWeb',
        short_name: 'LearnWeb',
        description: 'Learn HTML, CSS and JavaScript by writing it: lessons, a live preview and challenges.',
        lang: 'en',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#0e0e13',
        theme_color: '#15151c',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Only the app itself is precached. External images (picsum.photos) and Google Fonts used in lessons
        // have no runtime route either: they always come from the network.
        globPatterns: ['**/*.{js,css,html,svg,png}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
    }),
  ],
  build: { chunkSizeWarningLimit: 1000 },
  // Pre-bundled up front so the first test run doesn't reload when it discovers the dependency.
  optimizeDeps: { include: ['@codemirror/lang-javascript'] },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          include: ['src/**/*.test.ts'],
          exclude: ['src/**/*.browser.test.ts'],
        },
      },
      {
        // CSS checks read computed styles and layout, which need a real browser.
        extends: true,
        test: {
          name: 'browser',
          include: ['src/**/*.browser.test.ts'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
