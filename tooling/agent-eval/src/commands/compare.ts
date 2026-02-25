/**
 * Compare command implementation.
 *
 * @since 0.0.0
 * @module
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { renderComparisonMarkdown } from "../benchmark/compare.js";
import { readSuiteFile } from "./bench.js";

/**
 * Compare command arguments.
 *
 * @since 0.0.0
 * @category models
 */
export interface CompareArgs {
  readonly baseline: string;
  readonly candidate: string;
  readonly output: string;
  readonly title: string;
}

/**
 * Render and persist benchmark comparison markdown.
 *
 * @since 0.0.0
 * @category commands
 */
export const handleCompare = async (args: CompareArgs): Promise<void> => {
  const baseline = await readSuiteFile(args.baseline);
  const candidate = await readSuiteFile(args.candidate);

  const markdown = renderComparisonMarkdown(baseline, candidate, args.title);
  const outputPath = path.resolve(args.output);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, markdown, "utf8");
};
