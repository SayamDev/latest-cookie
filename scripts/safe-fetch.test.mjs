import { test } from "node:test";
import assert from "node:assert/strict";
import { fetchText } from "./safe-fetch.mjs";
test("build fetcher bounds bytes and refuses credential-bearing cross-origin redirects", async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response("123456", { status: 200 });
    await assert.rejects(
      fetchText("https://example.com", { maxBytes: 4 }),
      /too large/,
    );
    let calls = 0;
    globalThis.fetch = async () => {
      calls++;
      return new Response(null, {
        status: 302,
        headers: { location: "https://attacker.example" },
      });
    };
    await assert.rejects(
      fetchText("https://example.com", {
        headers: { "x-api-key": "test-only" },
      }),
      /Cross-origin/,
    );
    assert.equal(calls, 1);
    globalThis.fetch = async () => new Response("valid", { status: 200 });
    assert.equal(await fetchText("https://example.com"), "valid");
    await assert.rejects(fetchText("http://example.com"), /HTTPS/);
  } finally {
    globalThis.fetch = original;
  }
});
