/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Function
 * Export: pipe
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Function.ts
 * Generated: 2026-02-19T04:14:13.309Z
 *
 * Overview:
 * Pipes the value of an expression into a pipeline of functions.
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe } from "effect"
 * 
 * // Define simple arithmetic operations
 * const increment = (x: number) => x + 1
 * const double = (x: number) => x * 2
 * const subtractTen = (x: number) => x - 10
 * 
 * // Sequentially apply these operations using `pipe`
 * const result = pipe(5, increment, double, subtractTen)
 * 
 * console.log(result)
 * // Output: 2
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as FunctionModule from "effect/Function";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "pipe";
const exportKind = "function";
const moduleImportPath = "effect/Function";
const sourceSummary = "Pipes the value of an expression into a pipeline of functions.";
const sourceExample = "import { pipe } from \"effect\"\n\n// Define simple arithmetic operations\nconst increment = (x: number) => x + 1\nconst double = (x: number) => x * 2\nconst subtractTen = (x: number) => x - 10\n\n// Sequentially apply these operations using `pipe`\nconst result = pipe(5, increment, double, subtractTen)\n\nconsole.log(result)\n// Output: 2";
const moduleRecord = FunctionModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleFunctionDiscovery = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata before attempting invocation.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleFunctionInvocation = Effect.gen(function* () {
  yield* Console.log("Execute a safe zero-arg invocation probe.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧪",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Function Discovery",
      description: "Inspect runtime shape and preview callable details.",
      run: exampleFunctionDiscovery
    },
    {
      title: "Zero-Arg Invocation Probe",
      description: "Attempt invocation and report success/failure details.",
      run: exampleFunctionInvocation
    }
  ]
});

BunRuntime.runMain(program);
