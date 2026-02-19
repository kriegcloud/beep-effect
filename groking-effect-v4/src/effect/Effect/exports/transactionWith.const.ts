/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: transactionWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.396Z
 *
 * Overview:
 * Executes a function within an isolated transaction context, providing access to the transaction state.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxRef } from "effect"
 *
 * const program = Effect.transactionWith((txState) =>
 *   Effect.gen(function*() {
 *     const ref = yield* TxRef.make(0)
 *
 *     // This transaction is isolated - it has its own journal
 *     // txState.journal is independent of any parent transaction
 *
 *     yield* TxRef.set(ref, 42)
 *     return yield* TxRef.get(ref)
 *   })
 * )
 *
 * // Even when nested in another atomic block, this transaction is isolated
 * const nestedProgram = Effect.atomic(
 *   Effect.gen(function*() {
 *     const result = yield* program // Runs in its own isolated transaction
 *     return result
 *   })
 * )
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
const exportName = "transactionWith";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "Executes a function within an isolated transaction context, providing access to the transaction state.";
const sourceExample =
  'import { Effect, TxRef } from "effect"\n\nconst program = Effect.transactionWith((txState) =>\n  Effect.gen(function*() {\n    const ref = yield* TxRef.make(0)\n\n    // This transaction is isolated - it has its own journal\n    // txState.journal is independent of any parent transaction\n\n    yield* TxRef.set(ref, 42)\n    return yield* TxRef.get(ref)\n  })\n)\n\n// Even when nested in another atomic block, this transaction is isolated\nconst nestedProgram = Effect.atomic(\n  Effect.gen(function*() {\n    const result = yield* program // Runs in its own isolated transaction\n    return result\n  })\n)';
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
