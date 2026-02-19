/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: transaction
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.396Z
 *
 * Overview:
 * Creates an isolated transaction that never composes with parent transactions.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref1 = yield* TxRef.make(0)
 *   const ref2 = yield* TxRef.make(100)
 *
 *   // Nested atomic transaction - ref1 will be part of outer transaction
 *   yield* Effect.atomic(Effect.gen(function*() {
 *     yield* TxRef.set(ref1, 10)
 *
 *     // This atomic operation composes with the parent
 *     yield* Effect.atomic(Effect.gen(function*() {
 *       yield* TxRef.set(ref1, 20) // Part of same transaction
 *     }))
 *   }))
 *
 *   // Isolated transaction - ref2 will be in its own transaction
 *   yield* Effect.transaction(Effect.gen(function*() {
 *     yield* TxRef.set(ref2, 200)
 *   }))
 *
 *   const val1 = yield* TxRef.get(ref1) // 20
 *   const val2 = yield* TxRef.get(ref2) // 200
 *   return { ref1: val1, ref2: val2 }
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "transaction";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Creates an isolated transaction that never composes with parent transactions.";
const sourceExample =
  'import { Effect, TxRef } from "effect"\n\nconst program = Effect.gen(function*() {\n  const ref1 = yield* TxRef.make(0)\n  const ref2 = yield* TxRef.make(100)\n\n  // Nested atomic transaction - ref1 will be part of outer transaction\n  yield* Effect.atomic(Effect.gen(function*() {\n    yield* TxRef.set(ref1, 10)\n\n    // This atomic operation composes with the parent\n    yield* Effect.atomic(Effect.gen(function*() {\n      yield* TxRef.set(ref1, 20) // Part of same transaction\n    }))\n  }))\n\n  // Isolated transaction - ref2 will be in its own transaction\n  yield* Effect.transaction(Effect.gen(function*() {\n    yield* TxRef.set(ref2, 200)\n  }))\n\n  const val1 = yield* TxRef.get(ref1) // 20\n  const val2 = yield* TxRef.get(ref2) // 200\n  return { ref1: val1, ref2: val2 }\n})';
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
