/**
 * Export Playground
 *
 * Package: @effect/ai-codegen
 * Module: @effect/ai-codegen/Discovery
 * Export: DiscoveredProvider
 * Kind: interface
 * Source: .repos/effect-smol/packages/tools/ai-codegen/src/Discovery.ts
 * Generated: 2026-02-19T04:13:34.659Z
 *
 * Overview:
 * A discovered AI provider with resolved paths.
 *
 * Source JSDoc Example:
 * ```ts
 * import type * as Discovery from "@effect/ai-codegen/Discovery"
 * 
 * declare const provider: Discovery.DiscoveredProvider
 * 
 * console.log(provider.name) // "openai"
 * console.log(provider.specSource._tag) // "Url" | "File"
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as DiscoveryModule from "@effect/ai-codegen/Discovery";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "DiscoveredProvider";
const exportKind = "interface";
const moduleImportPath = "@effect/ai-codegen/Discovery";
const sourceSummary = "A discovered AI provider with resolved paths.";
const sourceExample = "import type * as Discovery from \"@effect/ai-codegen/Discovery\"\n\ndeclare const provider: Discovery.DiscoveredProvider\n\nconsole.log(provider.name) // \"openai\"\nconsole.log(provider.specSource._tag) // \"Url\" | \"File\"";
const moduleRecord = DiscoveryModule as Record<string, unknown>;

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
