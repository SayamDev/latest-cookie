import { decodeHTML } from "entities";
import { XMLParser } from "fast-xml-parser";
import { createHash } from "node:crypto";
import { validateModels } from "../src/lib/models.ts";
const arr = (x) => (x === undefined ? [] : Array.isArray(x) ? x : [x]);
const text = (x) =>
  (typeof x === "object" ? x?.["#text"] : x)?.toString() || "";
const clean = (x) =>
  decodeHTML(text(x))
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 300);
export function parseFeed(xml, source, now) {
  if (xml.length > 5_000_000 || /<!DOCTYPE|<!ENTITY/i.test(xml))
    throw new Error("Invalid XML");
  const data = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@",
    parseTagValue: false,
  }).parse(xml);
  const entries = arr(data.rss?.channel?.item || data.feed?.entry);
  const items = entries.flatMap((e) => {
    const published = new Date(e.pubDate || e.published || e.updated);
    const title = clean(e.title);
    if (
      !title ||
      !Number.isFinite(+published) ||
      +published > +now ||
      +now - +published > 30 * 86400000
    )
      return [];
    const videoId = text(e["yt:videoId"]);
    let url;
    try {
      url = new URL(
        source.kind === "videos"
          ? `https://www.youtube.com/watch?v=${videoId}`
          : typeof e.link === "string"
            ? e.link
            : arr(e.link).find(
                (l) => l["@rel"] === "alternate" || !l["@rel"],
              )?.["@href"],
      );
    } catch {
      return [];
    }
    if (
      url.protocol !== "https:" ||
      (source.kind === "news" && !source.hosts.includes(url.hostname))
    )
      return [];
    if (
      source.kind === "videos" &&
      (!/^[\w-]{11}$/.test(videoId) ||
        text(e["yt:channelId"]) !== source.channel)
    )
      return [];
    const item = {
      id: createHash("sha256").update(url.href).digest("hex").slice(0, 16),
      title,
      url: url.href,
      source: source.name,
      published: published.toISOString(),
      fetched: now.toISOString(),
    };
    if (source.kind === "videos") {
      const value =
        e["media:group"]?.["media:community"]?.["media:statistics"]?.["@views"];
      const views = value === undefined ? NaN : Number(value);
      return [
        {
          ...item,
          videoId,
          views: Number.isSafeInteger(views) && views >= 0 ? views : null,
        },
      ];
    }
    return [item];
  });
  if (!items.length) throw new Error("No recent valid entries");
  return [...new Map(items.map((i) => [i.url, i])).values()]
    .sort((a, b) => b.published.localeCompare(a.published))
    .slice(0, source.kind === "videos" ? 8 : 12);
}
export function parseRouter(raw, now) {
  if (!Array.isArray(raw.data) || raw.data.length < 10)
    throw new Error("Invalid catalogue");
  const result = raw.data.flatMap((m) => {
    const input = Number(m.pricing?.prompt),
      output = Number(m.pricing?.completion);
    if (
      typeof m.pricing?.prompt !== "string" ||
      typeof m.pricing?.completion !== "string" ||
      m.pricing.prompt.trim() === "" ||
      m.pricing.completion.trim() === "" ||
      ![input, output].every((n) => Number.isFinite(n) && n >= 0) ||
      !m.architecture?.output_modalities?.includes("text") ||
      m.architecture.output_modalities.some((x) => x !== "text") ||
      !m.context_length ||
      !m.id ||
      !/^[a-zA-Z0-9._:/-]+$/.test(m.id) ||
      !m.name ||
      m.id.includes(":") ||
      ["openrouter/auto", "openrouter/free"].includes(m.id)
    )
      return [];
    const created = new Date(m.created * 1000);
    if (
      !Number.isFinite(+created) ||
      +created > +now ||
      (m.expiration_date && m.expiration_date < now.toISOString().slice(0, 10))
    )
      return [];
    const inputs = m.architecture.input_modalities
      .map(
        (x) =>
          ({
            text: "Text",
            image: "Image",
            audio: "Audio",
            video: "Video",
            file: "File",
          })[x],
      )
      .filter(Boolean);
    if (!inputs.length) return [];
    const tiered =
      Boolean(m.pricing.overrides?.length) ||
      Number(m.pricing.request || 0) > 0;
    const brand = m.name.includes(":")
      ? m.name.split(":")[0]
      : m.id.split("/")[0];
    return [
      {
        id: `router/${m.id}`,
        name: m.name.replace(/^[^:]+: /, "") + " (OpenRouter)",
        provider: brand,
        inputPrice: input * 1e6,
        outputPrice: output * 1e6,
        context: m.context_length,
        contextKind: "Router context",
        maxOutput: m.top_provider?.max_completion_tokens || null,
        inputs,
        docs: `https://openrouter.ai/${m.id}`,
        pricing: `https://openrouter.ai/${m.id}`,
        checked: now.toISOString().slice(0, 10),
        listedAt: created.toISOString().slice(0, 10),
        estimateSupported: !tiered,
        route: "OpenRouter",
        note: tiered
          ? "Starting router rates. Tiered or per-request pricing applies; use the source pricing for a quote. Calculator excluded."
          : "OpenRouter listing rates, not a direct-provider quote. Routing, endpoint and additional charges can change the final price.",
      },
    ];
  });
  return validateModels(result);
}
export function parseTrending(raw, now) {
  if (!Array.isArray(raw)) throw new Error("Invalid trends");
  const rows = raw
    .filter(
      (m) =>
        typeof m.id === "string" &&
        /^[\w.-]+\/[\w.-]+$/.test(m.id) &&
        [m.likes, m.downloads, m.trendingScore].every(
          (n) => Number.isFinite(n) && n >= 0,
        ),
    )
    .map((m) => ({
      id: m.id,
      url: `https://huggingface.co/${m.id}`,
      likes: m.likes,
      downloads: m.downloads,
      score: m.trendingScore,
      fetched: now.toISOString(),
    }));
  if (!rows.length) throw new Error("Empty trends");
  return rows.slice(0, 8);
}
export function mergeSource(snapshot, source, items, error, now) {
  const previous = snapshot.sources.find((s) => s.id === source.id);
  if (!error) {
    snapshot[source.kind] = ["news", "videos"].includes(source.kind)
      ? [
          ...snapshot[source.kind].filter((i) => i.source !== source.name),
          ...items,
        ]
      : items;
  }
  const count = ["news", "videos"].includes(source.kind)
    ? snapshot[source.kind].filter((i) => i.source === source.name).length
    : snapshot[source.kind].length;
  const state = {
    id: source.id,
    name: source.name,
    kind: source.kind,
    url: source.url,
    checkedAt: error ? previous?.checkedAt || null : now.toISOString(),
    status: error ? (count ? "stale" : "unavailable") : "ok",
    count,
  };
  snapshot.sources = [
    ...snapshot.sources.filter((s) => s.id !== source.id),
    state,
  ];
  return snapshot;
}
