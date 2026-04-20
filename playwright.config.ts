import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: 'e2e-report' }]],
  use: {
    baseURL: process.env.CI ? 'https://tpv-sorveteria-demo.vercel.app' : 'http://localhost:5173',
    trace: 'on',
    screenshot: 'on',
    video: 'retain-on-failure',
  },
  webServer: process.env.CI ? undefined : {
    command: 'npx serve dist/cliente -l 5173',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
