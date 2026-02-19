/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableRef
 * Export: getAndDecrement
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableRef.ts
 * Generated: 2026-02-19T04:14:15.176Z
 *
 * Overview:
 * Decrements a numeric MutableRef by 1 and returns the previous value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { MutableRef } from "effect"
 * 
 * const counter = MutableRef.make(5)
 * 
 * // Get current value and then decrement
 * const previousValue = MutableRef.getAndDecrement(counter)
 * console.log(previousValue) // 5
 * console.log(MutableRef.get(counter)) // 4
 * 
 * // Useful for processing where you need the original value
 * const itemsLeft = MutableRef.make(10)
 * while (MutableRef.get(itemsLeft) > 0) {
 *   const currentItem = MutableRef.getAndDecrement(itemsLeft)
 *   console.log(`Processing item ${currentItem}`)
 * }
 * 
 * // Post-decrement semantics (like i-- in other languages)
 * const index = MutableRef.make(3)
 * const currentIndex = MutableRef.getAndDecrement(index)
 * console.log(`Current: ${currentIndex}, Next: ${MutableRef.get(index)}`) // "Current: 3, Next: 2"
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
const exportName = "getAndDecrement";
const exportKind = "const";
const moduleImportPath = "effect/MutableRef";
const sourceSummary = "Decrements a numeric MutableRef by 1 and returns the previous value.";
const sourceExample = "import { MutableRef } from \"effect\"\n\nconst counter = MutableRef.make(5)\n\n// Get current value and then decrement\nconst previousValue = MutableRef.getAndDecrement(counter)\nconsole.log(previousValue) // 5\nconsole.log(MutableRef.get(counter)) // 4\n\n// Useful for processing where you need the original value\nconst itemsLeft = MutableRef.make(10)\nwhile (MutableRef.get(itemsLeft) > 0) {\n  const currentItem = MutableRef.getAndDecrement(itemsLeft)\n  console.log(`Processing item ${currentItem}`)\n}\n\n// Post-decrement semantics (like i-- in other languages)\nconst index = MutableRef.make(3)\nconst currentIndex = MutableRef.getAndDecrement(index)\nconsole.log(`Current: ${currentIndex}, Next: ${MutableRef.get(index)}`) // \"Current: 3, Next: 2\"";
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
