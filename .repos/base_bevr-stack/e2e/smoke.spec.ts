import { expect, test } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("client app loads successfully", async ({ page }) => {
    await page.goto("/");

    // Verify the main heading renders
    await expect(page.locator("h1")).toContainText("bEvr");

    // Verify subheading
    await expect(page.locator("h2")).toContainText(
      "Bun + Effect + Vite + React",
    );
  });

  test("server health endpoint responds", async ({ request }) => {
    const response = await request.get("http://localhost:9000");
    expect(response.ok()).toBeTruthy();
  });

  // Visual regression test - compares against committed baseline
  // Update with: bun run test:e2e -- --update-snapshots
  test("app layout matches visual baseline", async ({ page }) => {
    await page.goto("/");

    // Wait for the app to fully render
    await expect(page.locator("h1")).toContainText("bEvr");

    // Take full page screenshot and compare against baseline
    // Allow small pixel differences for dynamic content (timestamps, connection status)
    await expect(page).toHaveScreenshot("app-layout.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02, // Allow up to 2% pixel difference
    });
  });
});
