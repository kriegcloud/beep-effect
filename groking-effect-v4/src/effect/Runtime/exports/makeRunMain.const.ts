/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Runtime
 * Export: makeRunMain
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Runtime.ts
 * Generated: 2026-02-19T04:14:16.967Z
 *
 * Overview:
 * Creates a platform-specific main program runner that handles Effect execution lifecycle.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Fiber, Runtime } from "effect"
 * 
 * // Create a simple runner for a hypothetical platform
 * const runMain = Runtime.makeRunMain(({ fiber, teardown }) => {
 *   // Set up signal handling
 *   const handleSignal = () => {
 *     Effect.runSync(Fiber.interrupt(fiber))
 *   }
 * 
 *   // Add signal listeners (platform-specific)
 *   // process.on('SIGINT', handleSignal)
 *   // process.on('SIGTERM', handleSignal)
 * 
 *   // Handle fiber completion
 *   fiber.addObserver((exit) => {
 *     teardown(exit, (code) => {
 *       console.log(`Program finished with exit code: ${code}`)
 *       // process.exit(code)
 *     })
 *   })
 * })
 * 
 * // Use the runner
 * const program = Effect.gen(function*() {
 *   yield* Effect.log("Starting program")
 *   yield* Effect.sleep(1000)
 *   yield* Effect.log("Program completed")
 *   return "success"
 * })
 * 
 * // Run with default options
 * runMain(program)
 * 
 * // Run with custom teardown
 * runMain(program, {
 *   teardown: (exit, onExit) => {
 *     console.log("Custom teardown logic")
 *     Runtime.defaultTeardown(exit, onExit)
 *   }
 * })
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
import * as RuntimeModule from "effect/Runtime";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "makeRunMain";
const exportKind = "const";
const moduleImportPath = "effect/Runtime";
const sourceSummary = "Creates a platform-specific main program runner that handles Effect execution lifecycle.";
const sourceExample = "import { Effect, Fiber, Runtime } from \"effect\"\n\n// Create a simple runner for a hypothetical platform\nconst runMain = Runtime.makeRunMain(({ fiber, teardown }) => {\n  // Set up signal handling\n  const handleSignal = () => {\n    Effect.runSync(Fiber.interrupt(fiber))\n  }\n\n  // Add signal listeners (platform-specific)\n  // process.on('SIGINT', handleSignal)\n  // process.on('SIGTERM', handleSignal)\n\n  // Handle fiber completion\n  fiber.addObserver((exit) => {\n    teardown(exit, (code) => {\n      console.log(`Program finished with exit code: ${code}`)\n      // process.exit(code)\n    })\n  })\n})\n\n// Use the runner\nconst program = Effect.gen(function*() {\n  yield* Effect.log(\"Starting program\")\n  yield* Effect.sleep(1000)\n  yield* Effect.log(\"Program completed\")\n  return \"success\"\n})\n\n// Run with default options\nrunMain(program)\n\n// Run with custom teardown\nrunMain(program, {\n  teardown: (exit, onExit) => {\n    console.log(\"Custom teardown logic\")\n    Runtime.defaultTeardown(exit, onExit)\n  }\n})";
const moduleRecord = RuntimeModule as Record<string, unknown>;

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
