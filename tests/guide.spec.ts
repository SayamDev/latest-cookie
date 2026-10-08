import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("site guide supports discovery, a real bookmark, keyboard dismissal and saved preference", async ({
  page,
}) => {
  await page.goto("/");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Close site guide" }),
  ).toBeFocused();
  await page.keyboard.press("/");
  await expect(
    page.getByRole("button", { name: "Close site guide" }),
  ).toBeFocused();
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await dialog.getByRole("button", { name: "Save this story" }).click();
  await expect(
    dialog.getByRole("button", { name: "Saved · undo" }),
  ).toHaveAttribute("aria-pressed", "true");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Site guide", exact: true }),
  ).toBeFocused();
  await page.reload();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.goto("/saved/");
  await expect(page.locator(".story-row")).toHaveCount(1);
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await page.getByRole("button", { name: "Site guide", exact: true }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.keyboard.press("Escape");
  await page.goto("/news/");
  await expect(page.getByLabel("Published within")).toHaveValue("1");
  await expect(
    page.getByLabel("Published within").locator("option"),
  ).toHaveText(["Latest · 24 hours", "7 days", "30 days"]);
});

test("first visit on a deep link opens once across tabs and returns after clearing site data", async ({
  page,
  context,
}) => {
  await page.goto("/models/");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "I’ll explore on my own" }).click();
  const next = await context.newPage();
  await next.goto("/news/");
  await expect(next.getByRole("dialog")).not.toBeVisible();
  await next.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await next.reload();
  await expect(next.getByRole("dialog")).toBeVisible();
});
test("session storage remembers the guide when persistent storage is blocked", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("Storage blocked");
      },
    }),
  );
  await page.goto("/");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.reload();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Site guide", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});
