/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/OpenAiStructuredOutput
 * Export: toCodecOpenAI
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/OpenAiStructuredOutput.ts
 * Generated: 2026-02-19T04:50:45.570Z
 *
 * Overview:
 * Transforms a `Schema.Codec` into a form compatible with OpenAI's structured output constraints.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
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
import * as OpenAiStructuredOutputModule from "effect/unstable/ai/OpenAiStructuredOutput";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "toCodecOpenAI";
const exportKind = "function";
const moduleImportPath = "effect/unstable/ai/OpenAiStructuredOutput";
const sourceSummary = "Transforms a `Schema.Codec` into a form compatible with OpenAI's structured output constraints.";
const sourceExample = "";
const moduleRecord = OpenAiStructuredOutputModule as Record<string, unknown>;

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
