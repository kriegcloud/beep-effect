/**
 * Report command implementation.
 *
 * @since 0.0.0
 * @module
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { renderBenchmarkMarkdown } from "../benchmark/report.js";
import { readSuiteFile } from "./bench.js";

/**
 * Report command arguments.
 *
 * @since 0.0.0
 * @category models
 */
export interface ReportArgs {
  readonly input: string;
  readonly output: string;
  readonly title: string;
}

/**
 * Render and persist benchmark markdown report.
 *
 * @since 0.0.0
 * @category commands
 */
export const handleReport = async (args: ReportArgs): Promise<void> => {
  const suite = await readSuiteFile(args.input);
  const markdown = renderBenchmarkMarkdown(suite, args.title);
  const outputPath = path.resolve(args.output);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, markdown, "utf8");
};
