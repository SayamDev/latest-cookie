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

No analytics, advertising or login for reading. Bookmarks and theme use localStorage in the current browser. GitHub hosts source/discussions and applies its own policies. There is no email subscription service. No live community counts are displayed. Content is manually curated, not automatically collected or published.

## Contribute

See CONTRIBUTING.md, COMMUNITY.md and ACCESSIBILITY.md. Code is MIT licensed. Original linked articles remain the property of their publishers.

## Model Lab

`/models/` offers filters, price charts, a text-token cost calculator and comparisons of up to three models. Share this view creates a URL containing filters, selections and token volumes. Six manually checked models launch the catalogue, including earlier GPT-4.1 options; this is not an exhaustive latest-model leaderboard.

Edit `src/data/models.json` only after checking the linked first-party specifications and pricing. Preserve the distinction between shared context and input limits. Rates use USD per million uncached text tokens on the standard paid tier. Cost estimates exclude tools, caching, special service tiers, taxes and regional modifiers. Refresh dates only after checking the sources. Build validates entries; `src/lib/models.test.ts` tests validation and calculation. No Artificial Analysis benchmark data is copied or integrated.
