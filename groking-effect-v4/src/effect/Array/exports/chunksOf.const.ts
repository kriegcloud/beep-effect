/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: chunksOf
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.347Z
 *
 * Overview:
 * Splits an iterable into chunks of length `n`. The last chunk may be shorter if `n` does not evenly divide the length.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.chunksOf([1, 2, 3, 4, 5], 2)) // [[1, 2], [3, 4], [5]]
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "chunksOf";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Splits an iterable into chunks of length `n`. The last chunk may be shorter if `n` does not evenly divide the length.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.chunksOf([1, 2, 3, 4, 5], 2)) // [[1, 2], [3, 4], [5]]';

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSourceAlignedChunking = Effect.gen(function* () {
  const readings = [72, 74, 71, 69, 68];
  const batches = A.chunksOf(readings, 2);
  const batchSizes = batches.map((batch) => batch.length);

  yield* Console.log(`chunksOf([72, 74, 71, 69, 68], 2) -> ${JSON.stringify(batches)}`);
  yield* Console.log(`chunk sizes -> [${batchSizes.join(", ")}]`);
});

const exampleCurriedChunkingAndEmptyInput = Effect.gen(function* () {
  const chunkByThree = A.chunksOf(3);
  const queuedJobs = chunkByThree(new Set(["ingest", "normalize", "validate", "publish"]));
  const noJobs = chunkByThree([] as ReadonlyArray<string>);

  yield* Console.log(`chunksOf(3)(Set jobs) -> ${JSON.stringify(queuedJobs)}`);
  yield* Console.log(`chunksOf(3)([]) -> ${JSON.stringify(noJobs)}`);
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🔎",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Source-Aligned Chunking",
      description: "Use the same call shape as the source example and inspect resulting chunk sizes.",
      run: exampleSourceAlignedChunking,
    },
    {
      title: "Curried Chunking And Empty Input",
      description: "Use the curried form with a Set and confirm empty input returns an empty array.",
      run: exampleCurriedChunkingAndEmptyInput,
    },
  ],
});

BunRuntime.runMain(program);
