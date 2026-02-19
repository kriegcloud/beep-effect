/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: match
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.362Z
 *
 * Overview:
 * Pattern-matches on an array, handling empty and non-empty cases separately.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * const describe = Array.match({
 *   onEmpty: () => "empty",
 *   onNonEmpty: ([head, ...tail]) => `head: ${head}, tail: ${tail.length}`
 * })
 * console.log(describe([])) // "empty"
 * console.log(describe([1, 2, 3])) // "head: 1, tail: 2"
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
const exportName = "match";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Pattern-matches on an array, handling empty and non-empty cases separately.";
const sourceExample =
  'import { Array } from "effect"\n\nconst describe = Array.match({\n  onEmpty: () => "empty",\n  onNonEmpty: ([head, ...tail]) => `head: ${head}, tail: ${tail.length}`\n})\nconsole.log(describe([])) // "empty"\nconsole.log(describe([1, 2, 3])) // "head: 1, tail: 2"';

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const describe = A.match({
    onEmpty: () => "empty",
    onNonEmpty: (values) => `head: ${values[0]}, tail: ${values.length - 1}`,
  });

  yield* Console.log(`describe([]) => ${describe([])}`);
  yield* Console.log(`describe([1, 2, 3]) => ${describe([1, 2, 3])}`);
});

const exampleQueueSummary = Effect.gen(function* () {
  const summarizeQueue = A.match({
    onEmpty: () => "queue is idle",
    onNonEmpty: ([next, ...backlog]) => `next: ${next}; backlog: ${backlog.length}`,
  });

  const queues: ReadonlyArray<ReadonlyArray<string>> = [[], ["ship-release"], ["ingest", "transform", "index"]];
  for (const queue of queues) {
    yield* Console.log(`${JSON.stringify(queue)} => ${summarizeQueue(queue)}`);
  }
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
      title: "Source-Aligned Invocation",
      description: "Recreate the documented empty and non-empty branch behavior.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Queue Branching",
      description: "Use match to branch UI copy between idle and non-empty task queues.",
      run: exampleQueueSummary,
    },
  ],
});

BunRuntime.runMain(program);
