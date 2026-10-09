import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PORTFOLIO_TEST_URL || "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  expect: { timeout: 12000 },
  reporter: "list",
  use: {
    baseURL,
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", args: ["--enable-webgl", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [{name:"desktop",use:{...devices["Desktop Chrome"],viewport:{width:1440,height:1000}}}],
  webServer: { command: "npm run dev", url: baseURL, reuseExistingServer: true, timeout: 90000 },
});
