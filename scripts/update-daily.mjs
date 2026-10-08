import { fetchText } from "./safe-fetch.mjs";
import { readFile, writeFile } from "node:fs/promises";
import { sources } from "./feed-sources.mjs";
import {
  parseFeed,
  parseRouter,
  parseTrending,
  mergeSource,
} from "./feed-core.mjs";
import { validateDaily } from "../src/lib/daily.ts";
const now = new Date();
let snapshot;
try {
  snapshot = validateDaily(
    JSON.parse(await readFile("src/data/daily.json", "utf8")),
  );
} catch {
  snapshot = {
    attemptedAt: now.toISOString(),
    sources: [],
    news: [],
    videos: [],
    models: [],
    trending: [],
  };
}
const request = (url) =>
  fetchText(url, {
    headers: {
      "User-Agent":
        "LatestCookie/1.0 (+https://github.com/SayamDev/latest-cookie)",
    },
  });
// Scheduled builds retain the last published good entries if an upstream fails.
if (process.env.GITHUB_ACTIONS) {
  try {
    const prior = validateDaily(
      JSON.parse(
        await request("https://sayamdev.github.io/latest-cookie/daily.json"),
      ),
    );
    if (prior.attemptedAt > snapshot.attemptedAt) snapshot = prior;
  } catch {
    console.warn("Using repository fallback snapshot.");
  }
}
const results = await Promise.all(
  sources.map(async (source) => {
    try {
      const body = await request(source.url);
      const items =
        source.kind === "models"
          ? parseRouter(JSON.parse(body), now)
          : source.kind === "trending"
            ? parseTrending(JSON.parse(body), now)
            : parseFeed(body, source, now);
      return { source, items, error: false };
    } catch (e) {
      console.warn(`${source.name}: ${e.message}; retaining last good data.`);
      return { source, items: [], error: true };
    }
  }),
);
for (const r of results) mergeSource(snapshot, r.source, r.items, r.error, now);
snapshot.attemptedAt = now.toISOString();
for (const kind of ["news", "videos"])
  snapshot[kind] = snapshot[kind]
    .filter((i) => +now - Date.parse(i.published) <= 30 * 86400000)
    .sort((a, b) => b.published.localeCompare(a.published));
for (const source of snapshot.sources) {
  if (source.kind === "news" || source.kind === "videos")
    source.count = snapshot[source.kind].filter(
      (i) => i.source === source.name,
    ).length;
}
validateDaily(snapshot);
await writeFile(
  "src/data/daily.json",
  JSON.stringify(snapshot, null, 2) + "\n",
);
console.log(
  `Daily snapshot: ${snapshot.news.length} headlines, ${snapshot.videos.length} videos, ${snapshot.models.length} models, ${snapshot.trending.length} trends. ${results.filter((r) => r.error).length} source failures.`,
);
if (results.every((r) => r.error)) process.exitCode = 1;

await import("./update-benchmarks.mjs");
