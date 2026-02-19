/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableRef
 * Export: toggle
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableRef.ts
 * Generated: 2026-02-19T04:14:15.177Z
 *
 * Overview:
 * Toggles a boolean MutableRef (true becomes false, false becomes true) and returns the reference.
 *
 * Source JSDoc Example:
 * ```ts
 * import { MutableRef } from "effect"
 * 
 * const flag = MutableRef.make(false)
 * 
 * // Toggle the flag
 * MutableRef.toggle(flag)
 * console.log(MutableRef.get(flag)) // true
 * 
 * // Toggle again
 * MutableRef.toggle(flag)
 * console.log(MutableRef.get(flag)) // false
 * 
 * // Useful for state switches
 * const isVisible = MutableRef.make(true)
 * MutableRef.toggle(isVisible) // Hide
 * console.log(MutableRef.get(isVisible)) // false
 * 
 * // Toggle button implementation
 * const darkMode = MutableRef.make(false)
 * const toggleDarkMode = () => {
 *   MutableRef.toggle(darkMode)
 *   console.log(`Dark mode: ${MutableRef.get(darkMode) ? "ON" : "OFF"}`)
 * }
 * 
 * toggleDarkMode() // "Dark mode: ON"
 * toggleDarkMode() // "Dark mode: OFF"
 * 
 * // Returns the reference for chaining
 * const result = MutableRef.toggle(flag)
 * console.log(result === flag) // true
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
const exportName = "toggle";
const exportKind = "const";
const moduleImportPath = "effect/MutableRef";
const sourceSummary = "Toggles a boolean MutableRef (true becomes false, false becomes true) and returns the reference.";
const sourceExample = "import { MutableRef } from \"effect\"\n\nconst flag = MutableRef.make(false)\n\n// Toggle the flag\nMutableRef.toggle(flag)\nconsole.log(MutableRef.get(flag)) // true\n\n// Toggle again\nMutableRef.toggle(flag)\nconsole.log(MutableRef.get(flag)) // false\n\n// Useful for state switches\nconst isVisible = MutableRef.make(true)\nMutableRef.toggle(isVisible) // Hide\nconsole.log(MutableRef.get(isVisible)) // false\n\n// Toggle button implementation\nconst darkMode = MutableRef.make(false)\nconst toggleDarkMode = () => {\n  MutableRef.toggle(darkMode)\n  console.log(`Dark mode: ${MutableRef.get(darkMode) ? \"ON\" : \"OFF\"}`)\n}\n\ntoggleDarkMode() // \"Dark mode: ON\"\ntoggleDarkMode() // \"Dark mode: OFF\"\n\n// Returns the reference for chaining\nconst result = MutableRef.toggle(flag)\nconsole.log(result === flag) // true";
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
