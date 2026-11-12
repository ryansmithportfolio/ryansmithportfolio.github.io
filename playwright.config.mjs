import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

/**
 * Smoke tests for the live site, served exactly as GitHub Pages serves it: the
 * repo root as static files, no build. See decisions/ADR-0009.
 */
export default defineConfig({
  testDir: 'tests',
  testMatch: '*.spec.mjs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    ...devices['Desktop Chrome'],
    // Per ADR-0002: the opening sweep settles at once, so every state is
    // deterministic. The sweep's motion itself is outside what this verifies.
    reducedMotion: 'reduce',
    // CI uses Playwright's own Chromium. Locally, CHROME_PATH can point at an
    // installed Chrome instead of downloading one.
    launchOptions: process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
  },
  webServer: {
    command: `python3 -m http.server ${PORT}`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    stderr: 'ignore',
  },
});
