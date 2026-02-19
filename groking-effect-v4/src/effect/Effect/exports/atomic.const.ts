/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: atomic
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.907Z
 *
 * Overview:
 * Defines a transaction. Transactions are "all or nothing" with respect to changes made to transactional values (i.e. TxRef) that occur within the transaction body.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref1 = yield* TxRef.make(0)
 *   const ref2 = yield* TxRef.make(0)
 *
 *   // All operations within atomic block succeed or fail together
 *   yield* Effect.atomic(Effect.gen(function*() {
 *     yield* TxRef.set(ref1, 10)
 *     yield* TxRef.set(ref2, 20)
 *     const sum = (yield* TxRef.get(ref1)) + (yield* TxRef.get(ref2))
 *     console.log(`Transaction sum: ${sum}`)
 *   }))
 *
 *   console.log(`Final ref1: ${yield* TxRef.get(ref1)}`) // 10
 *   console.log(`Final ref2: ${yield* TxRef.get(ref2)}`) // 20
 * })
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "atomic";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  'Defines a transaction. Transactions are "all or nothing" with respect to changes made to transactional values (i.e. TxRef) that occur within the transaction body.';
const sourceExample =
  'import { Effect, TxRef } from "effect"\n\nconst program = Effect.gen(function*() {\n  const ref1 = yield* TxRef.make(0)\n  const ref2 = yield* TxRef.make(0)\n\n  // All operations within atomic block succeed or fail together\n  yield* Effect.atomic(Effect.gen(function*() {\n    yield* TxRef.set(ref1, 10)\n    yield* TxRef.set(ref2, 20)\n    const sum = (yield* TxRef.get(ref1)) + (yield* TxRef.get(ref2))\n    console.log(`Transaction sum: ${sum}`)\n  }))\n\n  console.log(`Final ref1: ${yield* TxRef.get(ref1)}`) // 10\n  console.log(`Final ref2: ${yield* TxRef.get(ref2)}`) // 20\n})';
const moduleRecord = EffectModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleCallableProbe = Effect.gen(function* () {
  yield* Console.log("If the value is callable, run a zero-arg probe to observe behavior.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
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
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe,
    },
  ],
});

BunRuntime.runMain(program);
