/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Ref
 * Export: set
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Ref.ts
 * Generated: 2026-02-19T04:50:38.752Z
 *
 * Overview:
 * Sets the value of the Ref to the specified value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Ref } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref = yield* Ref.make(0)
 *   yield* Ref.set(ref, 42)
 *   const value = yield* Ref.get(ref)
 *   console.log(value) // 42
 * })
 *
 * // Using multiple operations
 * const program2 = Effect.gen(function*() {
 *   const ref = yield* Ref.make(0)
 *   yield* Ref.set(ref, 100)
 *   const value = yield* Ref.get(ref)
 *   console.log(value) // 100
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
const exportName = "set";
const exportKind = "const";
const moduleImportPath = "effect/Ref";
const sourceSummary = "Sets the value of the Ref to the specified value.";
const sourceExample =
  'import { Effect, Ref } from "effect"\n\nconst program = Effect.gen(function*() {\n  const ref = yield* Ref.make(0)\n  yield* Ref.set(ref, 42)\n  const value = yield* Ref.get(ref)\n  console.log(value) // 42\n})\n\n// Using multiple operations\nconst program2 = Effect.gen(function*() {\n  const ref = yield* Ref.make(0)\n  yield* Ref.set(ref, 100)\n  const value = yield* Ref.get(ref)\n  console.log(value) // 100\n})';
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
