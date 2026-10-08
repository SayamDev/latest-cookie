import { z } from "zod";
const metric = z.number().finite().nonnegative().nullable();
export const benchmarkSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9._-]+$/),
  name: z.string().min(1),
  provider: z.string().min(1),
  score: metric,
  speed: metric,
  latency: metric,
  response: metric,
  cost: metric,
  inputPrice: metric,
  outputPrice: metric,
  context: metric,
  parameters: metric,
  weights: z.enum(["Open", "Proprietary", "Unknown"]),
  reasoning: z.boolean().nullable(),
  released: z.iso.date().nullable(),
  source: z.url().startsWith("https://artificialanalysis.ai/models/"),
});
export const benchmarkSnapshotSchema = z
  .object({
    checked: z.iso.date(),
    version: z.string().min(1),
    mode: z.enum(["snapshot", "api"]),
    models: z.array(benchmarkSchema).min(1),
  })
  .refine(
    (s) => new Set(s.models.map((m) => m.id)).size === s.models.length,
    "Duplicate benchmark model",
  );
export type Benchmark = z.infer<typeof benchmarkSchema>;
export type BenchmarkMetric =
  | "score"
  | "speed"
  | "latency"
  | "response"
  | "cost"
  | "context"
  | "parameters";
export type BenchmarkFilters = {
  query: string;
  weights: string;
  provider: string;
  size: string;
  reasoning: string;
  price: string;
  release: string;
};
export const initialBenchmarkFilters: BenchmarkFilters = {
  query: "",
  weights: "All",
  provider: "All",
  size: "All",
  reasoning: "All",
  price: "All",
  release: "All",
};
export function filterBenchmarks(
  models: Benchmark[],
  f: BenchmarkFilters,
  sort: BenchmarkMetric = "score",
  descending = true,
  now = Date.now(),
) {
  return models
    .filter(
      (m) =>
        `${m.name} ${m.provider}`
          .toLowerCase()
          .includes(f.query.trim().toLowerCase()) &&
        (f.weights === "All" || f.weights === m.weights) &&
        (f.provider === "All" || f.provider === m.provider) &&
        (f.reasoning === "All" ||
          (f.reasoning === "Yes"
            ? m.reasoning === true
            : f.reasoning === "No"
              ? m.reasoning === false
              : m.reasoning === null)) &&
        (f.size === "All" ||
          (f.size === "Unknown"
            ? m.parameters === null
            : m.parameters !== null &&
              (f.size === "Small"
                ? m.parameters <= 40
                : f.size === "Medium"
                  ? m.parameters > 40 && m.parameters <= 150
                  : m.parameters > 150))) &&
        (f.price === "All" || (m.cost !== null && m.cost <= Number(f.price))) &&
        (f.release === "All" ||
          (m.released !== null &&
            now - Date.parse(m.released) >= 0 &&
            now - Date.parse(m.released) <= Number(f.release) * 86400000)),
    )
    .sort((a, b) =>
      a[sort] === null
        ? b[sort] === null
          ? a.name.localeCompare(b.name)
          : 1
        : b[sort] === null
          ? -1
          : (a[sort]! - b[sort]!) * (descending ? -1 : 1) ||
            a.name.localeCompare(b.name),
    );
}
export function benchmarkCsv(rows: Benchmark[]) {
  const keys = [
    "name",
    "provider",
    "score",
    "cost",
    "speed",
    "latency",
    "response",
    "context",
    "parameters",
    "weights",
    "reasoning",
    "released",
    "source",
  ] as const;
  const cell = (v: unknown) => {
    let s = v === null ? "" : String(v);
    if (/^[=+@-]/.test(s)) s = "'" + s;
    return '"' + s.replaceAll('"', '""') + '"';
  };
  return [
    keys.join(","),
    ...rows.map((r) => keys.map((k) => cell(r[k])).join(",")),
  ].join("\r\n");
}
