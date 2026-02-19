/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: NonEmptyArray
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.362Z
 *
 * Overview:
 * A mutable array guaranteed to have at least one element.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Array } from "effect"
 *
 * const nonEmpty: Array.NonEmptyArray<number> = [1, 2, 3]
 * nonEmpty.push(4)
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "NonEmptyArray";
const exportKind = "type";
const moduleImportPath = "effect/Array";
const sourceSummary = "A mutable array guaranteed to have at least one element.";
const sourceExample =
  'import type { Array } from "effect"\n\nconst nonEmpty: Array.NonEmptyArray<number> = [1, 2, 3]\nnonEmpty.push(4)';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Bridge note: NonEmptyArray is erased at runtime; companion Array APIs show the behavior.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleCompanionConstructionAndMutation = Effect.gen(function* () {
  const nonEmpty = A.make(1, 2, 3);
  yield* Console.log(`Array.make(1, 2, 3) -> ${JSON.stringify(nonEmpty)}`);

  nonEmpty.push(4);
  yield* Console.log(`push(4) on mutable array -> ${JSON.stringify(nonEmpty)}`);

  const withAppended = A.append(nonEmpty, 5);
  yield* Console.log(`Array.append(current, 5) -> ${JSON.stringify(withAppended)}`);
});

const exampleCompanionGuardFlow = Effect.gen(function* () {
  yield* Console.log("Runtime companion context: inspect Array.isArrayNonEmpty.");
  yield* inspectNamedExport({ moduleRecord, exportName: "isArrayNonEmpty" });

  const maybeNonEmpty: Array<number> = [10, 20];
  if (A.isArrayNonEmpty(maybeNonEmpty)) {
    const head = maybeNonEmpty[0];
    maybeNonEmpty.push(head + 100);
    yield* Console.log(`Guard passed; head=${head}, after push -> ${JSON.stringify(maybeNonEmpty)}`);
  } else {
    yield* Console.log("Guard failed; no head access performed.");
  }
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Companion Construction + Mutation",
      description: "Use Array.make and mutable operations that align with NonEmptyArray semantics.",
      run: exampleCompanionConstructionAndMutation,
    },
    {
      title: "Companion Guard Flow",
      description: "Use Array.isArrayNonEmpty to safely access head and mutate a mutable array.",
      run: exampleCompanionGuardFlow,
    },
  ],
});

BunRuntime.runMain(program);
