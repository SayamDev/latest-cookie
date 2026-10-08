# Daily discovery runs in the publication build

Accepted 2026-10-08. The user explicitly requested expanded models, popular technology news/video and daily updates, superseding the initial manual-only publication scope.

Use a scheduled GitHub Actions build at 06:17 UTC and manual dispatch. The updater uses public feeds/APIs without credentials, validates and normalizes them, then the existing build deploys the static result. Read the prior deployed snapshot for last-good fallback. Do not mutate the repository on every schedule tick or require a desktop agent to be awake. All-source failure stops deployment; partial failures publish healthy updates and visible stale-source metadata. Empty/invalid upstream data does not erase prior data. Date pruning applies regardless of source success.

Publisher feed metadata is kept separate from authored summaries; no automatic AI-generated summaries or implied editorial review. Titles link directly to their source. YouTube thumbnails are requested from its image service; play links open YouTube. Views rank only selected recent uploads, never global personalized trending. Topics use deterministic title/channel rules. Hugging Face provides a similarly scoped popularity signal for model discovery.

OpenRouter listings supplement direct-provider references and identify the pricing route. Retain only public factual metadata, not benchmark datasets or descriptions. Tiered prices are marked starting rates and excluded from simple workload estimates. Groq's speed snapshot carries source/date/caveats. A comprehensive comparable benchmark service would require a separate measured or appropriately licensed dataset.
