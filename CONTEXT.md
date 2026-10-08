# Domain context

A story is an original short summary linked to a primary source. Publication date belongs to that source; collection date records when Latest Cookie checked it. These editorial summaries remain separate from imported publisher headlines. A briefing is a curated group of stories. Bookmarks belong to the browser. Community conversations live on GitHub Discussions.

Daily data lives in src/data/daily.json. The scheduled Pages build fetches publisher RSS/Atom metadata, selected YouTube channel feeds, OpenRouter model listings and Hugging Face trends. Feed items are not independently fact-checked. Only headlines, links, timestamps and video counters are retained; never article bodies or video descriptions. Feed health records attempt time separately from each source's last successful fetch. Failed sources retain last-good data, pruned to 30 days for news/video. All-source failure blocks deploy.

Model Lab combines direct-provider references in src/data/models.json with daily router listings. An entry records developer, pricing route, standard text rates, context semantics, nullable output limit and source time. Router prices are starting rates; tiered or per-request pricing disables calculator estimates. Newly listed uses the router creation timestamp, not release date. Hugging Face trending order is a platform-specific popularity signal. Groq speeds are dated provider-reported figures, not measured here or a global fastest ranking.

Video topics use transparent title/channel rules, not a personalized YouTube feed. Most viewed ranks lifetime counters among the selected channels' recent uploads and selected time window. Unknown counters remain unknown. Thumbnails load from YouTube; playback opens YouTube. No embedded player or analytics.
