import { expect, test } from "@playwright/test";

test.describe("BreathePulse Home", () => {
  test("renders the home page with breathing controls", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Guided Breathing" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Start breathing session" })).toBeVisible();
  });

  test("allows pattern selection", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("radio", { name: /4-7-8/i }).click();
    await expect(page.getByRole("radio", { name: /4-7-8/i })).toHaveAttribute("aria-checked", "true");
  });

  test("navigates to dashboard", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Dashboard" }).click();
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });
});
