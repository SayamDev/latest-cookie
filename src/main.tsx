import {
  ArtHeading,
  SectionArt,
  ArtworkFilters,
} from "./components/SectionArt";
import { SiteGuide } from "./components/SiteGuide";
import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Bookmark,
  Search,
  Users,
  Sun,
  Moon,
  Rss,
  Grid2X2,
  Code2,
  Box,
  Shield,
  Cpu,
  Wrench,
  Brain,
  RefreshCw,
  X,
  Trash2,
  GitFork,
} from "lucide-react";
import "@fontsource/barlow-condensed/800.css";
import "@fontsource-variable/dm-sans";
import DailyPages, { DailyPreview, daily } from "./features/daily/DailyPages";
import { validateDaily } from "./lib/daily";
import ModelsPage from "./features/models/ModelsPage";
import rawStories from "./data/stories.json";
import briefings from "./data/briefings.json";
import {
  validateStories,
  filterStories,
  topics,
  type Story,
} from "./lib/content";
import { useBookmarks, useTheme } from "./lib/storage";
import "./baseline.css";
import "./style.css";
const base = import.meta.env.BASE_URL;
const href = (path = "") => base + path;
const repo = "https://github.com/SayamDev/latest-cookie";
const date = (value: string) =>
  new Date(value + "T12:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
const icons = [Grid2X2, Brain, Code2, Box, Shield, Cpu, Wrench];
function Cookie() {
  return (
    <svg className="cookie" viewBox="0 0 80 80" aria-hidden="true">
      <path
        fill="var(--accent)"
        d="M49 5A35 35 0 1 0 75 40C63 42 57 34 58 28 47 26 44 17 49 5Z"
      />
      <circle cx="25" cy="25" r="3" />
      <circle cx="38" cy="40" r="3" />
      <circle cx="23" cy="49" r="3" />
      <circle cx="40" cy="61" r="3" />
      <circle cx="56" cy="52" r="3" />
    </svg>
  );
}
function App() {
  const [dailyData, setDailyData] = useState(daily);
  const [stories, setStories] = useState(() => validateStories(rawStories));
  const path = location.pathname.slice(base.length).replace(/^\/|\/$/g, "");
  const isHome = path === "";
  const isSaved = path === "saved";
  const isFeed = isHome || isSaved;
  const [query, setQuery] = useState(
    new URLSearchParams(location.search).get("q") || "",
  );
  const [topic, setTopic] = useState(
    new URLSearchParams(location.search).get("topic") || "All",
  );
  const [limit, setLimit] = useState(5);
  const [refreshing, setRefreshing] = useState(false);
  const [feedback, setFeedback] = useState("");
  const { saved, toggle, clear, message } = useBookmarks();
  const { theme, toggleTheme } = useTheme();
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !document.querySelector("dialog[open]") &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  const filtered = filterStories(
    stories,
    query,
    topic,
    isSaved ? saved : undefined,
  );
  const homeDefault = isHome && !query && topic === "All";
  const lead = stories[0];
  const story = stories.find((s) => path === "stories/" + s.slug);
  async function refresh() {
    setRefreshing(true);
    setFeedback("");
    try {
      let dailyFailed = false;
      try {
        const dailyResponse = await fetch(href("daily.json"), {
          cache: "no-store",
        });
        if (!dailyResponse.ok) throw new Error();
        setDailyData(validateDaily(await dailyResponse.json()));
      } catch {
        dailyFailed = true;
      }
      const response = await fetch(href("stories.json"), { cache: "no-store" });
      if (!response.ok) throw new Error();
      const updated = validateStories(await response.json());
      setStories(updated);
      setFeedback(
        dailyFailed
          ? "Stories checked; news refresh failed. Current headlines remain available."
          : "Published stories checked. The news desk shows the daily feed timestamps.",
      );
    } catch {
      setFeedback(
        "Could not check for updates. Your current stories are still available.",
      );
    } finally {
      setRefreshing(false);
    }
  }
  function setFilter(t: string) {
    if (!isFeed) {
      location.assign(href("?topic=" + encodeURIComponent(t)));
      return;
    }
    setTopic(t);
    setLimit(5);
  }
  function saveButton(s: Story) {
    return (
      <button
        className={
          "icon-button save-button " + (saved.includes(s.id) ? "is-saved" : "")
        }
        aria-label={`${saved.includes(s.id) ? "Unsave" : "Save"} ${s.title}`}
        aria-pressed={saved.includes(s.id)}
        onClick={() => toggle(s.id)}
      >
        <Bookmark size={20} fill="none" />
      </button>
    );
  }
  function card(s: Story) {
    return (
      <article className="card" key={s.id}>
        <div className="card-top">
          <span className="topic-label">{s.topic}</span>
          {saveButton(s)}
        </div>
        <h2>
          <a href={href("stories/" + s.slug + "/")}>{s.title}</a>
        </h2>
        <p>{s.summary}</p>
        <div className="story-meta">
          <a href={s.url}>
            {s.source} <ArrowUpRight size={12} />
          </a>
          <time dateTime={s.publishedAt}>{date(s.publishedAt)}</time>
        </div>
      </article>
    );
  }
  function row(s: Story) {
    return (
      <article className="story-row" key={s.id}>
        <div className="row-meta">
          <span className="topic-label">{s.topic}</span>
          <span>{s.source}</span>
          <time dateTime={s.publishedAt}>{date(s.publishedAt)}</time>
        </div>
        <div>
          <h2>
            <a href={href("stories/" + s.slug + "/")}>{s.title}</a>
          </h2>
          <p>{s.summary}</p>
        </div>
        <div className="row-actions">
          {saveButton(s)}
          <a
            className="icon-button"
            href={href("stories/" + s.slug + "/")}
            aria-label={"Read " + s.title}
          >
            <ArrowUpRight />
          </a>
        </div>
      </article>
    );
  }
  return (
    <div className="page">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="top">
        <a className="brand" href={href()} aria-label="Latest Cookie home">
          <span className="brand-name">LATEST COOKIE</span>
          <Cookie />
          <span className="tagline">
            TECH WORTH YOUR TIME.
            <br />
            STRAIGHT FROM THE SOURCE.
          </span>
        </a>
        <form
          className="search"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            if (!isFeed)
              location.assign(href("?q=" + encodeURIComponent(query)));
          }}
        >
          <label>
            <Search />
            <span className="sr">Search stories</span>
            <input
              ref={input}
              type="search"
              placeholder="Find your next rabbit hole…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setLimit(5);
              }}
            />
            <kbd>/</kbd>
          </label>
        </form>
        <a
          className="top-link"
          aria-label="Saved stories"
          href={href("saved/")}
        >
          <Bookmark />
          <span>Saved{saved.length > 0 ? ` (${saved.length})` : ""}</span>
        </a>
        <a
          className="top-link"
          aria-label="Community"
          href={href("community/")}
        >
          <Users />
          <span>Community</span>
        </a>
        <button
          className="theme-button icon-button"
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          onClick={toggleTheme}
        >
          {theme === "light" ? <Moon /> : <Sun />}
        </button>
      </header>
      <nav className="edition-bar" aria-label="Publication">
        <span>Independent minds. Fresh perspectives.</span>
        <div>
          <a href={href()} aria-current={isHome ? "page" : undefined}>
            Home
          </a>
          <a
            href={href("news/")}
            aria-current={path === "news" ? "page" : undefined}
          >
            News desk
          </a>
          <a
            href={href("watch/")}
            aria-current={path === "watch" ? "page" : undefined}
          >
            Watch
          </a>
          <a
            href={href("models/")}
            aria-current={path === "models" ? "page" : undefined}
          >
            Model Lab
          </a>
          <a
            href={href("briefings/")}
            aria-current={path === "briefings" ? "page" : undefined}
          >
            The weekly bite
          </a>
          <a
            href={href("about/")}
            aria-current={path === "about" ? "page" : undefined}
          >
            Our approach
          </a>
          <a href={href("feed.xml")} aria-label="RSS feed">
            <Rss size={15} />
            <span>RSS</span>
          </a>
        </div>
      </nav>
      <SiteGuide
        story={lead}
        saved={saved.includes(lead.id)}
        toggle={() => toggle(lead.id)}
      />
      <div className={isFeed ? "layout" : "reading-layout"}>
        {isFeed && (
          <aside className="sidebar" aria-label="Topics and source freshness">
            <h2 className="small-heading">Explore topics</h2>
            <nav className="topics" aria-label="Topics">
              {topics.map((t, i) => {
                const Icon = icons[i];
                return (
                  <button
                    key={t}
                    aria-label={t}
                    className={topic === t ? "active" : ""}
                    aria-pressed={topic === t}
                    onClick={() => setFilter(t)}
                  >
                    <Icon size={19} />
                    {t}
                    <span>
                      {t === "All"
                        ? stories.length
                        : stories.filter((s) => s.topic === t).length}
                    </span>
                  </button>
                );
              })}
            </nav>
            <div className="rail-note">
              <Cookie />
              <h3>A little more signal.</h3>
              <p>Useful context. Original sources. Room for curiosity.</p>
              <a href={href("about/")}>
                Meet Latest Cookie <ArrowRight size={15} />
              </a>
            </div>
            <div className="freshness">
              <span>Sources last checked</span>
              <strong>
                {date(
                  stories.reduce(
                    (a, s) => (s.collectedAt > a ? s.collectedAt : a),
                    "",
                  ),
                )}
              </strong>
              <button
                className="text-button"
                onClick={refresh}
                disabled={refreshing}
              >
                <RefreshCw size={14} className={refreshing ? "spinning" : ""} />
                {refreshing ? "Checking…" : "Check for updates"}
              </button>
              <p>Our summaries are curated. The news desk updates daily.</p>
            </div>
          </aside>
        )}
        <main id="main" className="main" tabIndex={-1}>
          {isFeed ? (
            <>
              {isSaved && (
                <div className="page-intro">
                  <ArtHeading kind="jar-full">YOUR COOKIE JAR.</ArtHeading>
                  <p>Good reads, kept for later. Saved only in this browser.</p>
                  {saved.length > 0 && (
                    <button className="text-button" onClick={clear}>
                      <Trash2 size={16} />
                      Clear saved stories
                    </button>
                  )}
                </div>
              )}
              {homeDefault && <DailyPreview data={dailyData} />}
              {homeDefault && (
                <div className="feature-area">
                  <article className="feature">
                    <div className="feature-copy">
                      <div className="feature-meta">
                        <span>{lead.topic}</span>
                        <time dateTime={lead.publishedAt}>
                          {date(lead.publishedAt)}
                        </time>
                      </div>
                      <h1>
                        <a href={href("stories/" + lead.slug + "/")}>
                          {lead.title}
                        </a>
                      </h1>
                      <p className="deck">{lead.summary}</p>
                      <div className="feature-actions">
                        <a
                          className="button primary"
                          href={href("stories/" + lead.slug + "/")}
                        >
                          Get the story <ArrowUpRight size={18} />
                        </a>
                        {saveButton(lead)}
                      </div>
                      <a className="source-link" href={lead.url}>
                        Original source: {lead.source}
                        <ArrowUpRight size={13} />
                      </a>
                    </div>
                    <a
                      className="art-link"
                      href={href("stories/" + lead.slug + "/")}
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      <img
                        className="hero-art"
                        src={href("art/orange-chip-cookie.jpg")}
                        width="1100"
                        height="1100"
                        alt=""
                      />
                    </a>
                  </article>
                  <aside className="bookmarks" aria-label="Saved reading">
                    <div className="bookmark-list">
                      <h2 className="bookmark-heading">
                        The cookie jar <Bookmark size={18} />
                      </h2>
                      {saved.length === 0 ? (
                        <div className="jar-empty">
                          <Bookmark size={30} />
                          <h3>Found a good one?</h3>
                          <p>
                            Tap the bookmark on any story. We’ll keep it here
                            for your next coffee break.
                          </p>
                          <span>No account. Just your browser.</span>
                        </div>
                      ) : (
                        stories
                          .filter((s) => saved.includes(s.id))
                          .slice(0, 3)
                          .map((s) => (
                            <div className="saved" key={s.id}>
                              <div>
                                <h3 className="saved-title">
                                  <a href={href("stories/" + s.slug + "/")}>
                                    {s.title}
                                  </a>
                                </h3>
                                <span className="meta">{s.source}</span>
                              </div>
                              {saveButton(s)}
                            </div>
                          ))
                      )}
                      {saved.length > 0 && (
                        <a className="text-button" href={href("saved/")}>
                          All saved stories <ArrowRight size={16} />
                        </a>
                      )}
                    </div>
                    <a className="join" href={href("community/")}>
                      <span className="join-title">
                        PULL UP A CHAIR <ArrowUpRight size={19} />
                      </span>
                      <span className="join-bottom">
                        Build something. Ask something. Find your people.
                        <Users size={36} />
                      </span>
                    </a>
                  </aside>
                </div>
              )}
              <div className="feed-heading">
                {homeDefault || isSaved ? (
                  <h2>{isSaved ? "Saved stories" : "Fresh from the feed"}</h2>
                ) : (
                  <h1>{query ? "Search results" : topic}</h1>
                )}
                <span aria-live="polite">
                  {filtered.length}{" "}
                  {filtered.length === 1 ? "story" : "stories"}
                </span>
                {(query || topic !== "All") && (
                  <button
                    className="text-button"
                    onClick={() => {
                      setQuery("");
                      setTopic("All");
                    }}
                  >
                    Clear filters <X size={14} />
                  </button>
                )}
              </div>
              {filtered.length === 0 ? (
                <div className="empty-state">
                  {isSaved && !saved.length ? (
                    <>
                      <SectionArt kind="jar" className="empty-jar-art" />
                    </>
                  ) : (
                    <Search size={32} />
                  )}
                  <h2>
                    {isSaved && !saved.length
                      ? "Your jar is empty."
                      : "No stories here yet."}
                  </h2>
                  <p>
                    {isSaved && !saved.length
                      ? "Bookmark a story and it will be waiting here."
                      : query
                        ? "Try another search or clear your filters."
                        : "We haven’t published coverage in this topic yet. Explore the other topics while we build the collection."}
                  </p>
                  <a className="button primary" href={href()}>
                    Explore the latest <ArrowRight size={16} />
                  </a>
                </div>
              ) : homeDefault ? (
                <section className="cards" aria-label="Latest stories">
                  {filtered.slice(1, 5).map(card)}
                </section>
              ) : (
                <section className="result-list" aria-label="Stories">
                  {filtered.slice(0, limit).map(row)}
                </section>
              )}
              {homeDefault && limit > 5 && (
                <section className="result-list extra-stories">
                  {filtered.slice(5, limit).map(row)}
                </section>
              )}
              {filtered.length > limit && (
                <div className="load-more">
                  <button
                    className="button"
                    onClick={() => setLimit(filtered.length)}
                  >
                    <span className="chew-cookie">
                      <Cookie />
                    </span>
                    More to chew on <ArrowRight size={20} aria-hidden="true" />
                  </button>
                </div>
              )}
            </>
          ) : story ? (
            <article className="article-page">
              <a className="back-link" href={href()}>
                <ArrowLeft size={16} />
                Back to the feed
              </a>
              <div className="article-heading">
                <span className="topic-label">{story.topic}</span>
                <h1>{story.title}</h1>
                <div className="article-meta">
                  <span>
                    {story.source} ·{" "}
                    <time dateTime={story.publishedAt}>
                      {date(story.publishedAt)}
                    </time>
                  </span>
                  {saveButton(story)}
                  <a className="button primary" href={story.url}>
                    Read original <ArrowUpRight size={18} />
                  </a>
                </div>
              </div>
              <div className="article-body">
                <p className="article-summary">{story.summary}</p>
                <h2>Why it matters</h2>
                <p>{story.why}</p>
                <h2>The useful bits</h2>
                <ul>
                  {story.takeaways.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <div className="source-note">
                  <strong>Go straight to the source.</strong>
                  <p>
                    This is a short, AI-assisted summary checked against the
                    linked announcement. It is not a substitute for the full
                    documentation or an independent human review.
                  </p>
                  <a href={story.url}>
                    {story.source} announcement <ArrowUpRight size={16} />
                  </a>
                  <p className="muted">
                    Source checked {date(story.collectedAt)}.
                  </p>
                </div>
                <a
                  className="text-button"
                  href={
                    repo +
                    "/issues/new?title=" +
                    encodeURIComponent("Correction: " + story.title)
                  }
                >
                  Spot something off? Suggest a correction{" "}
                  <ArrowUpRight size={15} />
                </a>
              </div>
              <h2 className="related-heading">
                Keep following your curiosity.
              </h2>
              <div className="cards related">
                {stories
                  .filter((s) => s.id !== story.id)
                  .slice(0, 3)
                  .map(card)}
              </div>
            </article>
          ) : path === "briefings" ? (
            <section className="briefing-page">
              <div className="page-intro">
                <span className="topic-label">The weekly bite</span>
                <ArtHeading kind="weekly">{briefings[0].title}</ArtHeading>
                <p>{briefings[0].description}</p>
                <div className="briefing-meta">
                  <time dateTime={briefings[0].date}>
                    Launch edition · {date(briefings[0].date)}
                  </time>
                  <a className="button" href={href("feed.xml")}>
                    <Rss size={17} />
                    Follow via RSS
                  </a>
                </div>
              </div>
              <div className="result-list">
                {stories
                  .filter((s) => briefings[0].stories.includes(s.id))
                  .map(row)}
              </div>
              <div className="archive-note">
                <h2>The archive starts here.</h2>
                <p>
                  This is our first briefing. Future editions will appear here
                  as they are published. No email subscription is required.
                </p>
              </div>
            </section>
          ) : path === "community" ? (
            <section className="community-page">
              <div className="page-intro">
                <ArtHeading kind="community">
                  GOOD TECH.
                  <br />
                  BETTER COMPANY.
                </ArtHeading>
                <p>
                  For the people who open the docs, follow the rabbit hole, and
                  share what they find.
                </p>
                <a className="button primary" href={repo + "/discussions"}>
                  Enter the community <ArrowUpRight size={19} />
                </a>
                <p className="muted">
                  Hosted on GitHub Discussions. Read freely; a GitHub account is
                  needed to post.
                </p>
              </div>
              <div className="community-links">
                {[
                  [
                    "Show and tell",
                    "show-and-tell",
                    "Put your side project in good company.",
                  ],
                  [
                    "Help & questions",
                    "q-a",
                    "No question too small. Bring the details.",
                  ],
                  [
                    "Interesting finds",
                    "general",
                    "Share a useful link and why it caught your eye.",
                  ],
                  [
                    "Ideas & feedback",
                    "ideas",
                    "Help shape what Latest Cookie becomes.",
                  ],
                ].map(([title, slug, description]) => (
                  <a key={slug} href={repo + "/discussions/categories/" + slug}>
                    <h2>{title}</h2>
                    <p>{description}</p>
                    <ArrowUpRight />
                  </a>
                ))}
              </div>
              <div className="article-body">
                <h2>A few house rules.</h2>
                <p>
                  Be curious and kind. Critique ideas, not people. Link your
                  sources, disclose affiliations, and make room for beginners.
                  No harassment, spam, doxxing or malicious links.
                </p>
                <p>
                  Use GitHub’s report controls for harmful posts. Maintainers
                  can remove harmful content and restrict repeat offenders.
                </p>
                <a href={repo + "/blob/main/COMMUNITY.md"}>
                  Read the community guidelines <ArrowUpRight size={15} />
                </a>
              </div>
            </section>
          ) : path === "news" || path === "watch" ? (
            <DailyPages kind={path === "news" ? "news" : "videos"} />
          ) : path === "models" ? (
            <ModelsPage />
          ) : path === "about" ? (
            <section className="about-page">
              <div className="page-intro">
                <ArtHeading kind="about">
                  STAY CURIOUS.
                  <br />
                  SKIP THE FILLER.
                </ArtHeading>
                <p>
                  Latest Cookie is an independent corner of the web for people
                  who care about how technology actually works.
                </p>
              </div>
              <div className="article-body">
                <h2>A useful first bite.</h2>
                <p>
                  We collect technology announcements, explain what changed, and
                  send you straight to the original source. Reading, searching
                  and saving stories are free. This launch collection focuses on
                  developer tools, open source and the web; it is not
                  comprehensive coverage.
                </p>
                <h2>Sources before takes.</h2>
                <p>
                  We prefer official release notes, project repositories,
                  engineering blogs and original research. Publication dates
                  belong to the source. “Last checked” tells you when we checked
                  it, not when it happened.
                </p>
                <h2>Honest about automation.</h2>
                <p>
                  The initial summaries were drafted with AI assistance and
                  checked against the linked primary sources by the building
                  assistant. They have not had an independent human editorial
                  review. The separate news desk, video feeds and OpenRouter
                  model listings refresh automatically each day from public
                  metadata. Imported headlines are not independently
                  fact-checked. We do not manufacture quotes, benchmark results
                  or community activity.
                </p>
                <h2>Corrections belong in the open.</h2>
                <p>
                  Found an error? Open a correction issue with the story and
                  supporting source. Changes are recorded in the public
                  repository.
                </p>
                <a className="button" href={repo + "/issues/new"}>
                  Suggest a correction <ArrowUpRight size={16} />
                </a>
                <h2>Your reading is yours.</h2>
                <p>
                  No analytics, advertising or account is required here.
                  Bookmarks and your theme preference stay in this browser’s
                  local storage. GitHub hosts the site and community under its
                  own privacy policies. The Watch page requests thumbnails from
                  YouTube’s image service; videos open on YouTube. We do not use
                  tracking cookies—despite the name.
                </p>
                <h2>Built in the open.</h2>
                <p>
                  Created by Sayam Ajmal. The code is MIT licensed. Original
                  linked articles belong to their publishers. Latest Cookie is
                  not affiliated with or endorsed by the companies it covers.
                </p>
                <a className="button" href={repo}>
                  <GitFork size={17} />
                  Explore the source
                </a>
              </div>
            </section>
          ) : (
            <div className="empty-state">
              <h1>That cookie has crumbled.</h1>
              <p>We couldn’t find this page.</p>
              <a className="button primary" href={href()}>
                Back to the feed <ArrowRight />
              </a>
            </div>
          )}
        </main>
      </div>
      <ArtworkFilters />
      <footer>
        <div className="footer">
          <a className="browse" href={href("briefings/")}>
            <Cookie />
            <div className="browse-copy">
              <span className="browse-title">
                THE WEEKLY BITE <ArrowRight size={17} />
              </span>
              <p>
                A handful of stories.
                <br />
                Something worth taking away.
              </p>
            </div>
          </a>
          <div className="footer-links">
            <nav aria-label="Explore">
              <a href={href()}>Latest stories</a>
              <a href={href("saved/")}>Saved stories</a>
              <a href={href("models/")}>Model Lab</a>
              <a href={href("news/")}>News desk</a>
              <a href={href("watch/")}>Tech videos</a>
              <a href={href("community/")}>Community</a>
            </nav>
            <nav aria-label="Publication information">
              <a href={href("about/")}>Editorial & privacy</a>
              <a href={href("feed.xml")}>RSS feed</a>
              <a href={repo}>
                Source on GitHub <ArrowUpRight size={13} />
              </a>
            </nav>
          </div>
          <SectionArt kind="footer" className="new-footer-art" />
        </div>
        <div className="colophon">
          <span>© 2026 Sayam Ajmal · Latest Cookie</span>
          <span>Small bites. A wider world.</span>
        </div>
      </footer>
      <div className="status" role="status" aria-live="polite">
        {feedback || message}
      </div>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
