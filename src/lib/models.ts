import { z } from "zod";
export const modelSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9._:/-]+$/),
  name: z.string().min(1),
  provider: z.string().min(1),
  inputPrice: z.number().nonnegative(),
  outputPrice: z.number().nonnegative(),
  context: z.number().int().positive(),
  contextKind: z.enum(["Shared context", "Input limit", "Router context"]),
  maxOutput: z.number().int().positive().nullable(),
  listedAt: z.iso.date().optional(),
  estimateSupported: z.boolean().default(true),
  route: z.enum(["Direct", "OpenRouter"]).default("Direct"),
  inputs: z
    .array(z.enum(["Text", "Image", "Audio", "Video", "File"]))
    .nonempty(),
  docs: z.url().startsWith("https://"),
  pricing: z.url().startsWith("https://"),
  checked: z.iso.date(),
  note: z.string().min(1),
});
export type Model = z.infer<typeof modelSchema>;
export function validateModels(raw: unknown): Model[] {
  const models = z.array(modelSchema).min(1).parse(raw);
  if (new Set(models.map((m) => m.id)).size !== models.length)
    throw new Error("Duplicate model ID");
  return models;
}
export type Sort = "input" | "output" | "name" | "context" | "newest";
export function findModels(
  models: Model[],
  query: string,
  provider: string,
  input: string,
  sort: Sort,
) {
  return models
    .filter(
      (m) =>
        `${m.name} ${m.provider} ${m.id}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()) &&
        (provider === "All" || m.provider === provider) &&
        (input === "All" ||
          m.inputs.includes(input as Model["inputs"][number])),
    )
    .sort(
      (a, b) =>
        (sort === "newest"
          ? (b.listedAt || "").localeCompare(a.listedAt || "")
          : sort === "name"
            ? a.name.localeCompare(b.name)
            : sort === "context"
              ? b.context - a.context
              : sort === "input"
                ? a.inputPrice - b.inputPrice
                : a.outputPrice - b.outputPrice) ||
        a.name.localeCompare(b.name),
    );
}
// Aggregate text token volume; not a single request or an allowance.
export function estimateCost(
  model: Pick<Model, "inputPrice" | "outputPrice">,
  input: number,
  output: number,
) {
  if (![input, output].every((n) => Number.isFinite(n) && n >= 0))
    throw new Error("Invalid token volume");
  return (model.inputPrice * input + model.outputPrice * output) / 1_000_000;
}
export function parseSelection(value: string | null, models: Model[]) {
  return [...new Set((value || "").split(","))]
    .filter((id) => models.some((m) => m.id === id))
    .slice(0, 3);
}
