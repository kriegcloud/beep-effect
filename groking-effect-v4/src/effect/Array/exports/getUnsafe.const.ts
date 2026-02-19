/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: getUnsafe
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.359Z
 *
 * Overview:
 * Reads an element at the given index, throwing if the index is out of bounds.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.getUnsafe([1, 2, 3], 1)) // 2
 * // Array.getUnsafe([1, 2, 3], 10) // throws Error
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { attemptThunk, createPlaygroundProgram, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "getUnsafe";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Reads an element at the given index, throwing if the index is out of bounds.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.getUnsafe([1, 2, 3], 1)) // 2\n// Array.getUnsafe([1, 2, 3], 10) // throws Error';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const formatThrown = (error: unknown): string =>
  error instanceof Error ? `${error.name}: ${error.message}` : String(error);

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const hit = A.getUnsafe([1, 2, 3], 1);
  const miss = yield* attemptThunk(() => A.getUnsafe([1, 2, 3], 10));

  yield* Console.log(`A.getUnsafe([1, 2, 3], 1) => ${hit}`);
  if (miss._tag === "Left") {
    yield* Console.log(`A.getUnsafe([1, 2, 3], 10) threw ${formatThrown(miss.error)}`);
  } else {
    yield* Console.log("A.getUnsafe([1, 2, 3], 10) unexpectedly succeeded.");
  }
});

const exampleDataLastAndFlooring = Effect.gen(function* () {
  const getAtOnePointNine = A.getUnsafe(1.9);
  const hit = getAtOnePointNine(["kick", "snare", "hat"]);
  const miss = yield* attemptThunk(() => A.getUnsafe(-0.2)(["kick", "snare", "hat"]));

  yield* Console.log(`A.getUnsafe(1.9)(["kick", "snare", "hat"]) => ${hit}`);
  if (miss._tag === "Left") {
    yield* Console.log(`A.getUnsafe(-0.2)(["kick", "snare", "hat"]) threw ${formatThrown(miss.error)}`);
  } else {
    yield* Console.log("A.getUnsafe(-0.2)(...) unexpectedly succeeded.");
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
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Source-Aligned Unsafe Lookup",
      description: "Mirror the docs: read an in-range index and capture the out-of-range throw.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Data-Last + Floored Index",
      description: "Use curried form and show that non-integer indexes are floored before bounds checks.",
      run: exampleDataLastAndFlooring,
    },
  ],
});

BunRuntime.runMain(program);
