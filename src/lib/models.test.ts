import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  estimateCost,
  findModels,
  parseSelection,
  validateModels,
} from "./models.ts";
const raw = JSON.parse(
  readFileSync(new URL("../data/models.json", import.meta.url), "utf8"),
);
const models = validateModels(raw);
test("cost separates input and output prices and rejects invalid volumes", () => {
  assert.equal(
    estimateCost({ inputPrice: 2, outputPrice: 8 }, 1_000_000, 250_000),
    4,
  );
  assert.equal(estimateCost({ inputPrice: 2, outputPrice: 8 }, 0, 0), 0);
  for (const n of [-1, NaN, Infinity])
    assert.throws(() => estimateCost(models[0], n, 0));
});
test("combined filters, sorting and empty results", () => {
  assert.equal(
    findModels(models, " FLASH ", "Google", "Audio", "input").length,
    2,
  );
  assert.equal(findModels(models, "", "OpenAI", "Audio", "input").length, 0);
  assert.equal(
    findModels(models, "", "All", "All", "input")[0].id,
    "gemini-3.5-flash-lite",
  );
  assert.equal(
    findModels(models, "", "All", "All", "output")[0].id,
    "gpt-4.1-mini",
  );
});
test("shared selections discard unknown and duplicate IDs and enforce the cap", () => {
  assert.deepEqual(
    parseSelection(
      "fake,gpt-4.1,gpt-4.1,gpt-4.1-mini,claude-opus-5.5,claude-sonnet-5.5",
      models,
    ),
    ["gpt-4.1", "gpt-4.1-mini", "claude-opus-5.5"],
  );
});
test("catalogue validation fails closed for malformed data", () => {
  assert.throws(() => validateModels([]));
  assert.throws(() => validateModels([raw[0], raw[0]]));
  assert.throws(() => validateModels([{ ...raw[0], inputPrice: -1 }]));
  assert.throws(() =>
    validateModels([{ ...raw[0], docs: "javascript:alert(1)" }]),
  );
});
