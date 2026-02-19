/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Ref
 * Export: setAndGet
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Ref.ts
 * Generated: 2026-02-19T04:14:16.480Z
 *
 * Overview:
 * Atomically sets the value of the Ref to the specified value and returns the new value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Ref } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref = yield* Ref.make(10)
 *
 *   // Set new value and get it back in one operation
 *   const newValue = yield* Ref.setAndGet(ref, 42)
 *   console.log(newValue) // 42
 *
 *   // Verify the ref contains the new value
 *   const current = yield* Ref.get(ref)
 *   console.log(current) // 42
 * })
 *
 * // Useful for sequential operations
 * const program2 = Effect.gen(function*() {
 *   const counter = yield* Ref.make(0)
 *
 *   const newValue = yield* Ref.setAndGet(counter, 20)
 *   console.log(newValue) // 20
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
import * as RefModule from "effect/Ref";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "setAndGet";
const exportKind = "const";
const moduleImportPath = "effect/Ref";
const sourceSummary = "Atomically sets the value of the Ref to the specified value and returns the new value.";
const sourceExample =
  'import { Effect, Ref } from "effect"\n\nconst program = Effect.gen(function*() {\n  const ref = yield* Ref.make(10)\n\n  // Set new value and get it back in one operation\n  const newValue = yield* Ref.setAndGet(ref, 42)\n  console.log(newValue) // 42\n\n  // Verify the ref contains the new value\n  const current = yield* Ref.get(ref)\n  console.log(current) // 42\n})\n\n// Useful for sequential operations\nconst program2 = Effect.gen(function*() {\n  const counter = yield* Ref.make(0)\n\n  const newValue = yield* Ref.setAndGet(counter, 20)\n  console.log(newValue) // 20\n})';
const moduleRecord = RefModule as Record<string, unknown>;

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
