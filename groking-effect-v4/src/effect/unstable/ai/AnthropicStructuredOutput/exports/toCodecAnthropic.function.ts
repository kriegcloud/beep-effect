/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/AnthropicStructuredOutput
 * Export: toCodecAnthropic
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/AnthropicStructuredOutput.ts
 * Generated: 2026-02-19T04:50:45.157Z
 *
 * Overview:
 * Transforms a `Schema.Codec` into a form compatible with Anthropic's structured output constraints.
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
import * as AnthropicStructuredOutputModule from "effect/unstable/ai/AnthropicStructuredOutput";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "toCodecAnthropic";
const exportKind = "function";
const moduleImportPath = "effect/unstable/ai/AnthropicStructuredOutput";
const sourceSummary =
  "Transforms a `Schema.Codec` into a form compatible with Anthropic's structured output constraints.";
const sourceExample = "";
const moduleRecord = AnthropicStructuredOutputModule as Record<string, unknown>;

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
