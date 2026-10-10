import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
// These journeys exercise returning visitors; guide.spec.ts covers first visits.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("latest-cookie:guide-seen", "yes"),
  );
});
test("daily news and topic-based video discovery", async ({ page }, info) => {
  await page.goto("/news/");
  await expect(
    page.getByRole("heading", { name: "THE NEWS DESK." }),
  ).toBeVisible();
  await page.getByLabel("Published within").selectOption("30");
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

test("open homepage receives new published headlines automatically", async ({ page }) => {
  await page.clock.install();
  let checks = 0;
  await page.route("**/daily.json", async (route) => {
    const response = await route.fetch();
    const data = await response.json();
    checks++;
    data.news[0].title = `Published headline update ${checks}`;
    await route.fulfill({ json: data });
  });
  await page.goto("/");
  await expect(page.locator(".daily-preview").getByRole("link", { name: "Published headline update 1", exact: true })).toBeVisible();
  await page.clock.fastForward(5 * 60 * 1000);
  await expect(page.locator(".daily-preview").getByRole("link", { name: "Published headline update 2", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Security", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Fresh from the news desk" })).toBeVisible();
});

 test("homepage topic counts include incoming publisher headlines", async ({ page }) => {
  await page.route("**/daily.json", async route => {
    const response = await route.fetch();
    const data = await response.json();
    data.news = [{ ...data.news[0], id: "topic-test", title: "OpenAI introduces a model", url: "https://www.wired.com/story/topic-test/" }];
    await route.fulfill({ json: data });
  });
  await page.goto("/");
  const ai = page.getByRole("button", { name: "AI & ML", exact: true });
  await expect(ai).toContainText("2");
  await ai.click();
  await expect(page.getByRole("region", {name: "Latest publisher headlines"}).getByRole("link", {name: "OpenAI introduces a model"})).toBeVisible();
  await expect(page.locator(".feed-heading")).toContainText("2 items");
});

test("topic sections expand and provide orange keyboard focus without mobile overflow", async ({ page }) => {
  await page.goto("/");
  const group = page.getByRole("region", { name: "General tech headlines", exact: true });
  await expect(group.locator("article")).toHaveCount(3);
  await group.getByRole("button", { name: "More in General tech" }).click();
  await expect(group.locator("article")).toHaveCount(5);
  const link = group.locator("a").first();
  await page.keyboard.press("Tab");
  await link.focus();
  await expect(link).toHaveCSS("background-color", "rgb(255, 96, 41)");
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", await page.evaluate(() => innerWidth));
});
