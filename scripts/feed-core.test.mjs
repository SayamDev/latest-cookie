import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseFeed,
  parseRouter,
  parseTrending,
  mergeSource,
} from "./feed-core.mjs";
const now = new Date("2026-10-08T12:00:00Z");
const source = {
  id: "outlet",
  name: "Outlet",
  kind: "news",
  url: "https://outlet.test/rss",
  hosts: ["outlet.test"],
};
const rss = (items) => `<rss><channel>${items}</channel></rss>`;
const item = (url = "https://outlet.test/a", date = "2026-10-08T10:00:00Z") =>
  `<item><title><![CDATA[A &amp; <b>new</b> thing]]></title><link>${url}</link><pubDate>${date}</pubDate></item>`;
test("RSS ingestion strips markup, deduplicates and rejects unsafe/foreign/future items", () => {
  const rows = parseFeed(
    rss(
      item() +
        item() +
        item("javascript:alert(1)") +
        item("https://other.test/a") +
        item("https://outlet.test/future", "2027-01-01"),
    ),
    source,
    now,
  );
  assert.equal(rows.length, 1);
  assert.equal(rows[0].title, "A & new thing");
  assert.equal(rows[0].url, "https://outlet.test/a");
  assert.throws(() =>
    parseFeed('<!DOCTYPE rss [<!ENTITY x "test">]><rss/>', source, now),
  );
  assert.throws(() =>
    parseFeed(rss(item("https://outlet.test/old", "2024-01-01")), source, now),
  );
});
test("Atom link selection and video views handle absent metrics honestly", () => {
  const atom =
    '<feed><entry><title>One</title><link rel="self" href="https://outlet.test/api"/><link rel="alternate" href="https://outlet.test/a"/><published>2026-10-08T10:00:00Z</published></entry></feed>';
  assert.equal(parseFeed(atom, source, now)[0].url, "https://outlet.test/a");
  const video =
    "<feed><entry><title>AI explained</title><yt:videoId>abcdefghijk</yt:videoId><yt:channelId>channel</yt:channelId><published>2026-10-08T10:00:00Z</published></entry></feed>";
  assert.equal(
    parseFeed(video, { ...source, kind: "videos", channel: "channel" }, now)[0]
      .views,
    null,
  );
  assert.throws(() =>
    parseFeed(video, { ...source, kind: "videos", channel: "wrong" }, now),
  );
});
test("failed source retains last-good entries and successful timestamps", () => {
  const snapshot = {
    sources: [],
    news: [],
    videos: [],
    models: [],
    trending: [],
  };
  const items = parseFeed(rss(item()), source, now);
  mergeSource(snapshot, source, items, false, now);
  mergeSource(snapshot, source, [], true, new Date("2026-10-09T12:00:00Z"));
  assert.deepEqual(snapshot.news, items);
  assert.equal(snapshot.sources[0].status, "stale");
  assert.equal(snapshot.sources[0].checkedAt, now.toISOString());
});
test("router converts per-token rates and marks tiered estimates unsupported", () => {
  const data = Array.from({ length: 10 }, (_, i) => ({
    id: `maker/model-${i}`,
    name: `Maker: Model ${i}`,
    created: 1791370000,
    context_length: 1000,
    architecture: { input_modalities: ["text"], output_modalities: ["text"] },
    pricing: {
      prompt: "0.000002",
      completion: "0.000008",
      ...(i === 0 ? { overrides: [{ min_prompt_tokens: 100 }] } : {}),
    },
    top_provider: { max_completion_tokens: null },
  }));
  const models = parseRouter({ data }, now);
  assert.equal(models[0].inputPrice, 2);
  assert.equal(models[0].outputPrice, 8);
  assert.equal(models[0].estimateSupported, false);
  assert.equal(models[1].estimateSupported, true);
  assert.equal(models[0].maxOutput, null);
  data[3].id = "maker/model:batch";
  data[1].pricing.prompt = "";
  data[2].pricing.prompt = "-1";
  assert.equal(parseRouter({ data }, now).length, 7);
});
test("trends fail closed on empty results and unsafe IDs", () => {
  assert.throws(() => parseTrending([{ id: "<script>" }], now));
  assert.equal(
    parseTrending(
      [{ id: "maker/model", likes: 5, downloads: 20, trendingScore: 3 }],
      now,
    )[0].url,
    "https://huggingface.co/maker/model",
  );
});
