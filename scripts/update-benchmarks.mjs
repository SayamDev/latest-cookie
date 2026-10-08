import { readFile, writeFile } from "node:fs/promises";
import { benchmarkSnapshotSchema } from "../src/lib/benchmarks.ts";
const path = "src/data/benchmarks.json";
let previous = benchmarkSnapshotSchema.parse(
  JSON.parse(await readFile(path, "utf8")),
);
// Preserve the last successful published snapshot across scheduled checkouts.
if (process.env.GITHUB_ACTIONS) {
  try {
    const r = await fetch(
      "https://sayamdev.github.io/latest-cookie/benchmarks.json",
      { signal: AbortSignal.timeout(15000) },
    );
    if (r.ok) {
      const p = benchmarkSnapshotSchema.parse(await r.json());
      if (p.checked >= previous.checked) previous = p;
    }
  } catch {
    console.warn("Using repository benchmark snapshot.");
  }
}
const key = process.env.ARTIFICIAL_ANALYSIS_API_KEY;
if (!key) {
  await writeFile(path, JSON.stringify(previous, null, 2) + "\n");
  console.log(
    `Benchmarks remain a dated ${previous.checked} snapshot; no API key configured.`,
  );
} else {
  try {
    const models = [];
    let version;
    for (let page = 1; page <= 20; page++) {
      const r = await fetch(
        `https://artificialanalysis.ai/api/v2/language/models/free?page=${page}`,
        { headers: { "x-api-key": key }, signal: AbortSignal.timeout(25000) },
      );
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const body = await r.json();
      if (
        !Array.isArray(body.data) ||
        !body.data.length ||
        typeof body.pagination?.has_more !== "boolean" ||
        !Number.isFinite(body.intelligence_index_version)
      )
        throw new Error("Invalid benchmark envelope");
      if (version && version !== String(body.intelligence_index_version))
        throw new Error("Mixed benchmark versions");
      version = String(body.intelligence_index_version);
      for (const m of body.data) {
        const old = previous.models.find((p) => p.id === m.slug);
        const p = m.performance || {};
        const number = (v) =>
          typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : null;
        models.push({
          id: m.slug,
          name: m.name,
          provider: m.model_creator?.name,
          score: number(m.evaluations?.artificial_analysis_intelligence_index),
          speed: number(p.median_output_tokens_per_second),
          latency: number(p.median_time_to_first_token_seconds),
          response: number(p.median_end_to_end_response_time_seconds),
          cost: number(
            m.artificial_analysis_intelligence_index_cost?.cost_per_task
              ?.total_cost,
          ),
          inputPrice: number(m.pricing?.price_1m_input_tokens),
          outputPrice: number(m.pricing?.price_1m_output_tokens),
          context: old?.context ?? null,
          parameters: old?.parameters ?? null,
          weights: old?.weights ?? "Unknown",
          reasoning: old?.reasoning ?? null,
          released: m.release_date ?? null,
          source: `https://artificialanalysis.ai/models/${m.slug}`,
        });
      }
      if (!body.pagination.has_more) break;
      if (page === 20) throw new Error("Too many benchmark pages");
    }
    const snapshot = benchmarkSnapshotSchema.parse({
      checked: new Date().toISOString().slice(0, 10),
      version,
      mode: "api",
      models,
    });
    await writeFile(path, JSON.stringify(snapshot, null, 2) + "\n");
    console.log(`Updated ${models.length} benchmark entries.`);
  } catch (e) {
    await writeFile(path, JSON.stringify(previous, null, 2) + "\n");
    console.warn(
      `Benchmark refresh failed (${e.message}); keeping ${previous.checked}.`,
    );
  }
}
