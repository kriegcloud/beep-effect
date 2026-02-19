/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Ref
 * Export: update
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Ref.ts
 * Generated: 2026-02-19T04:50:38.752Z
 *
 * Overview:
 * Atomically updates the value of the Ref using the given function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Ref } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const counter = yield* Ref.make(5)
 *
 *   // Update the value
 *   yield* Ref.update(counter, (n) => n * 2)
 *
 *   const value = yield* Ref.get(counter)
 *   console.log(value) // 10
 * })
 *
 * // Using multiple operations
 * const program2 = Effect.gen(function*() {
 *   const counter = yield* Ref.make(5)
 *   yield* Ref.update(counter, (n: number) => n + 10)
 *   const value = yield* Ref.get(counter)
 *   console.log(value) // 15
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
import * as RefModule from "effect/Ref";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "update";
const exportKind = "const";
const moduleImportPath = "effect/Ref";
const sourceSummary = "Atomically updates the value of the Ref using the given function.";
const sourceExample =
  'import { Effect, Ref } from "effect"\n\nconst program = Effect.gen(function*() {\n  const counter = yield* Ref.make(5)\n\n  // Update the value\n  yield* Ref.update(counter, (n) => n * 2)\n\n  const value = yield* Ref.get(counter)\n  console.log(value) // 10\n})\n\n// Using multiple operations\nconst program2 = Effect.gen(function*() {\n  const counter = yield* Ref.make(5)\n  yield* Ref.update(counter, (n: number) => n + 10)\n  const value = yield* Ref.get(counter)\n  console.log(value) // 15\n})';
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
