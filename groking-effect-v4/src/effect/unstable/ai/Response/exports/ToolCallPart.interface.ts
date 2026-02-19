/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Response
 * Export: ToolCallPart
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Response.ts
 * Generated: 2026-02-19T04:14:24.102Z
 *
 * Overview:
 * Response part representing a tool call request.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schema } from "effect"
 * import { Response } from "effect/unstable/ai"
 * 
 * const weatherParams = Schema.Struct({
 *   city: Schema.String,
 *   units: Schema.optional(Schema.Literals(["celsius", "fahrenheit"]))
 * })
 * 
 * const toolCallPart: Response.ToolCallPart<
 *   "get_weather",
 *   {
 *     readonly city: string
 *     readonly units?: "celsius" | "fahrenheit"
 *   }
 * > = Response.makePart("tool-call", {
 *   id: "call_123",
 *   name: "get_weather",
 *   params: { city: "San Francisco", units: "celsius" },
 *   providerExecuted: false
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
import * as ResponseModule from "effect/unstable/ai/Response";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "ToolCallPart";
const exportKind = "interface";
const moduleImportPath = "effect/unstable/ai/Response";
const sourceSummary = "Response part representing a tool call request.";
const sourceExample = "import { Schema } from \"effect\"\nimport { Response } from \"effect/unstable/ai\"\n\nconst weatherParams = Schema.Struct({\n  city: Schema.String,\n  units: Schema.optional(Schema.Literals([\"celsius\", \"fahrenheit\"]))\n})\n\nconst toolCallPart: Response.ToolCallPart<\n  \"get_weather\",\n  {\n    readonly city: string\n    readonly units?: \"celsius\" | \"fahrenheit\"\n  }\n> = Response.makePart(\"tool-call\", {\n  id: \"call_123\",\n  name: \"get_weather\",\n  params: { city: \"San Francisco\", units: \"celsius\" },\n  providerExecuted: false\n})";
const moduleRecord = ResponseModule as Record<string, unknown>;

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
