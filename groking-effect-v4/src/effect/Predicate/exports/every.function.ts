/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Predicate
 * Export: every
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Predicate.ts
 * Generated: 2026-02-19T04:14:15.911Z
 *
 * Overview:
 * Creates a predicate that returns `true` if all predicates in the collection return `true`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Predicate } from "effect"
 * 
 * const allChecks = Predicate.every([Predicate.isNumber, (n: number) => n > 0])
 * 
 * console.log(allChecks(2))
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
const exportName = "every";
const exportKind = "function";
const moduleImportPath = "effect/Predicate";
const sourceSummary = "Creates a predicate that returns `true` if all predicates in the collection return `true`.";
const sourceExample = "import { Predicate } from \"effect\"\n\nconst allChecks = Predicate.every([Predicate.isNumber, (n: number) => n > 0])\n\nconsole.log(allChecks(2))";
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
