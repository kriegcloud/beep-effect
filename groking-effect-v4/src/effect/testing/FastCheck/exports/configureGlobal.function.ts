/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/testing/FastCheck
 * Export: configureGlobal
 * Kind: function
 * Source: node_modules/fast-check/lib/types/check/runner/configuration/GlobalParameters.d.ts
 * Generated: 2026-02-19T04:50:43.243Z
 *
 * Overview:
 * Define global parameters that will be used by all the runners
 *
 * Source JSDoc Example:
 * ```ts
 * fc.configureGlobal({ numRuns: 10 });
 * //...
 * fc.assert(
 *   fc.property(
 *     fc.nat(), fc.nat(),
 *     (a, b) => a + b === b + a
 *   ), { seed: 42 }
 * ) // equivalent to { numRuns: 10, seed: 42 }
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as FastCheckModule from "effect/testing/FastCheck";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "configureGlobal";
const exportKind = "function";
const moduleImportPath = "effect/testing/FastCheck";
const sourceSummary = "Define global parameters that will be used by all the runners";
const sourceExample =
  "fc.configureGlobal({ numRuns: 10 });\n//...\nfc.assert(\n  fc.property(\n    fc.nat(), fc.nat(),\n    (a, b) => a + b === b + a\n  ), { seed: 42 }\n) // equivalent to { numRuns: 10, seed: 42 }";
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
  examples: [
    {
      title: "Function Discovery",
      description: "Inspect runtime shape and preview callable details.",
      run: exampleFunctionDiscovery,
    },
    {
      title: "Zero-Arg Invocation Probe",
      description: "Attempt invocation and report success/failure details.",
      run: exampleFunctionInvocation,
    },
  ],
});

BunRuntime.runMain(program);
