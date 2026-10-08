import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
const snapshot = JSON.parse(
  readFileSync(new URL("../src/data/benchmarks.json", import.meta.url), "utf8"),
);
const updater = new URL("./update-benchmarks.mjs", import.meta.url).href;
function run(responses, key = "fixture") {
  const dir = mkdtempSync(join(tmpdir(), "cookie-bench-"));
  mkdirSync(join(dir, "src/data"), { recursive: true });
  writeFileSync(
    join(dir, "src/data/benchmarks.json"),
    JSON.stringify(snapshot),
  );
  try {
    const script = `let responses=${JSON.stringify(responses)};globalThis.fetch=async()=>{const b=responses.shift();if(!b)throw Error('unexpected request');return new Response(JSON.stringify(b),{status:b.error||200});};await import(${JSON.stringify(updater)});`;
    const child = spawnSync(
      process.execPath,
      ["--experimental-strip-types", "--input-type=module", "-e", script],
      {
        cwd: dir,
        env: {
          ...process.env,
          GITHUB_ACTIONS: "",
          ARTIFICIAL_ANALYSIS_API_KEY: key,
        },
        encoding: "utf8",
      },
    );
    assert.equal(child.status, 0, child.stderr);
    return JSON.parse(
      readFileSync(join(dir, "src/data/benchmarks.json"), "utf8"),
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
const model = (slug) => ({
  slug,
  name: slug,
  model_creator: { name: "Fixture" },
  evaluations: { artificial_analysis_intelligence_index: 53 },
  performance: {
    median_output_tokens_per_second: 45,
    median_time_to_first_token_seconds: 1,
    median_end_to_end_response_time_seconds: 12,
  },
  pricing: { price_1m_input_tokens: 2, price_1m_output_tokens: 10 },
  artificial_analysis_intelligence_index_cost: {
    cost_per_task: { total_cost: 0.5 },
  },
  release_date: "2026-09-01",
});
const page = (slug, more) => ({
  data: [model(slug)],
  intelligence_index_version: 4.3,
  pagination: { has_more: more },
});
test("benchmark updater paginates and keeps unsupported traits unknown", () => {
  const result = run([page("one", true), page("two", false)]);
  assert.equal(result.mode, "api");
  assert.equal(result.models.length, 2);
  assert.equal(result.models[0].score, 53);
  assert.equal(result.models[0].parameters, null);
  assert.equal(result.models[0].weights, "Unknown");
  assert.equal(result.models[0].response, 12);
});
test("benchmark updater preserves snapshot on missing key, partial failure or invalid data", () => {
  assert.deepEqual(run([], ""), snapshot);
  assert.deepEqual(run([page("one", true), { error: 429 }]), snapshot);
  assert.deepEqual(run([page("one", true), page("one", false)]), snapshot);
});
