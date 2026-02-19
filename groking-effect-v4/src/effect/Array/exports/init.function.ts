/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: init
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:14:09.703Z
 *
 * Overview:
 * Returns all elements except the last, or `undefined` if the array is empty.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 * 
 * console.log(Array.init([1, 2, 3, 4])) // [1, 2, 3]
 * console.log(Array.init([])) // undefined
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ArrayModule from "effect/Array";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "init";
const exportKind = "function";
const moduleImportPath = "effect/Array";
const sourceSummary = "Returns all elements except the last, or `undefined` if the array is empty.";
const sourceExample = "import { Array } from \"effect\"\n\nconsole.log(Array.init([1, 2, 3, 4])) // [1, 2, 3]\nconsole.log(Array.init([])) // undefined";
const moduleRecord = ArrayModule as Record<string, unknown>;

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
