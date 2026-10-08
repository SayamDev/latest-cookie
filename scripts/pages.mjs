import { readFile, writeFile, mkdir } from "node:fs/promises";
const stories = JSON.parse(await readFile("src/data/stories.json", "utf8"));
const securityPolicy =
  "<meta\n      http-equiv=\"Content-Security-Policy\"\n      content=\"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https://i.ytimg.com; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests\"\n    />";
const template = (await readFile("dist/index.html", "utf8")).replace(
  '<meta charset="UTF-8" />',
  '<meta charset="UTF-8" />' + securityPolicy,
);
await writeFile("dist/index.html", template);
const origin = (
  process.env.SITE_URL || "https://sayamdev.github.io/latest-cookie"
).replace(/\/$/, "");
const escape = (s) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const routes = [
  "news",
  "watch",
  "models",
  "saved",
  "briefings",
  "community",
  "about",
  ...stories.map((s) => "stories/" + s.slug),
];
for (const route of routes) {
  const story = stories.find((s) => route === "stories/" + s.slug);
  let html = template.replace(
    "<title>Latest Cookie</title>",
    `<title>${escape(story?.title || (route === "models" ? "Model Lab" : route.charAt(0).toUpperCase() + route.slice(1)))} · Latest Cookie</title>`,
  );
  const title =
    story?.title ||
    (route === "models" ? "Model Lab · Latest Cookie" : "Latest Cookie");
  const description =
    story?.summary ||
    "Independent technology news, useful context, and a place for curious people.";
  html = html.replace(
    "</head>",
    `<link rel="canonical" href="${origin}/${route}/"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"></head>`,
  );
  if (story)
    html = html.replace(
      '<div id="root"></div>',
      `<div id="root"><article><h1>${escape(story.title)}</h1><p>${escape(story.summary)}</p><p>${escape(story.why)}</p><a href="${escape(story.url)}">Read original at ${escape(story.source)}</a></article></div>`,
    );
  await mkdir("dist/" + route, { recursive: true });
  await writeFile("dist/" + route + "/index.html", html);
}
await writeFile("dist/404.html", template);
await writeFile(
  "dist/daily.json",
  await readFile("src/data/daily.json", "utf8"),
);
await writeFile("dist/stories.json", JSON.stringify(stories));
await writeFile(
  "dist/feed.xml",
  `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Latest Cookie</title><link>${origin}/</link><description>Useful tech, straight from the source.</description>${stories.map((s) => `<item><title>${escape(s.title)}</title><link>${origin}/stories/${s.slug}/</link><guid>${origin}/stories/${s.slug}/</guid><description>${escape(s.summary)}</description><pubDate>${new Date(s.publishedAt + "T12:00:00Z").toUTCString()}</pubDate></item>`).join("")}</channel></rss>`,
);
await writeFile(
  "dist/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${["", ...routes].map((r) => `<url><loc>${origin}/${r ? r + "/" : ""}</loc></url>`).join("")}</urlset>`,
);
await writeFile(
  "dist/robots.txt",
  `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`,
);
await writeFile("dist/.nojekyll", "");

await writeFile(
  "dist/benchmarks.json",
  await readFile("src/data/benchmarks.json", "utf8"),
);
