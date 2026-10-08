# Security review — 8 October 2026

Scope: Latest Cookie frontend, build-time feed/API ingestion, dependencies, reachable Git history, and GitHub Pages deployment. This is a bounded source and configuration review, not an exhaustive penetration test or a guarantee against vulnerabilities.

## Trust boundaries

- Public RSS/Atom, OpenRouter, Hugging Face and optional Artificial Analysis responses enter a scheduled Node build. Treat every value as untrusted.
- The browser receives validated static snapshots, URL filters and localStorage preferences. It does not receive service credentials.
- GitHub Actions can publish the static site. Only the deployment job receives Pages and OIDC write permissions.
- There is no public application backend, database, authentication, file-upload or payment endpoint. Server-session, SQL and tenant-isolation controls are not applicable to this architecture.

## Findings addressed

| Finding | Change |
| --- | --- |
| Response size checked only after buffering, and benchmark responses were unbounded | Shared streaming fetcher enforces a 5 MB byte limit before parsing, plus timeouts and bounded redirects. |
| Fetch redirects could cross trust boundaries, including custom API-key headers | Only same-origin HTTPS redirects are allowed for feeds. Authenticated benchmark requests accept no redirects. |
| No browser Content Security Policy | Added a meta CSP: same-origin scripts, fonts and fetches; images restricted to same origin and YouTube thumbnails; plugins disabled; base and form destinations restricted. Moved theme startup to an external same-origin script. |
| Workflow actions referenced mutable version tags | Pinned the four actions to resolved commit SHAs and added job timeouts. |
| Dependency lifecycle scripts allowed by default | `.npmrc` disables them. The current build does not require any. |
| Malformed percent-encoding could crash route parsing | Removed unnecessary URI decoding for the app’s ASCII routes. |

The CSP permits inline styles because React artwork positions and charts use style attributes. It does **not** permit inline scripts or eval. The build injects this policy into every published HTML route. Development hot reload is unchanged; use `npm run build` and `npm run preview` to check the deployed policy.

## Checks and existing safeguards

- `npm audit`: **0 known advisories** on the review date (runtime and development dependencies).
- Heuristic high-confidence token/private-key pattern scan across reachable Git history: **0 matches**. This is not an exhaustive secret detector.
- No secret environment files or private keys tracked; `.env.example` contains configuration guidance only.
- No unsafe HTML rendering or executable dynamic code in application source. React escapes feed text; build-time HTML/XML generation escapes story fields.
- RSS parser rejects DTD/entity declarations, non-HTTPS or foreign publisher links, invalid video/channel IDs and future/invalid dates. Zod validates public snapshots and rejects malformed model values.
- Ingestion tests exercise malicious/foreign feed values, partial failures, invalid snapshots, oversized responses and cross-origin redirects. Failed benchmark refreshes retain the prior snapshot and date.
- No third-party analytics or embedded video player. External thumbnails omit referrer information.
- Browser tests cover real save/remove behaviour, guide dismissal, accessibility, themes, filters and comparisons. Verify CSP enforcement and browser console on the production build.

## Hosting limits and residual risks

GitHub Pages supplies HTTPS/HSTS; the live response was inspected. It serves public assets with `Access-Control-Allow-Origin: *`, which is appropriate for these non-sensitive public files and does not expose browser-local bookmarks.

The inspected response does not provide `X-Frame-Options`, a `frame-ancestors` policy, `Permissions-Policy` or `X-Content-Type-Options`. Repository HTML cannot add HTTP response headers. In particular, [frame-ancestors is not supported in meta CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors). If stronger embedding or browser-feature controls are needed, use a host or edge layer with configurable response headers. Do not claim the meta policy prevents framing.

All GitHub Pages projects under the same `sayamdev.github.io` origin share browser storage access. Bookmarks contain only public story IDs; do not store sensitive data or credentials here. A separate custom origin would isolate the app from other projects.

Publishers can change feeds or publish incorrect content. The app links to original sources and reports freshness; it does not independently verify imported news. Dependency advisories can change after this review. Benchmark auto-refresh remains unconfigured until an Actions secret is supplied.
