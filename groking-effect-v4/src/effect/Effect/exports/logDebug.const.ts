/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: logDebug
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.390Z
 *
 * Overview:
 * Logs one or more messages at the DEBUG level.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   yield* Effect.logDebug("Debug mode enabled")
 * 
 *   const userInput = { name: "Alice", age: 30 }
 *   yield* Effect.logDebug("Processing user input:", userInput)
 * 
 *   // Useful for detailed diagnostic information
 *   yield* Effect.logDebug("Variable state:", "x=10", "y=20", "z=30")
 * })
 * 
 * Effect.runPromise(program)
 * // Output:
 * // timestamp=2023-... level=DEBUG message="Debug mode enabled"
 * // timestamp=2023-... level=DEBUG message="Processing user input: [object Object]"
 * // timestamp=2023-... level=DEBUG message="Variable state: x=10 y=20 z=30"
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
import * as EffectModule from "effect/Effect";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "logDebug";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Logs one or more messages at the DEBUG level.";
const sourceExample = "import { Effect } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  yield* Effect.logDebug(\"Debug mode enabled\")\n\n  const userInput = { name: \"Alice\", age: 30 }\n  yield* Effect.logDebug(\"Processing user input:\", userInput)\n\n  // Useful for detailed diagnostic information\n  yield* Effect.logDebug(\"Variable state:\", \"x=10\", \"y=20\", \"z=30\")\n})\n\nEffect.runPromise(program)\n// Output:\n// timestamp=2023-... level=DEBUG message=\"Debug mode enabled\"\n// timestamp=2023-... level=DEBUG message=\"Processing user input: [object Object]\"\n// timestamp=2023-... level=DEBUG message=\"Variable state: x=10 y=20 z=30\"";
const moduleRecord = EffectModule as Record<string, unknown>;

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
