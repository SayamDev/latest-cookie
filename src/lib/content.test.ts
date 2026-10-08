import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateStories, filterStories, readSaved } from "./content.ts";
const stories = validateStories(
  JSON.parse(
    readFileSync(new URL("../data/stories.json", import.meta.url), "utf8"),
  ),
);
test("search intersects topic and saved filters", () => {
  assert.equal(
    filterStories(stories, "COPILOT", "Security", ["copilot-sandbox"]).length,
    1,
  );
  assert.equal(filterStories(stories, "COPILOT", "Open Source").length, 0);
});
test("duplicate and invalid content fail closed", () => {
  assert.throws(() => validateStories([...stories, stories[0]]));
  assert.throws(() =>
    validateStories([{ ...stories[0], url: "javascript:alert(1)" }]),
  );
});
test("broken storage cannot break browsing", () => {
  assert.deepEqual(readSaved("{broken"), []);
  assert.deepEqual(readSaved('[1,"a",null]'), ["a"]);
});
test("unknown queries and empty bookmark lists return zero", () => {
  assert.equal(filterStories(stories, "does-not-exist", "All").length, 0);
  assert.equal(filterStories(stories, "", "All", []).length, 0);
});
test("empty refresh and duplicate slugs are rejected", () => {
  assert.throws(() => validateStories([]));
  assert.throws(() =>
    validateStories([stories[0], { ...stories[1], slug: stories[0].slug }]),
  );
});
