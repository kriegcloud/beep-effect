/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableRef
 * Export: getAndSet
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableRef.ts
 * Generated: 2026-02-19T04:14:15.176Z
 *
 * Overview:
 * Sets the MutableRef to a new value and returns the previous value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { MutableRef } from "effect"
 * 
 * const ref = MutableRef.make("old")
 * 
 * // Set new value and get the previous one
 * const previous = MutableRef.getAndSet(ref, "new")
 * console.log(previous) // "old"
 * console.log(MutableRef.get(ref)) // "new"
 * 
 * // Swapping values
 * const counter = MutableRef.make(5)
 * const oldValue = MutableRef.getAndSet(counter, 10)
 * console.log(`Changed from ${oldValue} to ${MutableRef.get(counter)}`) // "Changed from 5 to 10"
 * 
 * // Pipe-able version
 * const setValue = MutableRef.getAndSet("final")
 * const previousValue = setValue(ref)
 * console.log(previousValue) // "new"
 * 
 * // Useful for atomic swaps in algorithms
 * const buffer = MutableRef.make<Array<string>>(["a", "b", "c"])
 * const oldBuffer = MutableRef.getAndSet(buffer, [])
 * console.log(oldBuffer) // ["a", "b", "c"]
 * console.log(MutableRef.get(buffer)) // []
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as MutableRefModule from "effect/MutableRef";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "getAndSet";
const exportKind = "const";
const moduleImportPath = "effect/MutableRef";
const sourceSummary = "Sets the MutableRef to a new value and returns the previous value.";
const sourceExample = "import { MutableRef } from \"effect\"\n\nconst ref = MutableRef.make(\"old\")\n\n// Set new value and get the previous one\nconst previous = MutableRef.getAndSet(ref, \"new\")\nconsole.log(previous) // \"old\"\nconsole.log(MutableRef.get(ref)) // \"new\"\n\n// Swapping values\nconst counter = MutableRef.make(5)\nconst oldValue = MutableRef.getAndSet(counter, 10)\nconsole.log(`Changed from ${oldValue} to ${MutableRef.get(counter)}`) // \"Changed from 5 to 10\"\n\n// Pipe-able version\nconst setValue = MutableRef.getAndSet(\"final\")\nconst previousValue = setValue(ref)\nconsole.log(previousValue) // \"new\"\n\n// Useful for atomic swaps in algorithms\nconst buffer = MutableRef.make<Array<string>>([\"a\", \"b\", \"c\"])\nconst oldBuffer = MutableRef.getAndSet(buffer, [])\nconsole.log(oldBuffer) // [\"a\", \"b\", \"c\"]\nconsole.log(MutableRef.get(buffer)) // []";
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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
