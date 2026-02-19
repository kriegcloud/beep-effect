/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/ConfigProvider
 * Export: makeArray
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/ConfigProvider.ts
 * Generated: 2026-02-19T04:14:11.183Z
 *
 * Overview:
 * Creates an `Array` node representing an indexed container with a known length.
 *
 * Source JSDoc Example:
 * ```ts
 * import { ConfigProvider } from "effect"
 * 
 * const node = ConfigProvider.makeArray(3)
 * // { _tag: "Array", length: 3, value: undefined }
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ConfigProviderModule from "effect/ConfigProvider";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "makeArray";
const exportKind = "function";
const moduleImportPath = "effect/ConfigProvider";
const sourceSummary = "Creates an `Array` node representing an indexed container with a known length.";
const sourceExample = "import { ConfigProvider } from \"effect\"\n\nconst node = ConfigProvider.makeArray(3)\n// { _tag: \"Array\", length: 3, value: undefined }";
const moduleRecord = ConfigProviderModule as Record<string, unknown>;

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
