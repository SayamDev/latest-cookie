# Latest Cookie

An independent, free technology reading and discovery app. Useful stories, original sources, browser-local bookmarks and a public community.

## Develop

Requires Node.js 22.12+ (Node 24 LTS recommended).

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

## Content

Edit `src/data/stories.json`. Every entry needs an original HTTPS source, publication date, collection date, concise original summary, topic and source-check status. Verify claims against the original before publishing. Do not copy full articles. `src/lib/content.ts` validates stories and rejects duplicates. Stories are curated snapshots, not a continuously updating feed. The first collection was checked on 8 October 2026.

Use a pull request for editorial changes. New stories must be reviewed before merging. Build generates individual story URLs, RSS and a sitemap. Search covers published stories only.

## Deploy

The Pages workflow builds and deploys main. Enable GitHub Pages with GitHub Actions as its source. `BASE_PATH` must match the repository subpath; `SITE_URL` must be the public origin including that subpath. For a root domain set `BASE_PATH=/` and update `SITE_URL`.

## Privacy and limits

No analytics, advertising or login for reading. Bookmarks and theme use localStorage in the current browser. GitHub hosts source/discussions and applies its own policies. There is no email subscription service. No live community counts are displayed. Editorial summaries are manually curated. The news desk and discovery feeds import public metadata daily. Video thumbnails request images from YouTube; there is no embedded player.

## Contribute

See CONTRIBUTING.md, COMMUNITY.md and ACCESSIBILITY.md. Code is MIT licensed. Original linked articles remain the property of their publishers.

## Model Lab

`/models/` combines direct-provider references with a daily OpenRouter catalogue. Filters, incremental loading, charts, a text-token calculator and shareable comparisons keep the catalogue navigable. Newly listed means added to OpenRouter, not a verified launch date. Special service variants such as free and batch are excluded. Router listings use router rates; do not substitute these for direct-provider quotes. Tiered or per-request pricing disables estimates. Unknown output limits are shown as unavailable.

Hugging Face supplies a separate platform-specific trending signal. Groq speed figures are dated provider-reported snapshots, not a global fastest-model leaderboard. No Artificial Analysis benchmark dataset is integrated.

## Daily news and videos

`/news/` imports publisher headlines from The Verge, Ars Technica, TechCrunch and WIRED. `/watch/` imports recent uploads and reported view counts from Marques Brownlee, Fireship, Computerphile and Two Minute Papers. Video topics are assigned by title/channel rules; they are not YouTube's personalized categories. Most viewed ranks lifetime views within the selected recent feed entries. Some feeds expose no counter; absence is not zero.

Run `npm run update:daily` to fetch a snapshot. Sources are allowlisted in `scripts/feed-sources.mjs`; parsing, date validation, deduplication and last-good fallback are tested. Up to 12 headlines per outlet and 8 videos per channel are retained within 30 days. Article bodies and video descriptions are not copied. Source links take visitors to the publisher; subscriptions may apply.

The Pages workflow runs daily at **06:17 UTC**, and can be started with `gh workflow run pages.yml`. Schedule times can be delayed by GitHub. Scheduled/manual builds fetch the latest published snapshot as fallback before updating, validate, test, build and deploy. Generated snapshots are deployed as `daily.json`; scheduled runs do not commit to the source repository. Source control carries a bootstrap snapshot. All-source failure fails the build, preserving the existing deployment; partial failures retain prior data with explicit stale status. Feed health shows last-successful timestamps, not just the latest attempt.

This runs on GitHub, with no local desktop or API key required. GitHub can disable scheduled workflows in public repositories after 60 days without repository activity; maintainers must check Actions and re-enable if needed. The site marks data older than 48 hours. To change timing edit `.github/workflows/pages.yml`; use UTC.

Verify: `npm test`, `npm run lint`, `npm run build`, `npm run test:e2e`. XML fixtures and catalogue fixtures cover malicious URLs, future dates, duplicate entries, absent counters, tiered costs and failed-source preservation.
