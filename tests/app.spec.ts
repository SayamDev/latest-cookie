import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
// These journeys exercise returning visitors; guide.spec.ts covers first visits.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("latest-cookie:guide-seen", "yes"),
  );
});
test("discovery, empty state, bookmarks, theme and direct story", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page
      .getByRole("heading", { name: "Your coding agent gets a boundary." })
      .first(),
  ).toBeVisible();
  await page.getByRole("button", { name: "Hardware", exact: true }).click();
  await expect(page.getByRole("region", { name: "Latest publisher headlines" })).toBeVisible();
  await page.getByRole("searchbox").fill("zzznomatchingstoryzzz");
  await expect(page.getByText("No stories here yet.")).toBeVisible();
  await page.getByRole("searchbox").fill("");
  await page.getByRole("button", { name: "All", exact: true }).click();
  await page.getByRole("searchbox").fill("Ollama");
  await expect(
    page.getByRole("heading", { name: "Local models, one less setup detour." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Save Local models, one less setup detour." })
    .click();
  await page.getByRole("link", { name: /Saved/ }).first().click();
  await expect(
    page.getByRole("heading", { name: "Local models, one less setup detour." }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Local models, one less setup detour." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.goto("/stories/copilot-local-sandboxing/");
  await expect(
    page.getByRole("heading", { name: "Your coding agent gets a boundary." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Read original/ }),
  ).toHaveAttribute("href", /github.blog/);
  await expect(page.locator("body")).toHaveJSProperty(
    "scrollWidth",
    await page.evaluate(() => innerWidth),
  );
});
test("homepage and dark theme accessibility", async ({ page }) => {
  await page.goto("/");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
test("publication routes, refresh failure, keyboard and visual evidence", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await page.screenshot({
    path: `docs/design/${testInfo.project.name}-home.png`,
    fullPage: true,
  });
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  if (testInfo.project.name === "desktop") {
    await page.route("**/stories.json", (r) => r.abort());
    await page.getByRole("button", { name: "Check for updates" }).click();
    await expect(page.getByRole("status")).toContainText(
      "current stories are still available",
    );
    await expect(
      page.getByRole("heading", { name: "Your coding agent gets a boundary." }),
    ).toBeVisible();
  }
  for (const path of ["briefings", "community", "about", "saved"]) {
    await page.goto("/" + path + "/");
    await expect(page.locator("main h1")).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await expect(page.locator("body")).toHaveJSProperty(
      "scrollWidth",
      await page.evaluate(() => innerWidth),
    );
    await page.screenshot({
      path: `docs/design/${testInfo.project.name}-${path}.png`,
      fullPage: true,
    });
  }
  await page.goto("/stories/copilot-local-sandboxing/");
  await page.screenshot({
    path: `docs/design/${testInfo.project.name}-story.png`,
    fullPage: true,
  });
});
