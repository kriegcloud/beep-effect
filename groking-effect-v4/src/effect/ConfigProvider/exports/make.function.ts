/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/ConfigProvider
 * Export: make
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/ConfigProvider.ts
 * Generated: 2026-02-19T04:14:11.183Z
 *
 * Overview:
 * Creates a `ConfigProvider` from a raw lookup function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { ConfigProvider, Effect } from "effect"
 * 
 * const data: Record<string, string> = {
 *   host: "localhost",
 *   port: "5432"
 * }
 * 
 * const provider = ConfigProvider.make((path) => {
 *   const key = path.join(".")
 *   const value = data[key]
 *   return Effect.succeed(
 *     value !== undefined ? ConfigProvider.makeValue(value) : undefined
 *   )
 * })
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
const exportName = "make";
const exportKind = "function";
const moduleImportPath = "effect/ConfigProvider";
const sourceSummary = "Creates a `ConfigProvider` from a raw lookup function.";
const sourceExample = "import { ConfigProvider, Effect } from \"effect\"\n\nconst data: Record<string, string> = {\n  host: \"localhost\",\n  port: \"5432\"\n}\n\nconst provider = ConfigProvider.make((path) => {\n  const key = path.join(\".\")\n  const value = data[key]\n  return Effect.succeed(\n    value !== undefined ? ConfigProvider.makeValue(value) : undefined\n  )\n})";
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
