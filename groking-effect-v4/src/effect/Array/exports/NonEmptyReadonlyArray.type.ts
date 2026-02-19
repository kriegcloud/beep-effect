/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: NonEmptyReadonlyArray
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.367Z
 *
 * Overview:
 * A readonly array guaranteed to have at least one element.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Array } from "effect"
 *
 * const nonEmpty: Array.NonEmptyReadonlyArray<number> = [1, 2, 3]
 * const head: number = nonEmpty[0] // guaranteed to exist
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
const exportName = "NonEmptyReadonlyArray";
const exportKind = "type";
const moduleImportPath = "effect/Array";
const sourceSummary = "A readonly array guaranteed to have at least one element.";
const sourceExample =
  'import type { Array } from "effect"\n\nconst nonEmpty: Array.NonEmptyReadonlyArray<number> = [1, 2, 3]\nconst head: number = nonEmpty[0] // guaranteed to exist';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log(
    "Bridge note: NonEmptyReadonlyArray is erased at runtime; companion Array APIs demonstrate the non-empty flow."
  );
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleCompanionGuardedHeadAccess = Effect.gen(function* () {
  const input: ReadonlyArray<number> = [1, 2, 3];
  yield* Console.log(`Readonly input -> ${JSON.stringify(input)}`);

  if (A.isReadonlyArrayNonEmpty(input)) {
    const headByIndex = input[0];
    const headByApi = A.headNonEmpty(input);
    yield* Console.log(`Guard passed; input[0]=${headByIndex}, headNonEmpty=${headByApi}`);
  } else {
    yield* Console.log("Guard failed; skipped head access.");
  }
});

const exampleCompanionNonMutatingFlow = Effect.gen(function* () {
  yield* Console.log("Runtime companion context: inspect Array.isReadonlyArrayNonEmpty.");
  yield* inspectNamedExport({ moduleRecord, exportName: "isReadonlyArrayNonEmpty" });

  const base: ReadonlyArray<number> = [10, 20, 30];
  const appended = A.append(base, 40);

  if (A.isReadonlyArrayNonEmpty(appended)) {
    const tail = A.tailNonEmpty(appended);
    yield* Console.log(`append(base, 40) -> ${JSON.stringify(appended)}; tailNonEmpty -> ${JSON.stringify(tail)}`);
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
      title: "Companion Guard + Head Access",
      description: "Use isReadonlyArrayNonEmpty to justify direct head access on readonly data.",
      run: exampleCompanionGuardedHeadAccess,
    },
    {
      title: "Companion Non-Mutating Flow",
      description: "Use append and tailNonEmpty to keep non-empty guarantees without mutating input.",
      run: exampleCompanionNonMutatingFlow,
    },
  ],
});

BunRuntime.runMain(program);
