/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/IdGenerator
 * Export: MakeOptions
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/IdGenerator.ts
 * Generated: 2026-02-19T04:14:23.883Z
 *
 * Overview:
 * Configuration options for creating custom ID generators.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { IdGenerator } from "effect/unstable/ai"
 * 
 * // Configuration for tool call IDs
 * const toolCallOptions: IdGenerator.MakeOptions = {
 *   alphabet: "0123456789ABCDEF",
 *   prefix: "tool",
 *   separator: "_",
 *   size: 8
 * }
 * 
 * // This will generate IDs like: "tool_A1B2C3D4"
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
import * as IdGeneratorModule from "effect/unstable/ai/IdGenerator";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "MakeOptions";
const exportKind = "interface";
const moduleImportPath = "effect/unstable/ai/IdGenerator";
const sourceSummary = "Configuration options for creating custom ID generators.";
const sourceExample = "import type { IdGenerator } from \"effect/unstable/ai\"\n\n// Configuration for tool call IDs\nconst toolCallOptions: IdGenerator.MakeOptions = {\n  alphabet: \"0123456789ABCDEF\",\n  prefix: \"tool\",\n  separator: \"_\",\n  size: 8\n}\n\n// This will generate IDs like: \"tool_A1B2C3D4\"";
const moduleRecord = IdGeneratorModule as Record<string, unknown>;

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
