import { defineConfig, devices } from '@playwright/test';

// Locally a preinstalled Chromium can be used via PAPIER_CHROMIUM; CI installs all three engines.
const chromiumPath = process.env.PAPIER_CHROMIUM;
const onlyChromium = !!chromiumPath;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  reporter: process.env.CI ? 'github' : 'list',
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{arg}{ext}',
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled' } },
  use: { baseURL: 'http://127.0.0.1:4332', contextOptions: { reducedMotion: 'reduce' } },
  webServer: { command: 'npx vite preview --config docs/vite.config.ts --port 4332 --strictPort', url: 'http://127.0.0.1:4332', reuseExistingServer: !process.env.CI },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], launchOptions: chromiumPath ? { executablePath: chromiumPath } : {} } },
    ...(onlyChromium ? [] : [
      { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
      { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    ]),
    { name: 'mobile', use: { ...devices['Pixel 7'], launchOptions: chromiumPath ? { executablePath: chromiumPath } : {} } },
  ],
});
