import { test as setup, expect } from "@playwright/test";

const authFile = "e2e/.auth/user.json";

setup("authenticate", async ({ page }) => {
  // Navigate to login
  await page.goto("/auth/login");

  // Perform login with test credentials
  await page.getByLabel("Email").fill("test@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in" }).click();

  // Wait for login to complete
  await expect(page).toHaveURL(/dashboard/);

  // Save authentication state
  await page.context().storageState({ path: authFile });
});
