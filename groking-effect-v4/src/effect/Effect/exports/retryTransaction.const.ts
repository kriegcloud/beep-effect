/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: retryTransaction
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.393Z
 *
 * Overview:
 * Signals that the current transaction needs to be retried.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxRef } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   // create a transactional reference
 *   const ref = yield* TxRef.make(0)
 * 
 *   // forks a fiber that increases the value of `ref` every 100 millis
 *   yield* Effect.forkChild(Effect.forever(
 *     // update to transactional value
 *     TxRef.update(ref, (n) => n + 1).pipe(Effect.delay("100 millis"))
 *   ))
 * 
 *   // the following will retry 10 times until the `ref` value is 10
 *   yield* Effect.atomic(Effect.gen(function*() {
 *     const value = yield* TxRef.get(ref)
 *     if (value < 10) {
 *       yield* Effect.log(`retry due to value: ${value}`)
 *       return yield* Effect.retryTransaction
 *     }
 *     yield* Effect.log(`transaction done with value: ${value}`)
 *   }))
 * })
 * 
 * Effect.runPromise(program).catch(console.error)
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as EffectModule from "effect/Effect";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "retryTransaction";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Signals that the current transaction needs to be retried.";
const sourceExample = "import { Effect, TxRef } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  // create a transactional reference\n  const ref = yield* TxRef.make(0)\n\n  // forks a fiber that increases the value of `ref` every 100 millis\n  yield* Effect.forkChild(Effect.forever(\n    // update to transactional value\n    TxRef.update(ref, (n) => n + 1).pipe(Effect.delay(\"100 millis\"))\n  ))\n\n  // the following will retry 10 times until the `ref` value is 10\n  yield* Effect.atomic(Effect.gen(function*() {\n    const value = yield* TxRef.get(ref)\n    if (value < 10) {\n      yield* Effect.log(`retry due to value: ${value}`)\n      return yield* Effect.retryTransaction\n    }\n    yield* Effect.log(`transaction done with value: ${value}`)\n  }))\n})\n\nEffect.runPromise(program).catch(console.error)";
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
  bunContext: BunContext,
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
