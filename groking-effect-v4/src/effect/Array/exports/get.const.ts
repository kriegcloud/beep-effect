/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: get
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.349Z
 *
 * Overview:
 * Safely reads an element at the given index, returning `Option.some` or `Option.none` if the index is out of bounds.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.get([1, 2, 3], 1)) // Some(2)
 * console.log(Array.get([1, 2, 3], 10)) // None
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
const exportName = "get";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Safely reads an element at the given index, returning `Option.some` or `Option.none` if the index is out of bounds.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.get([1, 2, 3], 1)) // Some(2)\nconsole.log(Array.get([1, 2, 3], 10)) // None';
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

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const hit = A.get([1, 2, 3], 1);
  const miss = A.get([1, 2, 3], 10);

  yield* Console.log(`A.get([1, 2, 3], 1) => ${formatOption(hit)}`);
  yield* Console.log(`A.get([1, 2, 3], 10) => ${formatOption(miss)}`);
});

const exampleCurriedIterableInvocation = Effect.gen(function* () {
  const getAtIndexOne = A.get(1);
  const fromArray = getAtIndexOne(["kick", "snare", "hat"]);
  const outOfRange = getAtIndexOne(["kick"]);

  yield* Console.log(`A.get(1)(["kick", "snare", "hat"]) => ${formatOption(fromArray)}`);
  yield* Console.log(`A.get(1)(["kick"]) => ${formatOption(outOfRange)}`);
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
      title: "Source-Aligned Index Lookup",
      description: "Mirror the JSDoc example and show both in-range and out-of-range reads.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Curried Data-Last Invocation",
      description: "Use data-last style and compare in-range vs out-of-range access.",
      run: exampleCurriedIterableInvocation,
    },
  ],
});

BunRuntime.runMain(program);
