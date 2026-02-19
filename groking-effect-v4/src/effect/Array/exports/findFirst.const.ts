/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: findFirst
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.348Z
 *
 * Overview:
 * Returns the first element matching a predicate, refinement, or mapping function, wrapped in `Option`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.findFirst([1, 2, 3, 4, 5], (x) => x > 3)) // Option.some(4)
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
const exportName = "findFirst";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Returns the first element matching a predicate, refinement, or mapping function, wrapped in `Option`.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.findFirst([1, 2, 3, 4, 5], (x) => x > 3)) // Option.some(4)';
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
  const result = A.findFirst([1, 2, 3, 4, 5], (x) => x > 3);
  yield* Console.log(`A.findFirst([1, 2, 3, 4, 5], x > 3) => ${formatOption(result)}`);
});

const exampleOptionMapping = Effect.gen(function* () {
  const samples = [
    { name: "edge-a", latencyMs: 110 },
    { name: "edge-b", latencyMs: 47 },
    { name: "edge-c", latencyMs: 62 },
  ];

  const firstFastEndpoint = A.findFirst(samples, (sample, index) =>
    sample.latencyMs < 50 ? O.some(`${sample.name}@${index}`) : O.none()
  );

  const noFastEndpoint = A.findFirst(samples, (sample) => (sample.latencyMs < 20 ? O.some(sample.name) : O.none()));

  yield* Console.log(`Mapping overload (first fast endpoint) => ${formatOption(firstFastEndpoint)}`);
  yield* Console.log(`Mapping overload (strict threshold) => ${formatOption(noFastEndpoint)}`);
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
      description: "Mirror the JSDoc example and return the first value above a threshold.",
      run: exampleSourceAlignedPredicate,
    },
    {
      title: "Option-Mapping Overload",
      description: "Use find-and-transform overload and show both some/none outcomes.",
      run: exampleOptionMapping,
    },
  ],
});

BunRuntime.runMain(program);
