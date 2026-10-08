import { z } from "zod";
export const topics = [
  "All",
  "AI & ML",
  "Web Development",
  "Open Source",
  "Security",
  "Hardware",
  "Developer Tools",
] as const;
export const StorySchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  summary: z.string().min(1),
  why: z.string().min(1),
  topic: z.enum(topics.slice(1) as [string, ...string[]]),
  source: z.string().min(1),
  url: z.url().refine((x) => x.startsWith("https://")),
  publishedAt: z.iso.date(),
  collectedAt: z.iso.date(),
  reviewStatus: z.literal("source-checked"),
  takeaways: z.array(z.string()).min(1),
  art: z.string(),
});
export type Story = z.infer<typeof StorySchema>;
export function validateStories(input: unknown): Story[] {
  const stories = z.array(StorySchema).min(1).parse(input);
  const ids = new Set<string>();
  const urls = new Set<string>();
  const slugs = new Set<string>();
  for (const s of stories) {
    if (ids.has(s.id) || urls.has(s.url) || slugs.has(s.slug))
      throw new Error("Duplicate story");
    if (s.publishedAt > s.collectedAt)
      throw new Error("Publication date is after collection");
    ids.add(s.id);
    urls.add(s.url);
    slugs.add(s.slug);
  }
  return stories.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
export function filterStories(
  stories: Story[],
  query: string,
  topic: string,
  saved?: string[],
) {
  const q = query.trim().toLowerCase();
  return stories.filter(
    (s) =>
      (topic === "All" || s.topic === topic) &&
      (!saved || saved.includes(s.id)) &&
      `${s.title} ${s.summary} ${s.topic} ${s.source}`
        .toLowerCase()
        .includes(q),
  );
}
export function readSaved(raw: string | null): string[] {
  try {
    const value = JSON.parse(raw || "[]");
    return Array.isArray(value)
      ? value.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}
