// Only trusted configured URLs enter the build fetcher. Bound redirects and
// response bytes before parsing, and never forward credentials to another host.
export async function fetchText(
  url,
  { headers = {}, maxBytes = 5_000_000, timeout = 25000, redirects = 3 } = {},
) {
  const initial = new URL(url);
  if (initial.protocol !== "https:" || initial.username || initial.password)
    throw new Error("HTTPS URL required");
  const signal = AbortSignal.timeout(timeout);
  let current = initial;
  for (let hop = 0; hop <= redirects; hop++) {
    const response = await fetch(current.href, {
      headers,
      signal,
      redirect: "manual",
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      await response.body?.cancel();
      const location = response.headers.get("location");
      if (!location) throw new Error("Missing redirect destination");
      const next = new URL(location, current);
      if (next.origin !== initial.origin || next.username || next.password)
        throw new Error("Cross-origin redirect rejected");
      current = next;
      continue;
    }
    if (!response.ok) {
      await response.body?.cancel();
      throw new Error(`HTTP ${response.status}`);
    }
    if (Number(response.headers.get("content-length")) > maxBytes) {
      await response.body?.cancel();
      throw new Error("Response too large");
    }
    if (!response.body) throw new Error("Empty response");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let bytes = 0,
      text = "";
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > maxBytes) {
          await reader.cancel();
          throw new Error("Response too large");
        }
        text += decoder.decode(value, { stream: true });
      }
      return text + decoder.decode();
    } finally {
      reader.releaseLock();
    }
  }
  throw new Error("Too many redirects");
}
