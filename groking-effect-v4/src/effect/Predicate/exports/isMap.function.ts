/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Predicate
 * Export: isMap
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Predicate.ts
 * Generated: 2026-02-19T04:14:15.912Z
 *
 * Overview:
 * Checks whether a value is a `Map`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Predicate } from "effect"
 * 
 * const data: unknown = new Map([["a", 1]])
 * 
 * if (Predicate.isMap(data)) {
 *   console.log(data.size)
 * }
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as PredicateModule from "effect/Predicate";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "isMap";
const exportKind = "function";
const moduleImportPath = "effect/Predicate";
const sourceSummary = "Checks whether a value is a `Map`.";
const sourceExample = "import { Predicate } from \"effect\"\n\nconst data: unknown = new Map([[\"a\", 1]])\n\nif (Predicate.isMap(data)) {\n  console.log(data.size)\n}";
const moduleRecord = PredicateModule as Record<string, unknown>;

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
