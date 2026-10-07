import { defineConfig, devices } from '@playwright/test';

// End-to-end tests of the production build, served under /learnHTML/ like GitHub Pages.
// Run `npm run build` first; `npm run test:e2e` does both.
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173/learnHTML/',
    serviceWorkers: 'allow',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: 'npx vite preview --base /learnHTML/ --port 4173 --strictPort',
    url: 'http://localhost:4173/learnHTML/',
    reuseExistingServer: !process.env.CI,
  },
});
