/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableRef
 * Export: decrementAndGet
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableRef.ts
 * Generated: 2026-02-19T04:14:15.176Z
 *
 * Overview:
 * Decrements a numeric MutableRef by 1 and returns the new value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { MutableRef } from "effect"
 *
 * const counter = MutableRef.make(5)
 *
 * // Decrement and get the new value
 * const newValue = MutableRef.decrementAndGet(counter)
 * console.log(newValue) // 4
 * console.log(MutableRef.get(counter)) // 4
 *
 * // Use in expressions
 * const lives = MutableRef.make(3)
 * console.log(`Lives remaining: ${MutableRef.decrementAndGet(lives)}`) // "Lives remaining: 2"
 *
 * // Conditional logic based on decremented value
 * const attempts = MutableRef.make(3)
 * while (MutableRef.decrementAndGet(attempts) >= 0) {
 *   console.log("Retrying...")
 *   // retry logic
 * }
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
const exportName = "decrementAndGet";
const exportKind = "const";
const moduleImportPath = "effect/MutableRef";
const sourceSummary = "Decrements a numeric MutableRef by 1 and returns the new value.";
const sourceExample =
  'import { MutableRef } from "effect"\n\nconst counter = MutableRef.make(5)\n\n// Decrement and get the new value\nconst newValue = MutableRef.decrementAndGet(counter)\nconsole.log(newValue) // 4\nconsole.log(MutableRef.get(counter)) // 4\n\n// Use in expressions\nconst lives = MutableRef.make(3)\nconsole.log(`Lives remaining: ${MutableRef.decrementAndGet(lives)}`) // "Lives remaining: 2"\n\n// Conditional logic based on decremented value\nconst attempts = MutableRef.make(3)\nwhile (MutableRef.decrementAndGet(attempts) >= 0) {\n  console.log("Retrying...")\n  // retry logic\n}';
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
