import { useState } from "react";
import { ArrowUpRight, Check, Link, Plus, X } from "lucide-react";
import raw from "../../data/models.json";
import {
  estimateCost,
  findModels,
  parseSelection,
  validateModels,
  type Sort,
  type Model,
} from "../../lib/models";
import "./models.css";
const models = validateModels(raw);
const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(n);
const number = (n: number) => n.toLocaleString("en-US");
const params = new URLSearchParams(location.search);
const option = (key: string, values: string[], fallback: string) =>
  values.includes(params.get(key) || "") ? params.get(key)! : fallback;
const volume = (key: string, fallback: string) => {
  const value = params.get(key);
  return value !== null && /^\d{1,12}$/.test(value) && Number(value) <= 1e11
    ? value
    : fallback;
};
export default function ModelsPage() {
  const [query, setQuery] = useState(
    params.get("modelQuery")?.slice(0, 100) || "",
  );
  const [provider, setProvider] = useState(
    option("provider", ["OpenAI", "Anthropic", "Google"], "All"),
  );
  const [input, setInput] = useState(
    option("input", ["Text", "Image", "Audio", "Video"], "All"),
  );
  const [sort, setSort] = useState(
    option("sort", ["input", "output", "context", "name"], "input") as Sort,
  );
  const [selected, setSelected] = useState(() =>
    parseSelection(params.get("compare"), models),
  );
  const [inputTokens, setInputTokens] = useState(volume("in", "1000000"));
  const [outputTokens, setOutputTokens] = useState(volume("out", "250000"));
  const [metric, setMetric] = useState<"cost" | "input" | "output">(
    option("metric", ["cost", "input", "output"], "cost") as
      "cost" | "input" | "output",
  );
  const [feedback, setFeedback] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const visible = findModels(models, query, provider, input, sort);
  const comparing = selected.flatMap(
    (id) => models.find((m) => m.id === id) || [],
  );
  const valid = [inputTokens, outputTokens].every(
    (v) => /^\d+$/.test(v) && Number(v) <= 1e11,
  );
  const chartValue = (m: Model) =>
    metric === "cost"
      ? estimateCost(m, Number(inputTokens), Number(outputTokens))
      : metric === "input"
        ? m.inputPrice
        : m.outputPrice;
  const chart =
    valid || metric !== "cost"
      ? [...visible].sort((a, b) => chartValue(a) - chartValue(b))
      : [];
  const maximum = Math.max(...chart.map(chartValue), 0);
  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((x) => x !== id)
        : current.length < 3
          ? [...current, id]
          : current,
    );
    setShareUrl("");
  }
  function viewUrl() {
    const url = new URL(location.href);
    url.search = "";
    url.hash = "";
    for (const [key, value] of Object.entries({
      modelQuery: query,
      provider,
      input,
      sort,
      metric,
      compare: selected.join(","),
      in: inputTokens,
      out: outputTokens,
    })) {
      if (value) url.searchParams.set(key, value);
    }
    return url.toString();
  }
  async function share() {
    const url = viewUrl();
    history.replaceState(null, "", url);
    setShareUrl(url.toString());
    try {
      await navigator.clipboard.writeText(url.toString());
      setFeedback("Comparison link copied.");
    } catch {
      setFeedback("Select and copy the link below.");
    }
  }
  return (
    <section className="model-lab" aria-labelledby="model-title">
      <header className="lab-intro">
        <div>
          <h1 id="model-title">
            MODEL LAB<span>.</span>
          </h1>
          <p>Know the trade-offs. Then build.</p>
        </div>
        <div className="lab-edition">
          <strong>6 models / 3 providers</strong>
          <span>Source check: 8 Oct 2026</span>
          <a href="#model-method">How to read this data</a>
        </div>
      </header>
      <p className="lab-scope">
        A starter catalogue of API prices and token limits. Search, shortlist
        and price your workload. Manually checked snapshot; not a complete
        market ranking.
      </p>
      <div className="lab-controls">
        <label className="lab-search">
          Find a model
          <input
            type="search"
            value={query}
            maxLength={100}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name or provider…"
          />
        </label>
        <label>
          Provider
          <select
            aria-label="Provider"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
          >
            <option>All</option>
            {["OpenAI", "Anthropic", "Google"].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label>
          Accepts input
          <select
            aria-label="Accepts input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          >
            <option>All</option>
            {["Text", "Image", "Audio", "Video"].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label>
          Sort catalogue
          <select
            aria-label="Sort catalogue"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
          >
            <option value="input">Input price: low first</option>
            <option value="output">Output price: low first</option>
            <option value="context">Token limit: high first</option>
            <option value="name">Name: A–Z</option>
          </select>
        </label>
        <button
          className="button"
          onClick={() => {
            setQuery("");
            setProvider("All");
            setInput("All");
            setSort("input");
          }}
        >
          Reset filters
        </button>
      </div>
      <div className="lab-workbench">
        <section className="lab-chart" aria-labelledby="chart-title">
          <div className="lab-section-head">
            <h2 id="chart-title">Price, in perspective.</h2>
            <label>
              Chart metric
              <select
                aria-label="Chart metric"
                value={metric}
                onChange={(e) => setMetric(e.target.value as typeof metric)}
              >
                <option value="cost">Your workload</option>
                <option value="input">Input / 1M tokens</option>
                <option value="output">Output / 1M tokens</option>
              </select>
            </label>
          </div>
          <p className="lab-caption">
            {metric === "cost"
              ? "Estimated text-token cost · USD · lowest first"
              : "Standard text-token price · USD per million · lowest first"}
          </p>
          {chart.length ? (
            <ol className="lab-bars">
              {chart.map((m) => (
                <li key={m.id}>
                  <span>{m.name}</span>
                  <div className="lab-track" aria-hidden="true">
                    <div
                      style={{
                        width: `${maximum ? (chartValue(m) / maximum) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <strong>{money(chartValue(m))}</strong>
                </li>
              ))}
            </ol>
          ) : (
            <p className="lab-no-chart">
              {!valid && metric === "cost"
                ? "Enter valid token volumes to see your estimate."
                : "No matching models. Try another filter."}
            </p>
          )}
          <p className="lab-caption">
            Price does not measure quality. Test models on your own tasks.
          </p>
        </section>
        <section className="lab-calculator" aria-labelledby="calc-title">
          <h2 id="calc-title">What would it cost?</h2>
          <p>
            Enter total text tokens across your requests, for any period you
            choose.
          </p>
          <label>
            Input tokens
            <input
              type="number"
              min="0"
              max="100000000000"
              step="1"
              value={inputTokens}
              onChange={(e) => setInputTokens(e.target.value)}
              aria-invalid={!valid}
              aria-describedby="volume-note"
            />
          </label>
          <label>
            Output tokens
            <input
              type="number"
              min="0"
              max="100000000000"
              step="1"
              value={outputTokens}
              onChange={(e) => setOutputTokens(e.target.value)}
              aria-invalid={!valid}
              aria-describedby="volume-note"
            />
          </label>
          <p id="volume-note" className="lab-caption">
            {valid
              ? "Include billed reasoning / thinking tokens in your output total. Text only, uncached, standard paid tier."
              : "Use whole numbers from 0 to 100,000,000,000 in both fields."}
          </p>
          <button
            className="button"
            onClick={() => {
              setInputTokens("1000000");
              setOutputTokens("250000");
              setMetric("cost");
            }}
          >
            Use example workload
          </button>
          <p className="lab-caption">
            Excludes tools, cache storage, batch discounts, free tiers, taxes
            and regional premiums. An estimate, not a quote.
          </p>
        </section>
      </div>
      <div className="lab-section-head lab-catalogue-head">
        <div>
          <h2>The catalogue</h2>
          <p className="lab-caption" aria-live="polite">
            {visible.length} of {models.length} models · Prices in USD per 1M
            text tokens
          </p>
        </div>
        <span>Select up to 3 to compare · Scroll tables for more</span>
      </div>
      {visible.length ? (
        <div
          className="lab-table-scroll"
          role="region"
          aria-label="Model catalogue, scroll horizontally for all columns"
          tabIndex={0}
        >
          <table className="lab-table">
            <thead>
              <tr>
                <th scope="col">Compare</th>
                <th scope="col">Model</th>
                <th scope="col">Input / 1M</th>
                <th scope="col">Output / 1M</th>
                <th scope="col">Token limit</th>
                <th scope="col">Inputs</th>
                <th scope="col">Source</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((m) => (
                <tr key={m.id} data-selected={selected.includes(m.id)}>
                  <td>
                    <button
                      className="lab-select"
                      aria-label={`${selected.includes(m.id) ? "Remove" : "Compare"} ${m.name}`}
                      aria-pressed={selected.includes(m.id)}
                      disabled={
                        selected.length === 3 && !selected.includes(m.id)
                      }
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
                  </th>
                  <td>{money(m.inputPrice)}</td>
                  <td>{money(m.outputPrice)}</td>
                  <td>
                    {number(m.context)}
                    <small>{m.contextKind}</small>
                  </td>
                  <td>{m.inputs.join(" · ")}</td>
                  <td>
                    <a href={m.docs}>
                      Specs <ArrowUpRight size={13} />
                    </a>
                    <a href={m.pricing}>
                      Pricing <ArrowUpRight size={13} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="lab-empty">
          <h3>No models match these filters.</h3>
          <p>Try a different name, provider or input type.</p>
          <button
            className="button"
            onClick={() => {
              setQuery("");
              setProvider("All");
              setInput("All");
            }}
          >
            Show all models
          </button>
        </div>
      )}
      <section className="lab-compare" aria-labelledby="compare-title">
        <div className="lab-section-head">
          <div>
            <h2 id="compare-title">Your comparison</h2>
            <p className="lab-caption">
              {selected.length}/3 selected. Selections stay here when you filter
              the catalogue.
            </p>
          </div>
          <div className="lab-actions">
            <button
              className="button"
              disabled={!selected.length}
              onClick={() => {
                setSelected([]);
                setShareUrl("");
              }}
            >
              Clear selection
            </button>
            <button
              className="button primary"
              disabled={!valid}
              onClick={share}
            >
              <Link size={16} /> Share this view
            </button>
          </div>
        </div>
        {shareUrl && shareUrl === viewUrl() && (
          <label className="lab-share">
            Shareable link
            <input
              readOnly
              value={shareUrl}
              onFocus={(e) => e.currentTarget.select()}
            />
          </label>
        )}
        <p className="lab-feedback" role="status">
          {feedback}
        </p>
        {comparing.length ? (
          <div
            className="lab-table-scroll"
            role="region"
            aria-label="Selected model comparison, scroll horizontally for all columns"
            tabIndex={0}
          >
            <table className="lab-table lab-compare-table">
              <thead>
                <tr>
                  <th scope="col">Specification</th>
                  {comparing.map((m) => (
                    <th scope="col" key={m.id}>
                      <div>
                        {m.name}
                        <button
                          className="lab-remove"
                          aria-label={`Remove ${m.name} from comparison`}
                          onClick={() => toggle(m.id)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Provider", (m: Model) => m.provider],
                  ["Input / 1M tokens", (m: Model) => money(m.inputPrice)],
                  ["Output / 1M tokens", (m: Model) => money(m.outputPrice)],
                  [
                    "Your estimated cost",
                    (m: Model) =>
                      valid
                        ? money(
                            estimateCost(
                              m,
                              Number(inputTokens),
                              Number(outputTokens),
                            ),
                          )
                        : "Enter valid token volumes",
                  ],
                  [
                    "Token limit",
                    (m: Model) => `${number(m.context)} · ${m.contextKind}`,
                  ],
                  ["Max output tokens", (m: Model) => number(m.maxOutput)],
                  ["Accepts", (m: Model) => m.inputs.join(", ")],
                  ["Notes", (m: Model) => m.note],
                  ["Last checked", (m: Model) => m.checked],
                ].map(([label, render]) => (
                  <tr key={label as string}>
                    <th scope="row">{label as string}</th>
                    {comparing.map((m) => (
                      <td key={m.id}>{(render as (m: Model) => string)(m)}</td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <th scope="row">Provider documentation</th>
                  {comparing.map((m) => (
                    <td key={m.id}>
                      <a href={m.docs}>
                        Model specs <ArrowUpRight size={13} />
                      </a>
                      <a href={m.pricing}>
                        Pricing <ArrowUpRight size={13} />
                      </a>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p className="lab-empty-compare">
            Choose models using the + buttons above. Their prices, limits and
            source notes will appear side by side.
          </p>
        )}
      </section>
      <section className="lab-method" id="model-method">
        <h2>Read the small print.</h2>
        <div>
          <p>
            These are provider-published specifications, manually checked on 8
            October 2026. This starter set includes earlier-generation GPT-4.1
            models for existing applications. It is not exhaustive or
            automatically refreshed; confirm current rates and availability at
            the source.
          </p>
          <p>
            “Shared context” covers input and output together. “Input limit” is
            the provider’s separate input allowance. Maximum output is another
            ceiling, not a promise that every input/output combination fits.
            Providers count tokens differently; Claude’s 1M / 128K labels are
            displayed as decimal token counts.
          </p>
          <p>
            Cost = (input tokens × input rate + output tokens × output rate) ÷
            1,000,000. The same token workload is only an approximation across
            tokenizers. All entries here are hosted proprietary APIs with text
            output.
          </p>
          <p>
            We have not independently measured intelligence, speed or latency.
            For independent evaluations, visit{" "}
            <a href="https://artificialanalysis.ai/models">
              Artificial Analysis <ArrowUpRight size={13} />
            </a>
            . Their benchmark data is not reproduced here; Latest Cookie is
            unaffiliated.
          </p>
          <a href="https://github.com/SayamDev/latest-cookie/issues/new">
            Suggest a model or correction <ArrowUpRight size={14} />
          </a>
        </div>
      </section>
    </section>
  );
}
