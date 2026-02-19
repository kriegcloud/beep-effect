/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableRef
 * Export: increment
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableRef.ts
 * Generated: 2026-02-19T04:14:15.176Z
 *
 * Overview:
 * Increments a numeric MutableRef by 1 and returns the reference.
 *
 * Source JSDoc Example:
 * ```ts
 * import { MutableRef } from "effect"
 *
 * const counter = MutableRef.make(5)
 *
 * // Increment the counter
 * MutableRef.increment(counter)
 * console.log(MutableRef.get(counter)) // 6
 *
 * // Chain operations
 * MutableRef.increment(counter)
 * MutableRef.increment(counter)
 * console.log(MutableRef.get(counter)) // 8
 *
 * // Useful for simple counting
 * const visits = MutableRef.make(0)
 * MutableRef.increment(visits) // User visited
 * MutableRef.increment(visits) // Another visit
 * console.log(MutableRef.get(visits)) // 2
 *
 * // Returns the reference for chaining
 * const result = MutableRef.increment(counter)
 * console.log(result === counter) // true
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
import * as MutableRefModule from "effect/MutableRef";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "increment";
const exportKind = "const";
const moduleImportPath = "effect/MutableRef";
const sourceSummary = "Increments a numeric MutableRef by 1 and returns the reference.";
const sourceExample =
  'import { MutableRef } from "effect"\n\nconst counter = MutableRef.make(5)\n\n// Increment the counter\nMutableRef.increment(counter)\nconsole.log(MutableRef.get(counter)) // 6\n\n// Chain operations\nMutableRef.increment(counter)\nMutableRef.increment(counter)\nconsole.log(MutableRef.get(counter)) // 8\n\n// Useful for simple counting\nconst visits = MutableRef.make(0)\nMutableRef.increment(visits) // User visited\nMutableRef.increment(visits) // Another visit\nconsole.log(MutableRef.get(visits)) // 2\n\n// Returns the reference for chaining\nconst result = MutableRef.increment(counter)\nconsole.log(result === counter) // true';
const moduleRecord = MutableRefModule as Record<string, unknown>;

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
