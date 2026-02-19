/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Ref
 * Export: updateAndGet
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Ref.ts
 * Generated: 2026-02-19T04:50:38.752Z
 *
 * Overview:
 * Atomically updates the value of the Ref using the given function and returns the new value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Ref } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const counter = yield* Ref.make(5)
 *
 *   // Update and get the new value in one operation
 *   const newValue = yield* Ref.updateAndGet(counter, (n) => n * 3)
 *   console.log(newValue) // 15
 *
 *   // Verify the ref contains the new value
 *   const current = yield* Ref.get(counter)
 *   console.log(current) // 15
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
const exportName = "updateAndGet";
const exportKind = "const";
const moduleImportPath = "effect/Ref";
const sourceSummary = "Atomically updates the value of the Ref using the given function and returns the new value.";
const sourceExample =
  'import { Effect, Ref } from "effect"\n\nconst program = Effect.gen(function*() {\n  const counter = yield* Ref.make(5)\n\n  // Update and get the new value in one operation\n  const newValue = yield* Ref.updateAndGet(counter, (n) => n * 3)\n  console.log(newValue) // 15\n\n  // Verify the ref contains the new value\n  const current = yield* Ref.get(counter)\n  console.log(current) // 15\n})';
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
