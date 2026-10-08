import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
// These journeys exercise returning visitors; guide.spec.ts covers first visits.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("latest-cookie:guide-seen", "yes"),
  );
});
test("benchmark ranking, filters, shortlist, chart and export", async ({
  page,
}, info) => {
  await page.goto("/models/");
  const board = page.getByRole("region", {
    name: "Benchmark leaderboard, scroll horizontally for all measurements",
  });
  await expect(board.locator("tbody tr").first()).toContainText(
    "Claude Opus 5.5",
  );
  await expect(
    page.getByText("Selected-model snapshot", { exact: false }),
  ).toBeVisible();
  await page.getByLabel("Weights", { exact: true }).selectOption("Open");
  await expect(board.locator("tbody tr")).toHaveCount(3);
  await page.getByLabel("Model size", { exact: true }).selectOption("Small");
  await expect(board.locator("tbody tr")).toHaveCount(1);
  await expect(board).toContainText("gpt-oss-20b");
  await page.getByRole("button", { name: "Reset benchmark filters" }).click();
  await page.getByLabel("Search benchmarks", { exact: true }).fill("Astra");
  await expect(board.locator("tbody tr")).toHaveCount(1);
  await board
    .getByRole("button", { name: /Add to benchmark shortlist/ })
    .click();
  await page.getByRole("button", { name: "Reset benchmark filters" }).click();
  await expect(
    page.getByRole("region", { name: "Benchmark shortlist comparison" }),
  ).toContainText("GPT-6 Astra");
  await board.getByRole("button", { name: "Speed (tokens/s)" }).click();
  await expect(board.locator("tbody tr").first()).toContainText("Mercury");
  await page
    .getByLabel("Compare intelligence against")
    .selectOption("released");
  await expect(
    page.getByText("Release date (not historical performance)"),
  ).toBeVisible();
  await page.locator(".plot-legend button").first().click();
  await expect(page.locator(".plot-detail")).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export filtered CSV" }).click();
  expect((await download).suggestedFilename()).toMatch(
    /latest-cookie-benchmarks/,
  );
  await page.getByLabel("Reasoning", { exact: true }).selectOption("No");
  await expect(
    page.getByText("No benchmark entries match.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset benchmark filters" }).click();
  await page.screenshot({
    path: `docs/design/${info.project.name}-benchmarks.png`,
    fullPage: true,
  });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await expect(page.locator("body")).toHaveJSProperty(
    "scrollWidth",
    await page.evaluate(() => innerWidth),
  );
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
