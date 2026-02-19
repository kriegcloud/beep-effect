/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/ConfigProvider
 * Export: fromDotEnvContents
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/ConfigProvider.ts
 * Generated: 2026-02-19T04:50:34.513Z
 *
 * Overview:
 * Creates a `ConfigProvider` by parsing the string contents of a `.env` file.
 *
 * Source JSDoc Example:
 * ```ts
 * import { ConfigProvider } from "effect"
 *
 * const contents = `
 * HOST=localhost
 * PORT=3000
 * # this is a comment
 * `
 *
 * const provider = ConfigProvider.fromDotEnvContents(contents)
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
import * as ConfigProviderModule from "effect/ConfigProvider";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fromDotEnvContents";
const exportKind = "function";
const moduleImportPath = "effect/ConfigProvider";
const sourceSummary = "Creates a `ConfigProvider` by parsing the string contents of a `.env` file.";
const sourceExample =
  'import { ConfigProvider } from "effect"\n\nconst contents = `\nHOST=localhost\nPORT=3000\n# this is a comment\n`\n\nconst provider = ConfigProvider.fromDotEnvContents(contents)';
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
