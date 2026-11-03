import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" }); // makes the lab simulation instant
  await page.goto("/");
});

test("sample lab fails first, then passes after the fix", async ({ page }) => {
  await page.getByRole("button", { name: /start sample lab/i }).click();
  await expect(page.locator("#lab-result")).toContainText("Public access is still on");
  await expect(page.locator("#lab-steps li").last()).toHaveAttribute("data-state", "fail");

  await page.getByRole("button", { name: /run again with the fix/i }).click();
  await expect(page.locator("#lab-result")).toContainText("All checks passed");
  await expect(page.locator("#lab-steps li[data-state='pass']")).toHaveCount(4);
});

test("demo form shows errors, focuses the first invalid field, and clears on success", async ({ page }) => {
  await page.getByRole("button", { name: "Request demo" }).click();
  await expect(page.locator("#name-err")).toHaveText("Enter your name.");
  await expect(page.locator("#name")).toBeFocused();
  await expect(page.locator("#name")).toHaveAttribute("aria-invalid", "true");

  await page.getByLabel("Your name").fill("Asha");
  await page.getByLabel("Work email").fill("not-an-email");
  await page.getByLabel("What do you want to teach?").fill("Azure fundamentals");
  await page.getByRole("button", { name: "Request demo" }).click();
  await expect(page.locator("#email-err")).toContainText("name@company.com");

  await page.getByLabel("Work email").fill("asha@corp.in");
  await page.getByRole("button", { name: "Request demo" }).click();
  await expect(page.locator("#form-status")).toContainText("Thanks");
  await expect(page.getByLabel("Your name")).toHaveValue("");
});

test("FAQ items expand on click", async ({ page }) => {
  const item = page.locator("details").first();
  await expect(item).not.toHaveAttribute("open", "");
  await item.locator("summary").click();
  await expect(item).toHaveAttribute("open", "");
});

test("no horizontal scroll on a phone-sized screen", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
});
