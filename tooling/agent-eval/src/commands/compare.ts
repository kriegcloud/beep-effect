/**
 * Compare command implementation.
 *
 * @since 0.0.0
 * @module
 */

import type { FileSystem, Path } from "effect";
import { Effect } from "effect";
import { renderComparisonMarkdown } from "../benchmark/compare.js";
import { writeFileUtf8 } from "../io.js";
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
export const handleCompare: (args: CompareArgs) => Effect.Effect<void, unknown, FileSystem.FileSystem | Path.Path> =
  Effect.fn(function* (args) {
    const baseline = yield* readSuiteFile(args.baseline);
    const candidate = yield* readSuiteFile(args.candidate);

    const markdown = renderComparisonMarkdown(baseline, candidate, args.title);
    yield* writeFileUtf8(args.output, markdown);
  });
