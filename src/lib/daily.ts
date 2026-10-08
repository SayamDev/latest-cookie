import { z } from "zod";
import { modelSchema } from "./models.ts";
const https = z.url().startsWith("https://");
const item = z.object({
  id: z.string(),
  title: z.string().min(1).max(300),
  url: https,
  source: z.string(),
  published: z.iso.datetime(),
  fetched: z.iso.datetime(),
});
export const dailySchema = z.object({
  attemptedAt: z.iso.datetime(),
  sources: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      kind: z.enum(["news", "videos", "models", "trending"]),
      url: https,
      checkedAt: z.iso.datetime().nullable(),
      status: z.enum(["ok", "stale", "unavailable"]),
      count: z.number().int().nonnegative(),
    }),
  ),
  news: z.array(item),
  videos: z.array(
    item.extend({
      videoId: z.string().regex(/^[\w-]{11}$/),
      views: z.number().int().nonnegative().nullable(),
    }),
  ),
  models: z.array(modelSchema),
  trending: z.array(
    z.object({
      id: z.string(),
      url: https,
      likes: z.number().int().nonnegative(),
      downloads: z.number().int().nonnegative(),
      score: z.number().nonnegative(),
      fetched: z.iso.datetime(),
    }),
  ),
});
export type Daily = z.infer<typeof dailySchema>;
export const validateDaily = (raw: unknown) => dailySchema.parse(raw);

export const videoTopics = [
  "AI",
  "Coding",
  "Gadgets",
  "Computer science",
] as const;
export function videoTopic(item: {
  title: string;
  source: string;
}): (typeof videoTopics)[number] {
  if (
    /\b(ai|llm|gpt|claude|gemini|neural|machine learning|artificial intelligence|deepseek|openai)\b/i.test(
      item.title,
    ) ||
    item.source === "Two Minute Papers"
  )
    return "AI";
  if (
    item.source === "Fireship" ||
    /\b(code|coding|javascript|python|programming)\b/i.test(item.title)
  )
    return "Coding";
  return item.source === "Marques Brownlee" ? "Gadgets" : "Computer science";
}
