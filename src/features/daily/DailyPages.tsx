import { useState } from "react";
import { ArrowUpRight, Play, RefreshCw } from "lucide-react";
import initial from "../../data/daily.json";
import {
  validateDaily,
  videoTopic,
  videoTopics,
  type Daily,
} from "../../lib/daily";
import "./daily.css";
export const daily = validateDaily(initial);
const href = (path: string) => import.meta.env.BASE_URL + path;
export const stamp = (value: string) =>
  new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }) + " UTC";
const count = (n: number) =>
  new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
export function SourceStatus({ data, kind }: { data: Daily; kind?: string }) {
  const [now] = useState(() => Date.now());
  const sources = data.sources.filter((s) => !kind || s.kind === kind);
  return (
    <details className="daily-source-status">
      <summary>
        {kind === "models"
          ? "Model catalogue feed health"
          : kind === "trending"
            ? "Trending model feed health"
            : "Feed health & update times"}
      </summary>
      <p>
        Scheduled daily at 06:17 UTC. Hosting queues can delay a run. Failed
        feeds retain their last good entries; times below record the last
        successful fetch.
      </p>
      <ul>
        {sources.map((s) => (
          <li key={s.id}>
            <a href={s.url}>{s.name}</a>
            <span>
              {s.status === "ok"
                ? "Fetched"
                : s.status === "stale"
                  ? "Retained after a failed check"
                  : "Currently unavailable"}{" "}
              · {s.checkedAt ? stamp(s.checkedAt) : "No successful fetch yet"}
              {s.checkedAt && now - Date.parse(s.checkedAt) > 48 * 3600000
                ? " · More than 48h old"
                : ""}
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}
export function DailyPreview({ data = daily }: { data?: Daily }) {
  return (
    <section className="daily-preview" aria-labelledby="daily-heading">
      <div className="daily-heading-row">
        <div>
          <h2 id="daily-heading">Fresh from the news desk</h2>
          <p>Publisher headlines · Daily updates</p>
        </div>
        <a href={href("news/")}>
          All headlines <ArrowUpRight size={16} />
        </a>
      </div>
      <div className="daily-preview-grid">
        {data.news.slice(0, 4).map((item) => (
          <article key={item.id}>
            <span>{item.source}</span>
            <h3>
              <a href={item.url}>{item.title}</a>
            </h3>
            <time dateTime={item.published}>{stamp(item.published)}</time>
          </article>
        ))}
      </div>
      <div className="daily-shortcuts">
        <a href={href("watch/")}>
          <Play size={15} /> Tech videos
        </a>
        <a href={href("models/")}>
          Explore {data.models.length}+ models <ArrowUpRight size={15} />
        </a>
        <a href={href("news/#feed-health")}>
          Last run {stamp(data.attemptedAt)}
        </a>
      </div>
    </section>
  );
}
export default function DailyPages({ kind }: { kind: "news" | "videos" }) {
  const [data, setData] = useState(daily);
  const [now, setNow] = useState(() => Date.now());
  const [topic, setTopic] = useState("All");
  const [source, setSource] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(kind === "videos" ? "views" : "latest");
  const [days, setDays] = useState("30");
  const [limit, setLimit] = useState(12);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const video = kind === "videos";
  const filtered = data[kind]
    .filter(
      (i) =>
        (source === "All" || i.source === source) &&
        (topic === "All" || videoTopic(i) === topic) &&
        i.title.toLowerCase().includes(query.trim().toLowerCase()) &&
        now - Date.parse(i.published) <= Number(days) * 86400000,
    )
    .sort((a, b) =>
      sort === "views"
        ? ((("views" in b ? b.views : null) as number | null) ?? -1) -
            ((("views" in a ? a.views : null) as number | null) ?? -1) ||
          b.published.localeCompare(a.published)
        : b.published.localeCompare(a.published),
    );
  async function refresh() {
    setBusy(true);
    try {
      const response = await fetch(href("daily.json"), { cache: "no-store" });
      if (!response.ok) throw new Error();
      const next = validateDaily(await response.json());
      setData(next);
      setNow(Date.now());
      setFeedback(
        "Published snapshot checked. Feed health shows when each source last succeeded.",
      );
    } catch {
      setFeedback(
        "Could not check for updates. The saved snapshot is still available.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="daily-page">
      <header className="lab-intro">
        <div>
          <h1>{video ? "PRESS PLAY." : "THE NEWS DESK."}</h1>
          <p>
            {video
              ? "Good tech. Worth watching."
              : "The headlines, straight from the outlets."}
          </p>
        </div>
        <div className="lab-edition">
          <strong>
            {video ? "4 selected tech channels" : "4 technology publications"}
          </strong>
          <span>Last run {stamp(data.attemptedAt)}</span>
          <button className="button" disabled={busy} onClick={refresh}>
            <RefreshCw size={15} />
            {busy ? "Checking…" : "Check published updates"}
          </button>
        </div>
      </header>
      <FreshnessNotice data={data} kind={kind} />
      <p className="daily-description">
        {video
          ? "Recent uploads from Marques Brownlee, Fireship, Computerphile and Two Minute Papers. “Most viewed” ranks reported lifetime views for the videos in your selected window; it is not YouTube’s global trending chart."
          : "Headlines from The Verge, Ars Technica, TechCrunch and WIRED. Automatically imported from their public feeds, with direct links to the original reporting. These headlines have not been independently fact-checked by Latest Cookie. Some articles require a subscription."}
      </p>
      {video && (
        <div className="video-topics" role="group" aria-label="Video topics">
          {["All", ...videoTopics].map((t) => (
            <button
              key={t}
              aria-pressed={topic === t}
              onClick={() => {
                setTopic(t);
                setLimit(12);
              }}
            >
              {t}
            </button>
          ))}
        </div>
      )}
      <div className="daily-controls">
        <label>
          Search {video ? "videos" : "headlines"}
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(12);
            }}
          />
        </label>
        <label>
          {video ? "Channel" : "Outlet"}
          <select
            aria-label={video ? "Channel" : "Outlet"}
            value={source}
            onChange={(e) => {
              setSource(e.target.value);
              setLimit(12);
            }}
          >
            <option>All</option>
            {data.sources
              .filter((s) => s.kind === kind)
              .map((s) => (
                <option key={s.id}>{s.name}</option>
              ))}
          </select>
        </label>
        <label>
          Published within
          <select
            aria-label="Published within"
            value={days}
            onChange={(e) => {
              setDays(e.target.value);
              setLimit(12);
            }}
          >
            <option value="7">7 days</option>
            <option value="30">30 days</option>
          </select>
        </label>
        {video && (
          <label>
            Order
            <select
              aria-label="Video order"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="views">Most viewed in this selection</option>
              <option value="latest">Newest first</option>
            </select>
          </label>
        )}
      </div>
      <p className="daily-results" aria-live="polite">
        {filtered.length} {video ? "videos" : "headlines"} ·{" "}
        {video
          ? "View counts are snapshots, not live counters."
          : "Newest first. Publisher times shown in UTC."}
      </p>
      <p role="status">{feedback}</p>
      {filtered.length ? (
        <div className={video ? "video-grid" : "news-list"}>
          {filtered.slice(0, limit).map((item) => (
            <article key={item.id}>
              {"videoId" in item && (
                <a
                  href={item.url}
                  className="video-thumb"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <VideoThumbnail
                    videoId={item.videoId as string}
                    source={item.source}
                  />
                  <span>
                    <Play size={22} />
                  </span>
                </a>
              )}
              <div className="news-item-copy">
                <div className="news-item-meta">
                  <span>
                    {item.source}
                    {video ? ` · ${videoTopic(item)}` : ""}
                  </span>
                  <time dateTime={item.published}>{stamp(item.published)}</time>
                </div>
                <h2>
                  <a href={item.url}>
                    {item.title} <ArrowUpRight size={17} />
                  </a>
                </h2>
                {"views" in item && (
                  <p>
                    {item.views === null
                      ? "View count unavailable"
                      : `${count(item.views as number)} reported views`}{" "}
                    · Checked {stamp(item.fetched)}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="lab-empty">
          <h2>No {video ? "videos" : "headlines"} match.</h2>
          <p>Try another search, source or time window.</p>
          <button
            className="button"
            onClick={() => {
              setQuery("");
              setSource("All");
              setDays("30");
              setTopic("All");
            }}
          >
            Reset filters
          </button>
        </div>
      )}
      {filtered.length > limit && (
        <button
          className="button daily-more"
          onClick={() => setLimit((n) => n + 12)}
        >
          Show 12 more
        </button>
      )}
      <div id="feed-health">
        <SourceStatus data={data} kind={kind} />
      </div>
      <p className="daily-description">
        {video
          ? "Topics are assigned automatically from titles and channel focus, and may be imperfect. Videos play on YouTube. Thumbnail requests go to YouTube’s image service; no embedded player loads here. We retain up to eight recent uploads per channel, not their complete catalogues."
          : "We retain up to 12 recent items per outlet. Publishers own their headlines and articles. We link to the reporting and do not republish article bodies."}
      </p>
    </section>
  );
}

export function FreshnessNotice({ data, kind }: { data: Daily; kind: string }) {
  const [now] = useState(() => Date.now());
  const affected = data.sources.filter(
    (s) =>
      s.kind === kind &&
      (s.status !== "ok" ||
        !s.checkedAt ||
        now - Date.parse(s.checkedAt) > 48 * 3600000),
  );
  return affected.length ? (
    <p className="freshness-warning">
      Some feeds need attention: {affected.map((s) => s.name).join(", ")}.
      Retained data may be old. Check feed health below for exact times.
    </p>
  ) : null;
}

function VideoThumbnail({
  videoId,
  source,
}: {
  videoId: string;
  source: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <>
      <div className="video-thumb-fallback" hidden={loaded}>
        <strong>{source}</strong>
        <span>
          {failed
            ? "Preview unavailable · Watch on YouTube"
            : "Watch on YouTube"}
        </span>
      </div>
      {!failed && (
        <img
          src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
          alt=""
          width="480"
          height="360"
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          style={{ opacity: loaded ? 1 : 0 }}
        />
      )}
    </>
  );
}
