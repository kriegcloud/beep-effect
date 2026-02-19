/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Prompt
 * Export: ToolMessage
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Prompt.ts
 * Generated: 2026-02-19T04:14:24.061Z
 *
 * Overview:
 * Message representing tool execution results.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Prompt } from "effect/unstable/ai"
 * 
 * const toolMessage: Prompt.ToolMessage = Prompt.makeMessage("tool", {
 *   content: [
 *     Prompt.makePart("tool-result", {
 *       id: "call_123",
 *       name: "search_web",
 *       isFailure: false,
 *       result: {
 *         query: "TypeScript best practices",
 *         results: [
 *           { title: "TypeScript Handbook", url: "https://..." },
 *           { title: "Effective TypeScript", url: "https://..." }
 *         ]
 *       }
 *     })
 *   ]
 * })
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
import * as PromptModule from "effect/unstable/ai/Prompt";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "ToolMessage";
const exportKind = "interface";
const moduleImportPath = "effect/unstable/ai/Prompt";
const sourceSummary = "Message representing tool execution results.";
const sourceExample = "import { Prompt } from \"effect/unstable/ai\"\n\nconst toolMessage: Prompt.ToolMessage = Prompt.makeMessage(\"tool\", {\n  content: [\n    Prompt.makePart(\"tool-result\", {\n      id: \"call_123\",\n      name: \"search_web\",\n      isFailure: false,\n      result: {\n        query: \"TypeScript best practices\",\n        results: [\n          { title: \"TypeScript Handbook\", url: \"https://...\" },\n          { title: \"Effective TypeScript\", url: \"https://...\" }\n        ]\n      }\n    })\n  ]\n})";
const moduleRecord = PromptModule as Record<string, unknown>;

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
