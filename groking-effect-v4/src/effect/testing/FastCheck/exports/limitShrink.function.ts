/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/testing/FastCheck
 * Export: limitShrink
 * Kind: function
 * Source: node_modules/fast-check/lib/types/arbitrary/limitShrink.d.ts
 * Generated: 2026-02-19T04:14:22.331Z
 *
 * Overview:
 * Create another Arbitrary with a limited (or capped) number of shrink values
 *
 * Source JSDoc Example:
 * ```ts
 * const dataGenerator: Arbitrary<string> = ...;
 * const limitedShrinkableDataGenerator: Arbitrary<string> = fc.limitShrink(dataGenerator, 10);
 * // up to 10 shrunk values could be extracted from the resulting arbitrary
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as FastCheckModule from "effect/testing/FastCheck";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "limitShrink";
const exportKind = "function";
const moduleImportPath = "effect/testing/FastCheck";
const sourceSummary = "Create another Arbitrary with a limited (or capped) number of shrink values";
const sourceExample = "const dataGenerator: Arbitrary<string> = ...;\nconst limitedShrinkableDataGenerator: Arbitrary<string> = fc.limitShrink(dataGenerator, 10);\n// up to 10 shrunk values could be extracted from the resulting arbitrary";
const moduleRecord = FastCheckModule as Record<string, unknown>;

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
