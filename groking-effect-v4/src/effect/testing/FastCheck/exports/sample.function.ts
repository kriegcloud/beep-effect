/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/testing/FastCheck
 * Export: sample
 * Kind: function
 * Source: node_modules/fast-check/lib/types/check/runner/Sampler.d.ts
 * Generated: 2026-02-19T04:14:22.333Z
 *
 * Overview:
 * Generate an array containing all the values that would have been generated during {@link assert} or {@link check}
 *
 * Source JSDoc Example:
 * ```ts
 * fc.sample(fc.nat(), 10); // extract 10 values from fc.nat() Arbitrary
 * fc.sample(fc.nat(), {seed: 42}); // extract values from fc.nat() as if we were running fc.assert with seed=42
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
const exportName = "sample";
const exportKind = "function";
const moduleImportPath = "effect/testing/FastCheck";
const sourceSummary = "Generate an array containing all the values that would have been generated during {@link assert} or {@link check}";
const sourceExample = "fc.sample(fc.nat(), 10); // extract 10 values from fc.nat() Arbitrary\nfc.sample(fc.nat(), {seed: 42}); // extract values from fc.nat() as if we were running fc.assert with seed=42";
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
