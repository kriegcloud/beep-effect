/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableRef
 * Export: compareAndSet
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableRef.ts
 * Generated: 2026-02-19T04:50:37.857Z
 *
 * Overview:
 * Atomically sets the value to newValue if the current value equals oldValue. Returns true if the value was updated, false otherwise. Uses Effect's Equal interface for value comparison.
 *
 * Source JSDoc Example:
 * ```ts
 * import { MutableRef } from "effect"
 *
 * const ref = MutableRef.make("initial")
 *
 * // Successful compare and set
 * const updated = MutableRef.compareAndSet(ref, "initial", "updated")
 * console.log(updated) // true
 * console.log(MutableRef.get(ref)) // "updated"
 *
 * // Failed compare and set (value doesn't match)
 * const failed = MutableRef.compareAndSet(ref, "initial", "failed")
 * console.log(failed) // false
 * console.log(MutableRef.get(ref)) // "updated" (unchanged)
 *
 * // Thread-safe counter increment
 * const counter = MutableRef.make(5)
 * let current: number
 * do {
 *   current = MutableRef.get(counter)
 * } while (!MutableRef.compareAndSet(counter, current, current + 1))
 *
 * // Pipe-able version
 * const casUpdate = MutableRef.compareAndSet("updated", "final")
 * console.log(casUpdate(ref)) // true
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
import * as MutableRefModule from "effect/MutableRef";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "compareAndSet";
const exportKind = "const";
const moduleImportPath = "effect/MutableRef";
const sourceSummary =
  "Atomically sets the value to newValue if the current value equals oldValue. Returns true if the value was updated, false otherwise. Uses Effect's Equal interface for value compa...";
const sourceExample =
  'import { MutableRef } from "effect"\n\nconst ref = MutableRef.make("initial")\n\n// Successful compare and set\nconst updated = MutableRef.compareAndSet(ref, "initial", "updated")\nconsole.log(updated) // true\nconsole.log(MutableRef.get(ref)) // "updated"\n\n// Failed compare and set (value doesn\'t match)\nconst failed = MutableRef.compareAndSet(ref, "initial", "failed")\nconsole.log(failed) // false\nconsole.log(MutableRef.get(ref)) // "updated" (unchanged)\n\n// Thread-safe counter increment\nconst counter = MutableRef.make(5)\nlet current: number\ndo {\n  current = MutableRef.get(counter)\n} while (!MutableRef.compareAndSet(counter, current, current + 1))\n\n// Pipe-able version\nconst casUpdate = MutableRef.compareAndSet("updated", "final")\nconsole.log(casUpdate(ref)) // true';
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
