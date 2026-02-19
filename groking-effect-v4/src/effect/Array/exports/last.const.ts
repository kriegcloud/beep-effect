/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: last
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.361Z
 *
 * Overview:
 * Returns the last element of an array wrapped in `Option.some`, or `Option.none` if the array is empty.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.last([1, 2, 3])) // Some(3)
 * console.log(Array.last([])) // None
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, formatUnknown, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "last";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Returns the last element of an array wrapped in `Option.some`, or `Option.none` if the array is empty.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.last([1, 2, 3])) // Some(3)\nconsole.log(Array.last([])) // None';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const formatOption = <A>(option: O.Option<A>): string =>
  O.isSome(option) ? `Option.some(${formatUnknown(option.value)})` : "Option.none()";

const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime shape and preview for Array.last.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const nonEmpty = A.last([1, 2, 3]);
  const empty = A.last<number>([]);

  yield* Console.log(`A.last([1, 2, 3]) => ${formatOption(nonEmpty)}`);
  yield* Console.log(`A.last([]) => ${formatOption(empty)}`);
});

const exampleLastTaskInQueue = Effect.gen(function* () {
  const queue = [
    { id: "task-1", status: "done", retries: 0 },
    { id: "task-2", status: "retry", retries: 1 },
    { id: "task-3", status: "queued", retries: 0 },
  ];

  const lastTask = A.last(queue);
  const summary = O.isSome(lastTask)
    ? `${lastTask.value.id} (${lastTask.value.status}, retries=${lastTask.value.retries})`
    : "no task";

  yield* Console.log(`A.last(queue) => ${formatOption(lastTask)}`);
  yield* Console.log(`Operational summary => ${summary}`);
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
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Source-Aligned Invocation",
      description: "Run the documented non-empty and empty-array calls.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Queue Tail Access",
      description: "Read the latest queued task and derive a concise status summary.",
      run: exampleLastTaskInQueue,
    },
  ],
});

BunRuntime.runMain(program);
