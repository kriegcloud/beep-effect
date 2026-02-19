/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: atomicWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.907Z
 *
 * Overview:
 * Executes a function within a transaction context, providing access to the transaction state.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxRef } from "effect"
 *
 * const program = Effect.atomicWith((txState) =>
 *   Effect.gen(function*() {
 *     const ref = yield* TxRef.make(0)
 *
 *     // Access transaction state for debugging
 *     console.log(`Journal size: ${txState.journal.size}`)
 *     console.log(`Retry flag: ${txState.retry}`)
 *
 *     yield* TxRef.set(ref, 42)
 *     return yield* TxRef.get(ref)
 *   })
 * )
 *
 * Effect.runPromise(program).then(console.log) // 42
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
const exportName = "atomicWith";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Executes a function within a transaction context, providing access to the transaction state.";
const sourceExample =
  'import { Effect, TxRef } from "effect"\n\nconst program = Effect.atomicWith((txState) =>\n  Effect.gen(function*() {\n    const ref = yield* TxRef.make(0)\n\n    // Access transaction state for debugging\n    console.log(`Journal size: ${txState.journal.size}`)\n    console.log(`Retry flag: ${txState.retry}`)\n\n    yield* TxRef.set(ref, 42)\n    return yield* TxRef.get(ref)\n  })\n)\n\nEffect.runPromise(program).then(console.log) // 42';
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
