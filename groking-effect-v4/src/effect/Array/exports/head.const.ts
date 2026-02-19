/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: head
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.360Z
 *
 * Overview:
 * Returns the first element of an array wrapped in `Option.some`, or `Option.none` if the array is empty.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.head([1, 2, 3])) // Some(1)
 * console.log(Array.head([])) // None
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
const exportName = "head";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Returns the first element of an array wrapped in `Option.some`, or `Option.none` if the array is empty.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.head([1, 2, 3])) // Some(1)\nconsole.log(Array.head([])) // None';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const formatOption = <T>(option: O.Option<T>): string =>
  O.isSome(option) ? `Option.some(${formatUnknown(option.value)})` : "Option.none()";

const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const first = A.head([1, 2, 3]);
  const empty = A.head([]);

  yield* Console.log(`A.head([1, 2, 3]) => ${formatOption(first)}`);
  yield* Console.log(`A.head([]) => ${formatOption(empty)}`);
});

const exampleOptionMapping = Effect.gen(function* () {
  const firstUppercase = O.map(A.head(["kick", "snare", "hat"]), (sample) => sample.toUpperCase());
  const emptyUppercase = O.map(A.head([] as ReadonlyArray<string>), (sample) => sample.toUpperCase());

  yield* Console.log(`O.map(A.head(["kick", "snare", "hat"]), toUpperCase) => ${formatOption(firstUppercase)}`);
  yield* Console.log(`O.map(A.head([]), toUpperCase) => ${formatOption(emptyUppercase)}`);
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
      title: "Source-Aligned Head Reads",
      description: "Mirror the JSDoc behavior for non-empty and empty arrays.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Option Mapping After Head",
      description: "Transform the first element when present and preserve none when empty.",
      run: exampleOptionMapping,
    },
  ],
});

BunRuntime.runMain(program);
