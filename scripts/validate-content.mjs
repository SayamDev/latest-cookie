import { readFileSync } from "node:fs";
import { validateStories } from "../src/lib/content.ts";
const stories = validateStories(
  JSON.parse(readFileSync("src/data/stories.json", "utf8")),
);
console.log(`Validated ${stories.length} source-linked stories.`);

import { validateModels } from "../src/lib/models.ts";
const models = validateModels(
  JSON.parse(readFileSync("src/data/models.json", "utf8")),
);
console.log(`Validated ${models.length} source-linked models.`);
