import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
// These journeys exercise returning visitors; guide.spec.ts covers first visits.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("latest-cookie:guide-seen", "yes"),
  );
});
test("model filters, comparison, calculator and share links", async ({
  page,
}, info) => {
  await page.goto("/models/");
  await expect(page.getByRole("heading", { name: "MODEL LAB." })).toBeVisible();
  await page.screenshot({
    path: `docs/design/${info.project.name}-models.png`,
    fullPage: true,
  });
  await page
    .getByLabel("Pricing source", { exact: true })
    .selectOption("Direct");
  await page.getByLabel("Provider", { exact: true }).selectOption("OpenAI");
  await page.getByLabel("Accepts input", { exact: true }).selectOption("Audio");
  await expect(
    page.getByRole("heading", { name: "No models match these filters." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Show all models" }).click();
  await page.getByLabel("Find a model").fill("gpt-4.1");
  await expect(page.getByText(/2 of \d+ models/)).toBeVisible();
  await page
    .getByRole("button", { name: "Compare GPT-4.1", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Compare GPT-4.1 mini", exact: true })
    .click();
  await page.getByRole("button", { name: "Reset filters" }).click();
  await page
    .getByLabel("Pricing source", { exact: true })
    .selectOption("Direct");
  await page
    .getByRole("button", { name: "Compare Claude Opus 5.5", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Compare Claude Sonnet 5.5",
      exact: true,
    }),
  ).toBeDisabled();
  const comparison = page.getByRole("region", {
    name: /Selected model comparison/,
  });
  await expect(
    comparison.getByRole("row", { name: /Your estimated cost/ }),
  ).toContainText("$4.00");
  await page.getByLabel("Input tokens", { exact: true }).fill("2000000");
  await expect(
    comparison.getByRole("row", { name: /Your estimated cost/ }),
  ).toContainText("$6.00");
  await page.getByLabel("Chart metric", { exact: true }).selectOption("output");
  await page.getByRole("button", { name: "Share this view" }).click();
  const url = await page.getByLabel("Shareable link").inputValue();
  await page.goto(url);
  await expect(page.getByLabel("Chart metric", { exact: true })).toHaveValue(
    "output",
  );
  await expect(page.getByLabel("Input tokens", { exact: true })).toHaveValue(
    "2000000",
  );
  await expect(page.getByText("3/3 selected.", { exact: false })).toBeVisible();
  await page.screenshot({
    path: `docs/design/${info.project.name}-models-compare.png`,
    fullPage: true,
  });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByLabel("Input tokens", { exact: true }).fill("-1");
  await expect(
    page.getByText("Use whole numbers", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Share this view" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Use example workload" }).click();
  await page.getByRole("button", { name: "Clear selection" }).click();
  await expect(
    page.getByText("Choose models using the + buttons above.", {
      exact: false,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await expect(page.locator("body")).toHaveJSProperty(
    "scrollWidth",
    await page.evaluate(() => innerWidth),
  );
  await page.screenshot({
    path: `docs/design/${info.project.name}-models-dark.png`,
    fullPage: true,
  });
});
