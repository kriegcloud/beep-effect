/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxRef
 * Export: TxRef
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/TxRef.ts
 * Generated: 2026-02-19T04:50:44.343Z
 *
 * Overview:
 * TxRef is a transactional value, it can be read and modified within the body of a transaction.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   // Create a transactional reference
 *   const ref: TxRef.TxRef<number> = yield* TxRef.make(0)
 *
 *   // Use within a transaction
 *   yield* Effect.atomic(Effect.gen(function*() {
 *     const current = yield* TxRef.get(ref)
 *     yield* TxRef.set(ref, current + 1)
 *   }))
 *
 *   const final = yield* TxRef.get(ref)
 *   console.log(final) // 1
 * })
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
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as TxRefModule from "effect/TxRef";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "TxRef";
const exportKind = "interface";
const moduleImportPath = "effect/TxRef";
const sourceSummary = "TxRef is a transactional value, it can be read and modified within the body of a transaction.";
const sourceExample =
  'import { Effect, TxRef } from "effect"\n\nconst program = Effect.gen(function*() {\n  // Create a transactional reference\n  const ref: TxRef.TxRef<number> = yield* TxRef.make(0)\n\n  // Use within a transaction\n  yield* Effect.atomic(Effect.gen(function*() {\n    const current = yield* TxRef.get(ref)\n    yield* TxRef.set(ref, current + 1)\n  }))\n\n  const final = yield* TxRef.get(ref)\n  console.log(final) // 1\n})';
const moduleRecord = TxRefModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
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
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
