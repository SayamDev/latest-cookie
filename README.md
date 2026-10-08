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
