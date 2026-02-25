/**
 * Benchmark task catalog loading and strict count enforcement.
 *
 * @since 0.0.0
 * @module
 */

import { readFile } from "node:fs/promises";
import { readdir } from "node:fs/promises";
import path from "node:path";
import * as S from "effect/Schema";
import { AgentTaskSpecSchema, type AgentTaskSpec } from "../schemas/index.js";

const decodeTask = S.decodeUnknownSync(S.fromJsonString(AgentTaskSpecSchema));

/**
 * Load task catalog from JSON files and enforce strict task count.
 *
 * @since 0.0.0
 * @category functions
 */
export const loadTaskCatalog = async (directory: string, strictCount: number): Promise<ReadonlyArray<AgentTaskSpec>> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  const tasks: Array<AgentTaskSpec> = [];
  for (const fileName of files) {
    const filePath = path.join(directory, fileName);
    const content = await readFile(filePath, "utf8");
    tasks.push(decodeTask(content));
  }

  if (tasks.length !== strictCount) {
    throw new Error(`Task count mismatch: expected ${strictCount}, got ${tasks.length}`);
  }

  return tasks;
};
