/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableRef
 * Export: incrementAndGet
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableRef.ts
 * Generated: 2026-02-19T04:14:15.176Z
 *
 * Overview:
 * Increments a numeric MutableRef by 1 and returns the new value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { MutableRef } from "effect"
 * 
 * const counter = MutableRef.make(5)
 * 
 * // Increment and get the new value
 * const newValue = MutableRef.incrementAndGet(counter)
 * console.log(newValue) // 6
 * console.log(MutableRef.get(counter)) // 6
 * 
 * // Use in expressions
 * const score = MutableRef.make(100)
 * console.log(`New score: ${MutableRef.incrementAndGet(score)}`) // "New score: 101"
 * 
 * // Pre-increment semantics (like ++i in other languages)
 * const level = MutableRef.make(0)
 * const nextLevel = MutableRef.incrementAndGet(level)
 * console.log(`Reached level ${nextLevel}`) // "Reached level 1"
 * 
 * // Conditional logic based on incremented value
 * const attempts = MutableRef.make(0)
 * if (MutableRef.incrementAndGet(attempts) > 3) {
 *   console.log("Too many attempts")
 * }
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
const exportName = "incrementAndGet";
const exportKind = "const";
const moduleImportPath = "effect/MutableRef";
const sourceSummary = "Increments a numeric MutableRef by 1 and returns the new value.";
const sourceExample = "import { MutableRef } from \"effect\"\n\nconst counter = MutableRef.make(5)\n\n// Increment and get the new value\nconst newValue = MutableRef.incrementAndGet(counter)\nconsole.log(newValue) // 6\nconsole.log(MutableRef.get(counter)) // 6\n\n// Use in expressions\nconst score = MutableRef.make(100)\nconsole.log(`New score: ${MutableRef.incrementAndGet(score)}`) // \"New score: 101\"\n\n// Pre-increment semantics (like ++i in other languages)\nconst level = MutableRef.make(0)\nconst nextLevel = MutableRef.incrementAndGet(level)\nconsole.log(`Reached level ${nextLevel}`) // \"Reached level 1\"\n\n// Conditional logic based on incremented value\nconst attempts = MutableRef.make(0)\nif (MutableRef.incrementAndGet(attempts) > 3) {\n  console.log(\"Too many attempts\")\n}";
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
