import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  benchmarkSnapshotSchema,
  filterBenchmarks,
  initialBenchmarkFilters,
  benchmarkCsv,
} from "./benchmarks.ts";
const snapshot = benchmarkSnapshotSchema.parse(
  JSON.parse(
    readFileSync(new URL("../data/benchmarks.json", import.meta.url), "utf8"),
  ),
);
test("benchmarks rank capability rather than recency and keep missing metrics last both ways", () => {
  const ranked = filterBenchmarks(snapshot.models, initialBenchmarkFilters);
  assert.equal(ranked[0].id, "claude-opus-5-5");
  assert.ok(
    ranked.findIndex((m) => m.id === "gpt-6-astra") <
      ranked.findIndex((m) => m.id === "mercury-2-5"),
  );
  for (const descending of [true, false])
    assert.equal(
      filterBenchmarks(
        snapshot.models,
        initialBenchmarkFilters,
        "speed",
        descending,
      ).at(-1)?.id,
      "gemini-4-argon",
    );
});
test("benchmark filters compose without treating undisclosed size as small", () => {
  const rows = filterBenchmarks(snapshot.models, {
    ...initialBenchmarkFilters,
    weights: "Open",
    size: "Small",
    price: "0.25",
  });
  assert.deepEqual(
    rows.map((m) => m.id),
    ["gpt-oss-20b"],
  );
  assert.equal(
    filterBenchmarks(snapshot.models, {
      ...initialBenchmarkFilters,
      query: "ASTRA",
      provider: "Google",
    }).length,
    0,
  );
  assert.equal(
    filterBenchmarks(
      snapshot.models,
      { ...initialBenchmarkFilters, query: "astra", release: "90" },
      "score",
      true,
      Date.parse("2026-10-08"),
    ).length,
    1,
  );
});
test("benchmark schema rejects duplicate models, negative scores, and foreign provenance", () => {
  assert.throws(() =>
    benchmarkSnapshotSchema.parse({
      ...snapshot,
      models: [snapshot.models[0], snapshot.models[0]],
    }),
  );
  assert.throws(() =>
    benchmarkSnapshotSchema.parse({
      ...snapshot,
      models: [{ ...snapshot.models[0], score: -1 }],
    }),
  );
  assert.throws(() =>
    benchmarkSnapshotSchema.parse({
      ...snapshot,
      models: [{ ...snapshot.models[0], source: "https://example.com" }],
    }),
  );
  assert.ok(
    benchmarkCsv([{ ...snapshot.models[0], name: '=EVIL,"test"' }]).includes(
      '"\'=EVIL,""test"""',
    ),
  );
});
