import { useState } from "react";
import { ArrowDown, ArrowUp, Download, Plus, Check } from "lucide-react";
import raw from "../../data/benchmarks.json";
import {
  benchmarkSnapshotSchema,
  filterBenchmarks,
  initialBenchmarkFilters,
  benchmarkCsv,
  type Benchmark,
  type BenchmarkMetric,
} from "../../lib/benchmarks";
const snapshot = benchmarkSnapshotSchema.parse(raw);
const labels: Record<BenchmarkMetric, string> = {
  score: "Intelligence",
  cost: "Cost / task ($)",
  speed: "Speed (tokens/s)",
  latency: "First token (s)",
  response: "500-token response (s)",
  context: "Context tokens",
  parameters: "Size (B parameters)",
};
const fmt = (v: number | null) =>
  v === null
    ? "Not reported"
    : new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(v);
const short = (m: Benchmark) =>
  m.name.replace(" (Max, Default Fallback)", " (max)");
export default function BenchmarkExplorer() {
  const [now] = useState(() => Date.now());
  const [filters, setFilters] = useState(initialBenchmarkFilters);
  const [sort, setSort] = useState<BenchmarkMetric>("score");
  const [descending, setDescending] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [focus, setFocus] = useState<string | null>(null);
  const [axis, setAxis] = useState<
    "cost" | "speed" | "latency" | "parameters" | "released"
  >("cost");
  const [limit, setLimit] = useState(20);
  const rows = filterBenchmarks(
    snapshot.models,
    filters,
    sort,
    descending,
    now,
  );
  const comparing = snapshot.models.filter((m) => selected.includes(m.id));
  const plotRows = rows.filter((m) => m.score !== null && m[axis] !== null);
  const xValue = (m: Benchmark) =>
    axis === "released" ? Date.parse(m.released!) : m[axis]!;
  const minX = axis === "released" ? Math.min(...plotRows.map(xValue), now) : 0;
  const maxX = Math.max(...plotRows.map(xValue), minX + 1);
  const maxY = Math.max(...plotRows.map((m) => m.score!), 1);
  const x = (m: Benchmark) => 58 + ((xValue(m) - minX) / (maxX - minX)) * 520;
  const y = (m: Benchmark) => 250 - (m.score! / maxY) * 210;
  const featured = rows.find((m) => m.id === focus);
  const leaders = [...rows]
    .filter((m) => m.score !== null)
    .sort((a, b) => b.score! - a.score!)
    .slice(0, 8);
  const setFilter = (key: keyof typeof filters, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setLimit(20);
    setFocus(null);
  };
  function order(key: BenchmarkMetric) {
    if (key === sort) setDescending(!descending);
    else {
      setSort(key);
      setDescending(["score", "speed", "context", "parameters"].includes(key));
    }
  }
  function toggle(id: string) {
    setSelected((s) =>
      s.includes(id)
        ? s.filter((v) => v !== id)
        : s.length < 3
          ? [...s, id]
          : s,
    );
  }
  function download() {
    const blob = new Blob([benchmarkCsv(rows)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `latest-cookie-benchmarks-${snapshot.checked}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section className="benchmark-explorer" aria-labelledby="bench-title">
      <div className="lab-section-head">
        <div>
          <h2 id="bench-title">Capability, before the hype.</h2>
          <p className="lab-caption">
            Highest intelligence scores first. Reasoning settings are part of
            each result.
          </p>
        </div>
        <a href="#catalogue">Go to API pricing catalogue ↓</a>
      </div>
      <p className="benchmark-provenance">
        Source:{" "}
        <a href="https://artificialanalysis.ai/models">Artificial Analysis</a> ·
        Intelligence Index v{snapshot.version} ·{" "}
        {snapshot.mode === "snapshot"
          ? "Selected-model snapshot"
          : "API snapshot"}{" "}
        checked <time dateTime={snapshot.checked}>{snapshot.checked}</time>.{" "}
        {snapshot.mode === "snapshot"
          ? "These benchmark figures are dated, not a live leaderboard. The API pricing catalogue below updates hourly."
          : "Benchmark updates are attempted daily. The date shows the last successful refresh."}
      </p>
      {now - Date.parse(snapshot.checked) > 7 * 86400000 && (
        <p className="benchmark-provenance">
          Benchmark data is more than a week old. Check the linked sources
          before choosing a model.
        </p>
      )}
      <div className="lab-controls benchmark-filters">
        <label>
          Search benchmarks
          <input
            type="search"
            value={filters.query}
            onChange={(e) => setFilter("query", e.target.value)}
            placeholder="Astra, Claude, Gemini…"
          />
        </label>
        <label>
          Creator
          <select
            aria-label="Creator"
            value={filters.provider}
            onChange={(e) => setFilter("provider", e.target.value)}
          >
            <option>All</option>
            {[...new Set(snapshot.models.map((m) => m.provider))]
              .sort()
              .map((p) => (
                <option key={p}>{p}</option>
              ))}
          </select>
        </label>
        <label>
          Weights
          <select
            aria-label="Weights"
            value={filters.weights}
            onChange={(e) => setFilter("weights", e.target.value)}
          >
            {["All", "Open", "Proprietary", "Unknown"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label>
          Model size
          <select
            aria-label="Model size"
            value={filters.size}
            onChange={(e) => setFilter("size", e.target.value)}
          >
            <option>All</option>
            <option value="Small">Up to 40B</option>
            <option value="Medium">40–150B</option>
            <option value="Large">Over 150B</option>
            <option>Unknown</option>
          </select>
        </label>
        <label>
          Reasoning
          <select
            aria-label="Reasoning"
            value={filters.reasoning}
            onChange={(e) => setFilter("reasoning", e.target.value)}
          >
            {["All", "Yes", "No", "Unknown"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label>
          Benchmark task budget
          <select
            aria-label="Benchmark task budget"
            value={filters.price}
            onChange={(e) => setFilter("price", e.target.value)}
          >
            <option>All</option>
            <option value="0.25">Up to $0.25</option>
            <option value="1">Up to $1</option>
            <option value="5">Up to $5</option>
          </select>
        </label>
        <label>
          Released within
          <select
            aria-label="Released within"
            value={filters.release}
            onChange={(e) => setFilter("release", e.target.value)}
          >
            <option>All</option>
            <option value="90">90 days</option>
            <option value="365">One year</option>
          </select>
        </label>
        <button
          className="button"
          onClick={() => {
            setFilters(initialBenchmarkFilters);
            setSort("score");
            setDescending(true);
            setLimit(20);
            setFocus(null);
          }}
        >
          Reset benchmark filters
        </button>
      </div>
      <div className="benchmark-summary">
        <p aria-live="polite">
          {rows.length} of {snapshot.models.length} benchmark entries · Sorted
          by {labels[sort].toLowerCase()}, {descending ? "highest" : "lowest"}{" "}
          first
        </p>
        <button className="button" onClick={download} disabled={!rows.length}>
          <Download size={16} /> Export filtered CSV
        </button>
      </div>
      <div
        className="lab-table-scroll"
        role="region"
        tabIndex={0}
        aria-label="Benchmark leaderboard, scroll horizontally for all measurements"
      >
        <table className="lab-table benchmark-table">
          <thead>
            <tr>
              <th scope="col">Shortlist</th>
              <th scope="col">Model / creator</th>
              {(
                [
                  "score",
                  "cost",
                  "speed",
                  "latency",
                  "response",
                  "context",
                  "parameters",
                ] as BenchmarkMetric[]
              ).map((k) => (
                <th
                  key={k}
                  scope="col"
                  aria-sort={
                    sort === k
                      ? descending
                        ? "descending"
                        : "ascending"
                      : "none"
                  }
                >
                  <button onClick={() => order(k)}>
                    {labels[k]}
                    {sort === k ? (
                      descending ? (
                        <ArrowDown size={14} />
                      ) : (
                        <ArrowUp size={14} />
                      )
                    ) : (
                      <span aria-hidden="true">↕</span>
                    )}
                  </button>
                </th>
              ))}
              <th scope="col">Features & source</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, limit).map((m) => (
              <tr key={m.id} data-selected={selected.includes(m.id)}>
                <td>
                  <button
                    className="lab-select"
                    aria-label={`${selected.includes(m.id) ? "Remove from" : "Add to"} benchmark shortlist: ${m.name}`}
                    aria-pressed={selected.includes(m.id)}
                    disabled={selected.length === 3 && !selected.includes(m.id)}
                    onClick={() => toggle(m.id)}
                  >
                    {selected.includes(m.id) ? (
                      <Check size={18} />
                    ) : (
                      <Plus size={18} />
                    )}
                  </button>
                </td>
                <th scope="row">
                  <strong>{m.name}</strong>
                  <span>{m.provider}</span>
                  {m.released && <small>Released {m.released}</small>}
                </th>
                {(
                  [
                    "score",
                    "cost",
                    "speed",
                    "latency",
                    "response",
                    "context",
                    "parameters",
                  ] as BenchmarkMetric[]
                ).map((k) => (
                  <td key={k}>{fmt(m[k])}</td>
                ))}
                <td>
                  <span>
                    {m.weights} weights ·{" "}
                    {m.reasoning === null
                      ? "Reasoning unknown"
                      : m.reasoning
                        ? "Reasoning"
                        : "Non-reasoning"}
                  </span>
                  <a href={m.source}>Full analysis ↗</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && (
        <p className="lab-empty">
          No benchmark entries match. Reset the filters to see the snapshot
          again.
        </p>
      )}
      {rows.length > limit && (
        <button className="button" onClick={() => setLimit((n) => n + 20)}>
          Show 20 more benchmark entries
        </button>
      )}
      <details className="benchmark-method">
        <summary>What these numbers mean</summary>
        <p>
          Intelligence is a benchmark score, not a popularity count or a
          guarantee for your task. This selection includes leading models and
          lower-cost or faster alternatives; it is not the entire market.
          Compare the named reasoning settings, not just model families.
        </p>
        <p>
          Cost per task is Artificial Analysis’s weighted benchmark workload,
          not a token price or your app’s cost. Speed is output tokens per
          second. First token is the source-reported latency and can include a
          substantial wait at high reasoning settings. A 500-token response is
          the source’s end-to-end measurement; unreported values stay blank
          rather than being estimated.
        </p>
        <p>
          Measurements reflect the source’s provider configuration and may
          change. Sizes are total parameters in billions; proprietary sizes are
          often undisclosed. Open weights does not imply unrestricted licensing.
          In API mode, context, size, weights and reasoning metadata are
          retained from the manually checked 2026-10-08 snapshot where
          available; the free API does not supply them.
        </p>
        <a href="https://artificialanalysis.ai/methodology">
          Read the measurement methodology ↗
        </a>
      </details>
      <div className="benchmark-charts">
        <section>
          <h3>Leading this selection.</h3>
          <p className="lab-caption">
            Intelligence Index · higher is better · up to eight filtered entries
          </p>
          <ol className="benchmark-bars">
            {leaders.map((m) => (
              <li key={m.id}>
                <span>{short(m)}</span>
                <div aria-hidden="true">
                  <i
                    style={{
                      width: `${(m.score! / Math.max(...leaders.map((l) => l.score!), 1)) * 100}%`,
                    }}
                  />
                </div>
                <strong>{fmt(m.score)}</strong>
              </li>
            ))}
          </ol>
        </section>
        <section>
          <div className="lab-section-head">
            <h3>See the trade-off.</h3>
            <label>
              Compare intelligence against
              <select
                aria-label="Compare intelligence against"
                value={axis}
                onChange={(e) => {
                  setAxis(e.target.value as typeof axis);
                  setFocus(null);
                }}
              >
                <option value="cost">Cost per task</option>
                <option value="speed">Output speed</option>
                <option value="latency">First-token latency</option>
                <option value="parameters">Model size</option>
                <option value="released">Release date</option>
              </select>
            </label>
          </div>
          {plotRows.length ? (
            <svg
              className="benchmark-scatter"
              viewBox="0 0 620 305"
              role="img"
              aria-label={`Intelligence versus ${axis}. Each numbered point corresponds to a model in the list below.`}
            >
              <line x1="58" y1="250" x2="580" y2="250" />
              <line x1="58" y1="35" x2="58" y2="250" />
              <text x="12" y="24">
                Intelligence ↑
              </text>
              {[0, 0.5, 1].map((f) => (
                <g key={f}>
                  <line
                    className="plot-grid"
                    x1="58"
                    x2="580"
                    y1={250 - f * 210}
                    y2={250 - f * 210}
                  />
                  <text x="13" y={254 - f * 210}>
                    {Math.round(f * maxY)}
                  </text>
                  <text
                    textAnchor={f === 0 ? "start" : f === 1 ? "end" : "middle"}
                    x={58 + 520 * f}
                    y="273"
                  >
                    {axis === "released"
                      ? new Date(minX + (maxX - minX) * f)
                          .toISOString()
                          .slice(0, 10)
                      : fmt(minX + (maxX - minX) * f)}
                  </text>
                </g>
              ))}
              {plotRows.map((m, i) => (
                <g key={m.id}>
                  <circle cx={x(m)} cy={y(m)} r={focus === m.id ? 8 : 5}>
                    <title>
                      {m.name}: {m.score} intelligence,{" "}
                      {axis === "released" ? m.released : fmt(m[axis])} {axis}
                    </title>
                  </circle>
                  <text x={x(m) + 7} y={y(m) - 7}>
                    {i + 1}
                  </text>
                </g>
              ))}
              <text x="320" y="300" textAnchor="middle">
                {axis === "released"
                  ? "Release date (not historical performance)"
                  : labels[axis]}
              </text>
            </svg>
          ) : (
            <p className="lab-empty">
              No reported measurements for this chart.
            </p>
          )}
          <div className="plot-legend">
            {plotRows.map((m, i) => (
              <button
                key={m.id}
                aria-pressed={focus === m.id}
                onClick={() => setFocus(m.id)}
              >
                {i + 1}. {short(m)}
              </button>
            ))}
          </div>
          {featured && (
            <p className="plot-detail" role="status">
              {featured.name}: intelligence {fmt(featured.score)} ·{" "}
              {axis === "released"
                ? featured.released
                : `${labels[axis]}: ${fmt(featured[axis])}`}
              .
            </p>
          )}
        </section>
      </div>
      <section className="benchmark-shortlist">
        <div className="lab-section-head">
          <h3>Your benchmark shortlist</h3>
          <button
            className="button"
            disabled={!selected.length}
            onClick={() => setSelected([])}
          >
            Clear benchmark shortlist
          </button>
        </div>
        <p className="lab-caption">
          {selected.length}/3 selected. Kept while you filter; this shortlist is
          separate from API-route pricing comparisons below.
        </p>
        {comparing.length ? (
          <div
            className="lab-table-scroll"
            role="region"
            tabIndex={0}
            aria-label="Benchmark shortlist comparison"
          >
            <table className="lab-table">
              <thead>
                <tr>
                  <th scope="col">Measurement</th>
                  {comparing.map((m) => (
                    <th key={m.id} scope="col">
                      {m.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(Object.keys(labels) as BenchmarkMetric[]).map((k) => (
                  <tr key={k}>
                    <th scope="row">{labels[k]}</th>
                    {comparing.map((m) => (
                      <td key={m.id}>{fmt(m[k])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>
            Use the + buttons to compare up to three measured model variants.
          </p>
        )}
      </section>
    </section>
  );
}
