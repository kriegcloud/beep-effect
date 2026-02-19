/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableRef
 * Export: set
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableRef.ts
 * Generated: 2026-02-19T04:50:37.857Z
 *
 * Overview:
 * Sets the MutableRef to a new value and returns the reference.
 *
 * Source JSDoc Example:
 * ```ts
 * import { MutableRef } from "effect"
 *
 * const ref = MutableRef.make("initial")
 *
 * // Set a new value
 * MutableRef.set(ref, "updated")
 * console.log(MutableRef.get(ref)) // "updated"
 *
 * // Chain set operations (since it returns the ref)
 * const result = MutableRef.set(ref, "final")
 * console.log(result === ref) // true (same reference)
 * console.log(MutableRef.get(ref)) // "final"
 *
 * // Set complex objects
 * const config = MutableRef.make({ debug: false, verbose: false })
 * MutableRef.set(config, { debug: true, verbose: true })
 * console.log(MutableRef.get(config)) // { debug: true, verbose: true }
 *
 * // Pipe-able version
 * const setValue = MutableRef.set("new value")
 * setValue(ref)
 * console.log(MutableRef.get(ref)) // "new value"
 *
 * // Useful for state management
 * const state = MutableRef.make<"idle" | "loading" | "success" | "error">("idle")
 * MutableRef.set(state, "loading")
 * // ... perform async operation
 * MutableRef.set(state, "success")
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
const exportName = "set";
const exportKind = "const";
const moduleImportPath = "effect/MutableRef";
const sourceSummary = "Sets the MutableRef to a new value and returns the reference.";
const sourceExample =
  'import { MutableRef } from "effect"\n\nconst ref = MutableRef.make("initial")\n\n// Set a new value\nMutableRef.set(ref, "updated")\nconsole.log(MutableRef.get(ref)) // "updated"\n\n// Chain set operations (since it returns the ref)\nconst result = MutableRef.set(ref, "final")\nconsole.log(result === ref) // true (same reference)\nconsole.log(MutableRef.get(ref)) // "final"\n\n// Set complex objects\nconst config = MutableRef.make({ debug: false, verbose: false })\nMutableRef.set(config, { debug: true, verbose: true })\nconsole.log(MutableRef.get(config)) // { debug: true, verbose: true }\n\n// Pipe-able version\nconst setValue = MutableRef.set("new value")\nsetValue(ref)\nconsole.log(MutableRef.get(ref)) // "new value"\n\n// Useful for state management\nconst state = MutableRef.make<"idle" | "loading" | "success" | "error">("idle")\nMutableRef.set(state, "loading")\n// ... perform async operation\nMutableRef.set(state, "success")';
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
