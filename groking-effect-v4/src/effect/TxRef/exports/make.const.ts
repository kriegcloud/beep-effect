/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxRef
 * Export: make
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxRef.ts
 * Generated: 2026-02-19T04:50:44.343Z
 *
 * Overview:
 * Creates a new `TxRef` with the specified initial value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   // Create a transactional reference with initial value
 *   const counter = yield* TxRef.make(0)
 *   const name = yield* TxRef.make("Alice")
 *
 *   // Use in transactions
 *   yield* Effect.atomic(Effect.gen(function*() {
 *     yield* TxRef.set(counter, 42)
 *     yield* TxRef.set(name, "Bob")
 *   }))
 *
 *   console.log(yield* TxRef.get(counter)) // 42
 *   console.log(yield* TxRef.get(name)) // "Bob"
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
import * as TxRefModule from "effect/TxRef";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "make";
const exportKind = "const";
const moduleImportPath = "effect/TxRef";
const sourceSummary = "Creates a new `TxRef` with the specified initial value.";
const sourceExample =
  'import { Effect, TxRef } from "effect"\n\nconst program = Effect.gen(function*() {\n  // Create a transactional reference with initial value\n  const counter = yield* TxRef.make(0)\n  const name = yield* TxRef.make("Alice")\n\n  // Use in transactions\n  yield* Effect.atomic(Effect.gen(function*() {\n    yield* TxRef.set(counter, 42)\n    yield* TxRef.set(name, "Bob")\n  }))\n\n  console.log(yield* TxRef.get(counter)) // 42\n  console.log(yield* TxRef.get(name)) // "Bob"\n})';
const moduleRecord = TxRefModule as Record<string, unknown>;

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
