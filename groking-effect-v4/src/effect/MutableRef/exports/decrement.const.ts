/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableRef
 * Export: decrement
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableRef.ts
 * Generated: 2026-02-19T04:14:15.176Z
 *
 * Overview:
 * Decrements a numeric MutableRef by 1 and returns the reference.
 *
 * Source JSDoc Example:
 * ```ts
 * import { MutableRef } from "effect"
 *
 * const counter = MutableRef.make(5)
 *
 * // Decrement the counter
 * MutableRef.decrement(counter)
 * console.log(MutableRef.get(counter)) // 4
 *
 * // Chain operations
 * MutableRef.decrement(counter)
 * MutableRef.decrement(counter)
 * console.log(MutableRef.get(counter)) // 2
 *
 * // Useful for countdown scenarios
 * const countdown = MutableRef.make(10)
 * while (MutableRef.get(countdown) > 0) {
 *   console.log(MutableRef.get(countdown))
 *   MutableRef.decrement(countdown)
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
const exportName = "decrement";
const exportKind = "const";
const moduleImportPath = "effect/MutableRef";
const sourceSummary = "Decrements a numeric MutableRef by 1 and returns the reference.";
const sourceExample =
  'import { MutableRef } from "effect"\n\nconst counter = MutableRef.make(5)\n\n// Decrement the counter\nMutableRef.decrement(counter)\nconsole.log(MutableRef.get(counter)) // 4\n\n// Chain operations\nMutableRef.decrement(counter)\nMutableRef.decrement(counter)\nconsole.log(MutableRef.get(counter)) // 2\n\n// Useful for countdown scenarios\nconst countdown = MutableRef.make(10)\nwhile (MutableRef.get(countdown) > 0) {\n  console.log(MutableRef.get(countdown))\n  MutableRef.decrement(countdown)\n}';
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
