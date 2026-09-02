import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end suite.
 *
 * Runs against the real static export, not the dev server, so what is tested is
 * exactly what gets deployed. Two projects: a desktop viewport and a phone,
 * because half of the critical paths on this site are thumb-driven.
 *
 *   npx playwright install chromium   # once
 *   npm run test:e2e
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npx serve out -l 4173 --no-clipboard",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
