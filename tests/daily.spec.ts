import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("daily news and topic-based video discovery", async ({ page }, info) => {
  await page.goto("/news/");
  await expect(
    page.getByRole("heading", { name: "THE NEWS DESK." }),
  ).toBeVisible();
  await page.getByLabel("Outlet", { exact: true }).selectOption("The Verge");
  await expect(page.locator(".news-list article").first()).toContainText(
    "The Verge",
  );
  await page.getByLabel("Search headlines").fill("zzznomatcheszzz");
  await expect(
    page.getByRole("heading", { name: "No headlines match." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset filters" }).click();
  await page.route("**/daily.json", (route) => route.abort());
  await page.getByRole("button", { name: "Check published updates" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "saved snapshot" }),
  ).toBeVisible();
  await page.screenshot({
    path: `docs/design/${info.project.name}-news.png`,
    fullPage: true,
  });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.goto("/watch/");
  await expect(page.getByLabel("Published within")).toHaveValue("1");
  await page.getByLabel("Published within").selectOption("30");
  await page.getByRole("button", { name: "AI", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "AI", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".video-grid article").first()).toBeVisible();
  for (const text of await page
    .locator(".video-grid .news-item-meta")
    .allTextContents())
    expect(text).toContain("AI");
  await page.getByLabel("Video order").selectOption("latest");
  await page.screenshot({
    path: `docs/design/${info.project.name}-watch.png`,
    fullPage: true,
  });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await expect(page.locator("body")).toHaveJSProperty(
    "scrollWidth",
    await page.evaluate(() => innerWidth),
  );
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({
    path: `docs/design/${info.project.name}-watch-dark.png`,
    fullPage: true,
  });
});
test("expanded catalogue handles tiered prices and source filters", async ({
  page,
}) => {
  await page.goto("/models/");
  await page
    .getByLabel("Pricing source", { exact: true })
    .selectOption("OpenRouter");
  await page.getByLabel("Find a model").fill("Claude Haiku 5.5");
  await page
    .getByRole("button", {
      name: "Compare Claude Haiku 5.5 (OpenRouter)",
      exact: true,
    })
    .click();
  await expect(
    page
      .getByRole("region", { name: /Selected model comparison/ })
      .getByRole("row", { name: /Your estimated cost/ }),
  ).toContainText("tiered pricing");
  await page.getByRole("button", { name: "Reset filters" }).click();
  await expect(
    page.getByRole("button", { name: "Show 24 more models" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Show 24 more models" }).click();
  await expect(page.getByText(/48 of \d+ shown/)).toBeVisible();
});
