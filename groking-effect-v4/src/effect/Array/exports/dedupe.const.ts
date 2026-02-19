/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: dedupe
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.347Z
 *
 * Overview:
 * Removes duplicates using `Equal.equivalence()`, preserving the order of the first occurrence.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.dedupe([1, 2, 1, 3, 2, 4])) // [1, 2, 3, 4]
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "dedupe";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Removes duplicates using `Equal.equivalence()`, preserving the order of the first occurrence.";
const sourceExample = 'import { Array } from "effect"\n\nconsole.log(Array.dedupe([1, 2, 1, 3, 2, 4])) // [1, 2, 3, 4]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime shape and verify that dedupe expects an iterable input.");
  yield* inspectNamedExport({ moduleRecord, exportName });
  const dedupeValue = moduleRecord[exportName];
  if (typeof dedupeValue === "function") {
    yield* Console.log(`function.length hint -> ${dedupeValue.length}`);
  }
});

const exampleSourceAlignedDedupe = Effect.gen(function* () {
  const input = [1, 2, 1, 3, 2, 4];
  const deduped = A.dedupe(input);

  yield* Console.log(`dedupe([1, 2, 1, 3, 2, 4]) -> [${deduped.join(", ")}]`);
  yield* Console.log(`input preserved -> [${input.join(", ")}]`);
});

const exampleStructuralEqualityAndOrder = Effect.gen(function* () {
  const readings = [
    { sensorId: 1, status: "ok" },
    { sensorId: 1, status: "ok" },
    { sensorId: 2, status: "warn" },
    { sensorId: 1, status: "ok" },
    { sensorId: 3, status: "ok" },
  ] as const;
  const deduped = A.dedupe(readings);

  yield* Console.log(
    `dedupe(structural objects) -> [${deduped.map((reading) => `${reading.sensorId}:${reading.status}`).join(", ")}]`
  );
  yield* Console.log(`first matching object retained -> ${deduped[0] === readings[0]}`);
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
      description: "Inspect module export count, runtime type, and callable arity hint.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Source-Aligned Duplicate Removal",
      description: "Run the JSDoc input and show duplicates removed while first occurrence order is preserved.",
      run: exampleSourceAlignedDedupe,
    },
    {
      title: "Structural Equality + First Occurrence",
      description: "Show that structurally equal objects are deduped and the earliest matching object is retained.",
      run: exampleStructuralEqualityAndOrder,
    },
  ],
});

BunRuntime.runMain(program);
