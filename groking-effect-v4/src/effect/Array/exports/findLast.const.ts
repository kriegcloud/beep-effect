/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: findLast
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.349Z
 *
 * Overview:
 * Returns the last element matching a predicate, refinement, or mapping function, wrapped in `Option`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.findLast([1, 2, 3, 4, 5], (n) => n % 2 === 0)) // Option.some(4)
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
const exportName = "findLast";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Returns the last element matching a predicate, refinement, or mapping function, wrapped in `Option`.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.findLast([1, 2, 3, 4, 5], (n) => n % 2 === 0)) // Option.some(4)';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const formatOption = <A>(option: O.Option<A>): string =>
  O.isSome(option) ? `Option.some(${formatUnknown(option.value)})` : "Option.none()";

const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedPredicate = Effect.gen(function* () {
  const result = A.findLast([1, 2, 3, 4, 5], (n) => n % 2 === 0);
  yield* Console.log(`A.findLast([1, 2, 3, 4, 5], n % 2 === 0) => ${formatOption(result)}`);
});

const exampleOptionMapping = Effect.gen(function* () {
  const jobs = [
    { id: "job-a", needsRetry: false, attempt: 1 },
    { id: "job-b", needsRetry: true, attempt: 2 },
    { id: "job-c", needsRetry: false, attempt: 1 },
    { id: "job-d", needsRetry: true, attempt: 3 },
  ];

  const lastRetryWithIndex = A.findLast(jobs, (job, index) =>
    job.needsRetry ? O.some(`${job.id}@${index}`) : O.none()
  );

  const noHighAttemptRetry = A.findLast(jobs, (job) => (job.needsRetry && job.attempt > 4 ? O.some(job.id) : O.none()));

  yield* Console.log(`Mapping overload (last retry job) => ${formatOption(lastRetryWithIndex)}`);
  yield* Console.log(`Mapping overload (attempt > 4) => ${formatOption(noHighAttemptRetry)}`);
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
      title: "Source-Aligned Predicate Search",
      description: "Mirror the JSDoc behavior and return the last even value.",
      run: exampleSourceAlignedPredicate,
    },
    {
      title: "Option-Mapping Overload",
      description: "Find the last matching value while mapping to a derived payload.",
      run: exampleOptionMapping,
    },
  ],
});

BunRuntime.runMain(program);
