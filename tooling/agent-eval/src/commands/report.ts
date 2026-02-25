/**
 * Report command implementation.
 *
 * @since 0.0.0
 * @module
 */

import type { FileSystem, Path } from "effect";
import { Effect } from "effect";
import { renderBenchmarkMarkdown } from "../benchmark/report.js";
import { writeFileUtf8 } from "../io.js";
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
export const handleReport: (args: ReportArgs) => Effect.Effect<void, unknown, FileSystem.FileSystem | Path.Path> =
  Effect.fn(function* (args) {
    const suite = yield* readSuiteFile(args.input);
    const markdown = renderBenchmarkMarkdown(suite, args.title);
    yield* writeFileUtf8(args.output, markdown);
  });
