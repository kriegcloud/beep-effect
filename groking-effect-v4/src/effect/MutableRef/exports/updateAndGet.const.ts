/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableRef
 * Export: updateAndGet
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableRef.ts
 * Generated: 2026-02-19T04:14:15.177Z
 *
 * Overview:
 * Updates the MutableRef with the result of applying a function to its current value, and returns the new value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { MutableRef } from "effect"
 * 
 * const counter = MutableRef.make(5)
 * 
 * // Increment and get the new value
 * const newValue = MutableRef.updateAndGet(counter, (n) => n + 1)
 * console.log(newValue) // 6
 * console.log(MutableRef.get(counter)) // 6
 * 
 * // Double the value and get the result
 * const doubled = MutableRef.updateAndGet(counter, (n) => n * 2)
 * console.log(doubled) // 12
 * 
 * // Transform string and get result
 * const message = MutableRef.make("hello")
 * const upperCase = MutableRef.updateAndGet(message, (s) => s.toUpperCase())
 * console.log(upperCase) // "HELLO"
 * 
 * // Pipe-able version
 * const increment = MutableRef.updateAndGet((n: number) => n + 1)
 * const result = increment(counter)
 * console.log(result) // 13 (new value)
 * 
 * // Useful for calculations that need the result
 * const score = MutableRef.make(100)
 * const bonus = 50
 * const newScore = MutableRef.updateAndGet(score, (s) => s + bonus)
 * console.log(`New score: ${newScore}`) // "New score: 150"
 * 
 * // Array transformations
 * const list = MutableRef.make<Array<number>>([1, 2, 3])
 * const newList = MutableRef.updateAndGet(list, (arr) => arr.map((x) => x * 2))
 * console.log(newList) // [2, 4, 6]
 * console.log(MutableRef.get(list)) // [2, 4, 6]
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
const exportName = "updateAndGet";
const exportKind = "const";
const moduleImportPath = "effect/MutableRef";
const sourceSummary = "Updates the MutableRef with the result of applying a function to its current value, and returns the new value.";
const sourceExample = "import { MutableRef } from \"effect\"\n\nconst counter = MutableRef.make(5)\n\n// Increment and get the new value\nconst newValue = MutableRef.updateAndGet(counter, (n) => n + 1)\nconsole.log(newValue) // 6\nconsole.log(MutableRef.get(counter)) // 6\n\n// Double the value and get the result\nconst doubled = MutableRef.updateAndGet(counter, (n) => n * 2)\nconsole.log(doubled) // 12\n\n// Transform string and get result\nconst message = MutableRef.make(\"hello\")\nconst upperCase = MutableRef.updateAndGet(message, (s) => s.toUpperCase())\nconsole.log(upperCase) // \"HELLO\"\n\n// Pipe-able version\nconst increment = MutableRef.updateAndGet((n: number) => n + 1)\nconst result = increment(counter)\nconsole.log(result) // 13 (new value)\n\n// Useful for calculations that need the result\nconst score = MutableRef.make(100)\nconst bonus = 50\nconst newScore = MutableRef.updateAndGet(score, (s) => s + bonus)\nconsole.log(`New score: ${newScore}`) // \"New score: 150\"\n\n// Array transformations\nconst list = MutableRef.make<Array<number>>([1, 2, 3])\nconst newList = MutableRef.updateAndGet(list, (arr) => arr.map((x) => x * 2))\nconsole.log(newList) // [2, 4, 6]\nconsole.log(MutableRef.get(list)) // [2, 4, 6]";
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
