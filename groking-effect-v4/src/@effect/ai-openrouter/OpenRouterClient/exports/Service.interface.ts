/**
 * Export Playground
 *
 * Package: @effect/ai-openrouter
 * Module: @effect/ai-openrouter/OpenRouterClient
 * Export: Service
 * Kind: interface
 * Source: .repos/effect-smol/packages/ai/openrouter/src/OpenRouterClient.ts
 * Generated: 2026-02-19T04:13:59.127Z
 *
 * Overview:
 * The OpenRouter client service interface.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as OpenRouterClientModule from "@effect/ai-openrouter/OpenRouterClient";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Service";
const exportKind = "interface";
const moduleImportPath = "@effect/ai-openrouter/OpenRouterClient";
const sourceSummary = "The OpenRouter client service interface.";
const sourceExample = "";
const moduleRecord = OpenRouterClientModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection
    }
  ]
});

BunRuntime.runMain(program);
