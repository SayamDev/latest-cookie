import { daily, SourceStatus, stamp } from "../daily/DailyPages";
export default function ModelSignals() {
  return (
    <>
      <div className="model-signals" id="model-signals">
        <section>
          <h2>Getting attention</h2>
          <p>
            Hugging Face trending order at the last fetch. Likes are a community
            signal, not an intelligence score or a measure of discussion across
            the whole web.
          </p>
          <ol>
            {daily.trending.slice(0, 6).map((m) => (
              <li key={m.id}>
                <a href={m.url}>{m.id}</a>
                <span>{m.likes.toLocaleString()} likes</span>
              </li>
            ))}
          </ol>
          <p>
            {daily.trending[0]
              ? `Fetched ${stamp(daily.trending[0].fetched)}`
              : "Trend data is currently unavailable."}
          </p>
        </section>
        <section>
          <h2>Speed watch</h2>
          <p>
            Groq-reported generation speed for two production endpoints. These
            are provider figures checked on 8 Oct 2026, not our measurements or
            a global fastest-model ranking.
          </p>
          <ol>
            <li>
              <a href="https://console.groq.com/docs/model/openai/gpt-oss-20b">
                GPT OSS 20B · Groq
              </a>
              <span>1,000 tokens/sec</span>
            </li>
            <li>
              <a href="https://console.groq.com/docs/model/openai/gpt-oss-120b">
                GPT OSS 120B · Groq
              </a>
              <span>500 tokens/sec</span>
            </li>
          </ol>
          <p>
            Speed depends on hosting, workload and service conditions. These
            endpoints use Groq pricing; OpenRouter entries in the catalogue may
            use different hosts.
          </p>
          <div className="signal-links">
            <a href="https://console.groq.com/docs/models">Groq speed source</a>
            <a href="https://artificialanalysis.ai/models">
              Independent benchmarks
            </a>
          </div>
        </section>
      </div>
      <SourceStatus data={daily} kind="models" />
      <SourceStatus data={daily} kind="trending" />
    </>
  );
}
