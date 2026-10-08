# Editorial workflow

The launch collection is a manually curated snapshot, checked against linked primary sources on 8 October 2026. The collection currently leans heavily on developer tooling and GitHub announcements; expand source diversity deliberately. There are no reviewed hardware stories yet.

1. Suggest a primary-source link through Discussions or a pull request.
2. Check the source URL, publication date, actual release status and claims.
3. Write a short original summary and a separate practical interpretation under `why`.
4. Preserve `collectedAt` as the date of checking; do not rewrite it on each build.
5. Add to `src/data/stories.json`, using the existing schema. Include useful takeaways, no copied article body.
6. Run npm test and npm run build. Review the rendered story and original source.
7. Merge only after editorial approval. GitHub Actions publishes the approved collection.

No automated publication, scraping service or LLM is needed. An automated candidate collector is a future addition and must not directly publish. A refresh in the UI reloads the deployed collection, not third-party news services.

AI-assisted drafting was used for this initial collection, checked against original publisher pages by the building assistant. It has not undergone an independent human editorial review. Visitors are directed to the original source and can submit corrections.
